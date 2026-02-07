import 'server-only';
import {
  BasicStockInfo,
  KeyMetrics,
  Metric,
  QuickMetric,
  RiskMetric,
} from '@/interfaces';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function getStockDashboardData(
  symbol: string,
  API_KEY: string,
  BASE: string,
): Promise<KeyMetrics> {
  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json?.Note || json?.Error || Object.keys(json).length === 0) {
        return null;
      }
      return json;
    } catch {
      return null;
    }
  };

  // -----------------------------
  // 1. Fetch all endpoints safely
  // -----------------------------
  const [overview, prices, income, balance, cashflow] = await Promise.all([
    safeFetch(`${BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`),
    safeFetch(
      `${BASE}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`,
    ),
    safeFetch(
      `${BASE}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`,
    ),
    safeFetch(
      `${BASE}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${API_KEY}`,
    ),
    safeFetch(`${BASE}?function=CASH_FLOW&symbol=${symbol}&apikey=${API_KEY}`),
  ]);

  const timeSeries = prices?.['Time Series (Daily)'] ?? null;
  const incomeQ = income?.quarterlyReports ?? null;
  const balanceQ = balance?.quarterlyReports ?? null;
  const cashflowQ = cashflow?.quarterlyReports ?? null;

  // -----------------------------
  // 2. Safe helpers
  // -----------------------------
  const safeNumber = (v: any) =>
    v === undefined || v === null || v === 'None' ? null : Number(v);

  const ttm = (reports: any[] | null, field: string) => {
    if (!reports || reports.length < 4) return null;
    return reports.slice(0, 4).reduce((s, r) => s + safeNumber(r[field])!, 0);
  };

  const calcYTD = () => {
    if (!timeSeries) return null;
    const entries = Object.entries(timeSeries);
    //@ts-ignore
    const current = safeNumber(entries[0][1]['4. close']);
    const jan = entries.find(([d]) =>
      d.startsWith(new Date().getFullYear().toString()),
    );
    if (!current || !jan) return null;
    //@ts-ignore
    const janPrice = safeNumber(jan[1]['4. close']);
    return janPrice ? ((current - janPrice) / janPrice) * 100 : null;
  };

  const calcVolatility = () => {
    if (!timeSeries) return null;
    const prices = Object.values(timeSeries)
      .slice(0, 252)
      .map((d: any) => safeNumber(d['4. close']))
      .filter(Boolean) as number[];
    if (prices.length < 2) return null;
    const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    return (
      Math.sqrt(
        returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length,
      ) * 100
    );
  };

  const calcMaxDrawdown = () => {
    if (!timeSeries) return null;
    const prices = Object.values(timeSeries)
      .slice(0, 252)
      .map((d: any) => safeNumber(d['4. close']))
      .filter(Boolean)
      .reverse() as number[];
    if (!prices.length) return null;
    let peak = prices[0];
    let max = 0;
    for (const p of prices) {
      if (p > peak) peak = p;
      max = Math.min(max, (p - peak) / peak);
    }
    return max * 100;
  };

  // -----------------------------
  // 3. UI-ready response
  // -----------------------------
  return {
    header: {
      symbol,
      name: overview?.Name ?? null,
      exchange: overview?.Exchange ?? null,
    },

    keyMetrics: [
      {
        label: 'Market Cap',
        value: safeNumber(overview?.MarketCapitalization),
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        label: 'P/E Ratio',
        value: safeNumber(overview?.PERatio),
        format: 'number',
      },
      {
        label: '52W High',
        value: safeNumber(overview?.['52WeekHigh']),
        unit: 'USD',
        format: 'currency',
      },
      {
        label: '52W Low',
        value: safeNumber(overview?.['52WeekLow']),
        unit: 'USD',
        format: 'currency',
      },
      {
        label: 'Avg Volume',
        value: safeNumber(overview?.AverageVolume),
        format: 'compact',
      },
      {
        label: 'EPS (TTM)',
        value: safeNumber(overview?.EPS),
        unit: 'USD',
        format: 'currency',
      },
      {
        label: 'YTD Return',
        value: calcYTD(),
        unit: '%',
        format: 'percentage',
      },
    ],

    fundamentals: [
      {
        label: 'Revenue (TTM)',
        value: ttm(incomeQ, 'totalRevenue'),
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        label: 'Net Income (TTM)',
        value: ttm(incomeQ, 'netIncome'),
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        label: 'Free Cash Flow',
        value: cashflowQ
          ? ttm(cashflowQ, 'operatingCashflow')! -
            ttm(cashflowQ, 'capitalExpenditures')!
          : null,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        label: 'Operating Margin',
        value: incomeQ
          ? (ttm(incomeQ, 'operatingIncome')! / ttm(incomeQ, 'totalRevenue')!) *
            100
          : null,
        unit: '%',
        format: 'percentage',
      },
      {
        label: 'Debt / Equity',
        value: balanceQ
          ? safeNumber(balanceQ[0]?.totalLiabilities)! /
            safeNumber(balanceQ[0]?.totalShareholderEquity)!
          : null,
        format: 'number',
      },
    ],

    riskMetrics: [
      {
        label: 'Beta',
        value: safeNumber(overview?.Beta),
        format: 'number',
        description:
          'Measures how volatile the stock is compared to the overall market. Beta > 1 means higher risk.',
      },
      {
        label: 'Volatility (1Y)',
        value: calcVolatility(),
        unit: '%',
        format: 'percentage',
        description:
          'Annualized price fluctuation over the past year. Higher volatility means larger price swings.',
      },
      {
        label: 'Max Drawdown (1Y)',
        value: calcMaxDrawdown(),
        unit: '%',
        format: 'percentage',
        description:
          'Maximum observed loss from peak to trough over the past year.',
      },
      {
        label: 'Debt Ratio',
        value: balanceQ
          ? safeNumber(balanceQ[0]?.totalLiabilities)! /
            safeNumber(balanceQ[0]?.totalAssets)!
          : null,
        format: 'number',
        description:
          'Proportion of assets financed by debt. Higher values indicate higher financial leverage.',
      },
    ],

    companyProfile: {
      description: overview?.Description ?? null,
      sector: overview?.Sector ?? null,
      industry: overview?.Industry ?? null,
      country: overview?.Country ?? null,
      name: overview?.Name ?? null,
    },
  };
}

