import 'server-only';

import { KeyMetrics, QuickMetric, RiskMetric, StockDashboardData } from '@/interfaces';
import YahooFinance from 'yahoo-finance2';
import { HistoricalHistoryResult, HistoricalRowHistory } from 'yahoo-finance2/modules/historical';
import { ChartResultArrayQuote } from 'yahoo-finance2/modules/chart';
import { QuoteSummaryResult } from 'yahoo-finance2/modules/quoteSummary-iface';

const yahooFinance = new YahooFinance();

const DASHBOARD_QUOTE_SUMMARY_MODULES = [
  'assetProfile',
  'price',
  'summaryDetail',
  'financialData',
  'defaultKeyStatistics',
] as const;

const ONE_YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function safePercentage(value: number | null): number | null {
  return value === null ? null : value * 100;
}

function getCurrency(summary: QuoteSummaryResult): string {
  return (
    summary.price?.currency ??
    summary.summaryDetail?.currency ??
    summary.financialData?.financialCurrency ??
    'USD'
  );
}

function getValidPriceHistory(history: HistoricalHistoryResult | null): HistoricalRowHistory[] {
  if (!history?.length) {
    return [];
  }

  return [...history]
    .filter(
      (item: HistoricalRowHistory) =>
        item.date instanceof Date && typeof item.close === 'number' && Number.isFinite(item.close),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function calculateYtdReturn(history: HistoricalHistoryResult | null): number | null {
  const sortedHistory = getValidPriceHistory(history);

  if (!sortedHistory.length) {
    return null;
  }

  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  const startPoint =
    sortedHistory.find((item: HistoricalRowHistory) => item.date.getTime() >= yearStart) ??
    sortedHistory[0] ??
    null;
  const endPoint = sortedHistory[sortedHistory.length - 1] ?? null;

  if (!startPoint?.close || !endPoint?.close) {
    return null;
  }

  return ((endPoint.close - startPoint.close) / startPoint.close) * 100;
}

function calculateVolatility(history: HistoricalHistoryResult | null): number | null {
  const closes = getValidPriceHistory(history).map((item: HistoricalRowHistory) => item.close);

  if (closes.length < 2) {
    return null;
  }

  const returns = closes
    .slice(1)
    .map((price: number, index: number) => (price - closes[index]) / closes[index]);
  const mean = returns.reduce((sum: number, value: number) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum: number, value: number) => sum + (value - mean) ** 2, 0) / returns.length;

  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

function calculateMaxDrawdown(history: HistoricalHistoryResult | null): number | null {
  const closes = getValidPriceHistory(history).map((item: HistoricalRowHistory) => item.close);

  if (!closes.length) {
    return null;
  }

  let peak = closes[0];
  let maxDrawdown = 0;

  for (const close of closes) {
    if (close > peak) {
      peak = close;
    }

    const drawdown = (close - peak) / peak;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown * 100;
}

async function getDashboardQuoteSummary(symbol: string): Promise<QuoteSummaryResult> {
  return yahooFinance.quoteSummary(symbol, {
    modules: [...DASHBOARD_QUOTE_SUMMARY_MODULES],
  });
}

async function getHistory(symbol: string): Promise<HistoricalHistoryResult | null> {
  try {
    const chart = await yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 2 * ONE_YEAR_IN_MS),
      period2: new Date(),
      interval: '1d',
    });

    return (chart.quotes ?? [])
      .filter(
        (quote: ChartResultArrayQuote) =>
          quote.date instanceof Date &&
          typeof quote.open === 'number' &&
          typeof quote.high === 'number' &&
          typeof quote.low === 'number' &&
          typeof quote.close === 'number' &&
          typeof quote.volume === 'number',
      )
      .map(
        (quote: ChartResultArrayQuote): HistoricalRowHistory => ({
          date: quote.date,
          open: quote.open as number,
          high: quote.high as number,
          low: quote.low as number,
          close: quote.close as number,
          volume: quote.volume as number,
          adjClose: typeof quote.adjclose === 'number' ? quote.adjclose : undefined,
        }),
      );
  } catch {
    return null;
  }
}