export async function getHistory(symbol: string) {
  try {
    return await yahooFinance.historical(symbol, {
      period1: '2023-01-01',
      period2: new Date(),
      interval: '1d',
    });
  } catch (error) {
    return null;
  }
}

export async function getBasicInfo(
  symbol: string,
): Promise<BasicStockInfo | null> {
  try {
    const quote = await yahooFinance.quote(symbol);
console.log(quote);
    if (!quote) {
      return null;
    }

    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || null,
      price: quote.regularMarketPrice || null,
      currency: quote.currency || 'USD',
      exchange: quote.exchange || null,
      marketCap: quote.marketCap || null,
      trailingPE: quote.trailingPE || null,
      forwardPE: quote.forwardPE || null,
      eps: quote.trailingEps || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
      fiftyDayAverage: quote.fiftyDayAverage || null,
      twoHundredDayAverage: quote.twoHundredDayAverage || null,
      avgVolume: quote.averageVolume || null,
      beta: quote.beta || null,
      sector: quote.sector || null,
      industry: quote.industry || null,
      website: quote.website || null,
      description: quote.longBusinessSummary || null,
    };
  } catch (error) {
    return null;
  }
}

export async function getQuickMetrics(
  symbol: string,
): Promise<QuickMetric | null> {
  try {
    const info = await getBasicInfo(symbol);
    
    
    if (!info) {
      return null;
    }

    return {
      keyMetrics: [
        {
          label: 'Market Cap',
          value: formatMetricValue(info.marketCap, 'currencyCompact', 'USD'),
        },
        {
          label: 'P/E Ratio',
          value: formatMetricValue(info.trailingPE, 'number'),
        },
        {
          label: '52W High',
          value: formatMetricValue(info.fiftyTwoWeekHigh, 'currency', 'USD'),
        },
        {
          label: '52W Low',
          value: formatMetricValue(info.fiftyTwoWeekLow, 'currency', 'USD'),
        },
        {
          label: 'Avg Volume',
          value: formatMetricValue(info.avgVolume, 'compact'),
        },
        {
          label: 'EPS (TTM)',
          value: formatMetricValue(info.eps, 'currency', 'USD'),
        },
      ],
      name: info.name,
      description: info.description,
    };
  } catch (error) {
    return null;
  }
}