function formatMetricValue(value: number | null, format: string, unit?: string | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }

  let formattedValue: string;

  switch (format) {
    case 'currency':
      formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: unit || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      break;

    case 'currencyCompact':
      formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: unit || 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
      break;

    case 'compact':
      formattedValue = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
      break;

    case 'percentage':
      formattedValue = `${value.toFixed(2)}%`;
      break;

    case 'number':
    default:
      formattedValue = value.toFixed(2);
      break;
  }

  return unit && !['currency', 'currencyCompact'].includes(format)
    ? `${formattedValue} ${unit}`
    : formattedValue;
}

function buildQuickMetrics(
  summary: QuoteSummaryResult,
  history: HistoricalHistoryResult | null,
): QuickMetric | null {
  const currency = getCurrency(summary);

  return {
    keyMetrics: [
      {
        label: 'Current Price',
        value: formatMetricValue(asNumber(summary.price?.regularMarketPrice), 'currency', currency),
      },
      {
        label: 'Market Cap',
        value: formatMetricValue(asNumber(summary.price?.marketCap), 'currencyCompact', currency),
      },
      {
        label: 'P/E Ratio',
        value: formatMetricValue(asNumber(summary.summaryDetail?.trailingPE), 'number'),
      },
      {
        label: '52W High',
        value: formatMetricValue(
          asNumber(summary.summaryDetail?.fiftyTwoWeekHigh),
          'currency',
          currency,
        ),
      },
      {
        label: '52W Low',
        value: formatMetricValue(
          asNumber(summary.summaryDetail?.fiftyTwoWeekLow),
          'currency',
          currency,
        ),
      },
      {
        label: 'Avg Volume',
        value: formatMetricValue(asNumber(summary.summaryDetail?.averageVolume), 'compact'),
      },
      {
        label: 'Dividend Yield',
        value: formatMetricValue(
          safePercentage(asNumber(summary.summaryDetail?.dividendYield)),
          'percentage',
        ),
      },
      {
        label: 'YTD Return',
        value: formatMetricValue(calculateYtdReturn(history), 'percentage'),
      },
    ],
    name: summary.price?.longName ?? summary.price?.shortName ?? null,
    description:
      summary.assetProfile?.longBusinessSummary ?? summary.assetProfile?.description ?? null,
  };
}

function buildRiskMetrics(
  summary: QuoteSummaryResult,
  history: HistoricalHistoryResult | null,
): RiskMetric[] {
  const totalDebt = asNumber(summary.financialData?.totalDebt);
  const marketCap = asNumber(summary.price?.marketCap);
  const debtBurden = totalDebt !== null && marketCap ? (totalDebt / marketCap) * 100 : null;

  return [
    {
      label: 'Beta',
      value: formatMetricValue(asNumber(summary.defaultKeyStatistics?.beta), 'number'),
      description:
        'Measures how volatile the stock is compared to the overall market. Beta above 1 usually means larger swings than the index.',
    },
    {
      label: 'Volatility (1Y)',
      value: formatMetricValue(calculateVolatility(history), 'percentage'),
      description:
        'Annualized share-price volatility over the last year based on daily price changes.',
    },
    {
      label: 'Max Drawdown (1Y)',
      value: formatMetricValue(calculateMaxDrawdown(history), 'percentage'),
      description:
        'Largest peak-to-trough decline in the last year, useful for understanding downside risk.',
    },
    {
      label: 'Debt Burden',
      value: formatMetricValue(debtBurden, 'percentage'),
      description:
        'Total debt as a share of market capitalization. Higher values indicate more balance-sheet pressure.',
    },
  ];
}