export function formatMetricValue(
  value: number | null,
  format: string,
  unit?: string,
): string {
  if (value === null || value === undefined) {
    return '';
  }

  let formattedValue: string;

  switch (format) {
    case 'currency':
      formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      break;

    case 'currencyCompact':
      if (value >= 1e12) {
        formattedValue = `$${(value / 1e12).toFixed(2)}T`;
      } else if (value >= 1e9) {
        formattedValue = `$${(value / 1e9).toFixed(2)}B`;
      } else if (value >= 1e6) {
        formattedValue = `$${(value / 1e6).toFixed(2)}M`;
      } else if (value >= 1e3) {
        formattedValue = `$${(value / 1e3).toFixed(2)}K`;
      } else {
        formattedValue = `$${value.toFixed(2)}`;
      }
      break;

    case 'compact':
      if (value >= 1e9) {
        formattedValue = `${(value / 1e9).toFixed(2)}B`;
      } else if (value >= 1e6) {
        formattedValue = `${(value / 1e6).toFixed(2)}M`;
      } else if (value >= 1e3) {
        formattedValue = `${(value / 1e3).toFixed(2)}K`;
      } else {
        formattedValue = value.toFixed(0);
      }
      break;

    case 'percentage':
      formattedValue = `${value.toFixed(2)}%`;
      break;

    case 'number':
    default:
      formattedValue = value.toFixed(2);
      break;
  }

  return unit && format !== 'currency' && format !== 'currencyCompact'
    ? `${formattedValue} ${unit}`
    : formattedValue;
}

export async function getFundamentalsMetrics(
  symbol: string,
): Promise<QuickMetric | null> {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      return null;
    }

    const formattedMetrics = [
      {
        label: 'Revenue (TTM)',
        value:
          quote.lastFiscalYearEndDate && quote.trailingAnnualRevenuePerShare
            ? formatMetricValue(
                Math.abs(quote.trailingAnnualRevenuePerShare) * 1e9,
                'currencyCompact',
              )
            : '',
      },
      {
        label: 'Net Income (TTM)',
        value: quote.trailingEps
          ? formatMetricValue(quote.trailingEps * 1e8, 'currencyCompact')
          : '',
      },
      {
        label: 'Free Cash Flow',
        value: quote.operatingCashflow
          ? formatMetricValue(quote.operatingCashflow, 'currencyCompact')
          : '',
      },
      {
        label: 'Operating Margin',
        value: quote.profitMargins
          ? formatMetricValue(quote.profitMargins * 100, 'percentage')
          : '',
      },
      {
        label: 'Debt / Equity',
        value: quote.debtToEquity
          ? formatMetricValue(quote.debtToEquity, 'number')
          : '',
      },
    ];

    return {
      keyMetrics: formattedMetrics,
      name: quote.longName || quote.shortName || null,
      description: quote.longBusinessSummary || null,
    };
  } catch (error) {
    return null;
  }
}
export async function getRiskMetrics(
  symbol: string,
): Promise<RiskMetric[] | null> {
  try {
    const [quote, history] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: '1d',
      }),
    ]);

    if (!quote || !history || history.length === 0) {
      return null;
    }

    // Calculate volatility (1Y)
    const prices = history.map((h) => h.close).filter(Boolean) as number[];
    let volatility: number | null = null;
    if (prices.length >= 2) {
      const returns = prices
        .slice(1)
        .map((p, i) => (p - prices[i]) / prices[i]);
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance =
        returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
      volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;
    }

    // Calculate max drawdown (1Y)
    let maxDrawdown: number | null = null;
    if (prices.length > 0) {
      let peak = prices[0];
      let maxDD = 0;
      for (const price of prices) {
        if (price > peak) peak = price;
        const dd = (price - peak) / peak;
        if (dd < maxDD) maxDD = dd;
      }
      maxDrawdown = maxDD * 100;
    }

    return [
      {
        label: 'Beta',
        value: formatMetricValue(quote.beta || null, 'number'),
        description:
          'Measures how volatile the stock is compared to the overall market. Beta > 1 means higher risk.',
      },
      {
        label: 'Volatility (1Y)',
        value: formatMetricValue(volatility, 'percentage'),
        description:
          'Annualized price fluctuation over the past year. Higher volatility means larger price swings.',
      },
      {
        label: 'Max Drawdown (1Y)',
        value: formatMetricValue(maxDrawdown, 'percentage'),
        description:
          'Maximum observed loss from peak to trough over the past year.',
      },
      {
        label: 'Debt Ratio',
        value: quote.debtToEquity
          ? formatMetricValue(quote.debtToEquity, 'number')
          : '',
        description:
          'Proportion of assets financed by debt. Higher values indicate higher financial leverage.',
      },
    ];
  } catch (error) {
    return null;
  }
}