function buildKeyMetrics(
  symbol: string,
  summary: QuoteSummaryResult,
  history: HistoricalHistoryResult | null,
): KeyMetrics {
  const currency = getCurrency(summary);

  return {
    header: {
      symbol: summary.price?.symbol ?? symbol,
      name: summary.price?.longName ?? summary.price?.shortName ?? null,
      exchange: summary.price?.exchangeName ?? null,
    },
    keyMetrics: [
      {
        label: 'Current Price',
        value: asNumber(summary.price?.regularMarketPrice),
        unit: currency,
        format: 'currency',
      },
      {
        label: 'Market Cap',
        value: asNumber(summary.price?.marketCap),
        unit: currency,
        format: 'currencyCompact',
      },
      {
        label: 'Trailing P/E',
        value: asNumber(summary.summaryDetail?.trailingPE),
        format: 'number',
      },
      {
        label: 'Forward P/E',
        value: asNumber(summary.summaryDetail?.forwardPE),
        format: 'number',
      },
      {
        label: '52W High',
        value: asNumber(summary.summaryDetail?.fiftyTwoWeekHigh),
        unit: currency,
        format: 'currency',
      },
      {
        label: '52W Low',
        value: asNumber(summary.summaryDetail?.fiftyTwoWeekLow),
        unit: currency,
        format: 'currency',
      },
      {
        label: 'YTD Return',
        value: calculateYtdReturn(history),
        unit: '%',
        format: 'percentage',
      },
    ],
    fundamentals: [
      {
        label: 'Revenue (TTM)',
        value: asNumber(summary.financialData?.totalRevenue),
        unit: currency,
        format: 'currencyCompact',
      },
      {
        label: 'EBITDA',
        value: asNumber(summary.financialData?.ebitda),
        unit: currency,
        format: 'currencyCompact',
      },
      {
        label: 'Free Cash Flow',
        value: asNumber(summary.financialData?.freeCashflow),
        unit: currency,
        format: 'currencyCompact',
      },
      {
        label: 'Operating Margin',
        value: safePercentage(asNumber(summary.financialData?.operatingMargins)),
        unit: '%',
        format: 'percentage',
      },
      {
        label: 'Profit Margin',
        value: safePercentage(asNumber(summary.financialData?.profitMargins)),
        unit: '%',
        format: 'percentage',
      },
      {
        label: 'Debt / Equity',
        value: asNumber(summary.financialData?.debtToEquity),
        format: 'number',
      },
      {
        label: 'Current Ratio',
        value: asNumber(summary.financialData?.currentRatio),
        format: 'number',
      },
      {
        label: 'Return on Equity',
        value: safePercentage(asNumber(summary.financialData?.returnOnEquity)),
        unit: '%',
        format: 'percentage',
      },
    ],
    riskMetrics: [
      {
        label: 'Beta',
        value: asNumber(summary.defaultKeyStatistics?.beta),
        format: 'number',
        description:
          'Measures how volatile the stock is compared to the overall market. Beta above 1 usually means larger swings than the index.',
      },
      {
        label: 'Volatility (1Y)',
        value: calculateVolatility(history),
        unit: '%',
        format: 'percentage',
        description:
          'Annualized share-price volatility over the last year based on daily price changes.',
      },
      {
        label: 'Max Drawdown (1Y)',
        value: calculateMaxDrawdown(history),
        unit: '%',
        format: 'percentage',
        description:
          'Largest peak-to-trough decline in the last year, useful for understanding downside risk.',
      },
      {
        label: 'Debt / Equity',
        value: asNumber(summary.financialData?.debtToEquity),
        format: 'number',
        description:
          'Compares total debt to shareholder equity. Higher values can mean a more leveraged balance sheet.',
      },
    ],
    companyProfile: {
      description:
        summary.assetProfile?.longBusinessSummary ?? summary.assetProfile?.description ?? null,
      sector: summary.assetProfile?.sector ?? null,
      industry: summary.assetProfile?.industry ?? null,
      country: summary.assetProfile?.country ?? null,
      name: summary.price?.longName ?? summary.price?.shortName ?? null,
      website: summary.assetProfile?.website ?? null,
      exchange: summary.price?.exchangeName ?? null,
      employees: asNumber(summary.assetProfile?.fullTimeEmployees),
    },
  };
}

export async function getDashboardData(symbol: string): Promise<StockDashboardData> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const [summary, chartData] = await Promise.all([
    getDashboardQuoteSummary(normalizedSymbol),
    getHistory(normalizedSymbol),
  ]);

  return {
    keyMetrics: buildKeyMetrics(normalizedSymbol, summary, chartData),
    chartData,
    quickMetrics: buildQuickMetrics(summary, chartData),
    riskMetrics: buildRiskMetrics(summary, chartData),
  };
}
