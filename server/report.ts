import 'server-only';
import {
  AgmAndShareholderMattersData,
  AnalystRecommendationsData,
  BusinessSegmentsData,
  CompanyOverviewMetrics,
  ConclusionRecommendationData,
  ContingentLiabilitiesRegulatoryRiskData,
  DcfValuationRecapData,
  EquityValuationData,
  ExtendedBalanceSheet,
  ExtendedCashFlow,
  ExtendedCashFlowStatement,
  ExtendedIncomeStatement,
  FinancialStatementsAnalysisData,
  ForwardProjectionsValuationInput,
  InterimResultsData,
  InstitutionOwnershipRow,
  InsiderTransactionRow,
  LegacyBalanceSheetStatement,
  LegacyCashflowStatement,
  LegacyIncomeStatement,
  ReportMarketContext,
  ReportSourceBundle,
  SectionGenerationOptions,
  ShareholderStructure,
  StockResearchData,
} from '@/interfaces';
import { ReportMarketType } from '@/types';
import YahooFinance from 'yahoo-finance2';
import { z } from 'zod';
import { fetchSection } from './common';
import {
  ANALYST_RECOMMENDATION_PROMPT,
  BUSINESS_SEGMENT_DATA_PROMPT,
  CONTINGENT_LIABILITY_AND_REGULATORY_RISK_PROMPT,
  DCF_VALUATION_RECAP_AND_PRICE_TARGET_PROMPT,
  AGM_AND_SHAREHOLDER_MATTERS_PROMPT,
  CONCLUSION_AND_RECOMMENDATION_PROMPT,
  EQUITY_VALUATION_PROMPT,
  EXECUTIVE_PROMPT,
  FINANCIAL_STATEMENT_ANALYSIS_PROMPT,
  FORWARD_PROJECTIONS_AND_VALUATION_PROMPT,
  INTERIM_RESULT_AND_QUARTERLY_PERFORMANCE_PROMPT,
  OVERVIEW_PROMPT,
  SHARE_HOLDER_STRUCTURE_PROMPT,
} from '@/lib';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

function getNumberField(item: Record<string, unknown>, key: string): number | null {
  const value = item[key];
  return typeof value === 'number' ? value : null;
}

function toPercentOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' ? value * 100 : null;
}

async function getAnnualFinancialStatements(symbol: string, years = 8) {
  const period1 = new Date(Date.now() - years * 365.25 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const timeSeries = await yahooFinance.fundamentalsTimeSeries(symbol, {
    module: 'all',
    type: 'annual',
    period1,
    period2: new Date().toISOString().slice(0, 10),
  });

  const sortedSeries = [...timeSeries].sort((a, b) => b.date.getTime() - a.date.getTime());

  const incomeStatements: LegacyIncomeStatement[] = sortedSeries.map((item) => {
    const normalizedItem = item as unknown as Record<string, unknown>;
    return {
      endDate: item.date.toISOString(),
      totalRevenue: getNumberField(normalizedItem, 'totalRevenue'),
      operatingIncome: getNumberField(normalizedItem, 'operatingIncome'),
      netIncome: getNumberField(normalizedItem, 'netIncome'),
      interestExpense: getNumberField(normalizedItem, 'interestExpense'),
    };
  });

  const balanceSheetStatements: LegacyBalanceSheetStatement[] = sortedSeries.map((item) => {
    const normalizedItem = item as unknown as Record<string, unknown>;
    return {
      endDate: item.date.toISOString(),
      cash: getNumberField(normalizedItem, 'cashAndCashEquivalents'),
      totalAssets: getNumberField(normalizedItem, 'totalAssets'),
      totalDebt: getNumberField(normalizedItem, 'totalDebt'),
      totalStockholderEquity: getNumberField(normalizedItem, 'totalEquityGrossMinorityInterest'),
      totalLiab: getNumberField(normalizedItem, 'totalLiabilitiesNetMinorityInterest'),
    };
  });

  const cashflowStatements: LegacyCashflowStatement[] = sortedSeries.map((item) => {
    const normalizedItem = item as unknown as Record<string, unknown>;
    const capitalExpenditure = getNumberField(normalizedItem, 'capitalExpenditure');
    const cashDividendsPaid = getNumberField(normalizedItem, 'cashDividendsPaid');
    const repurchaseOfCapitalStock = getNumberField(normalizedItem, 'repurchaseOfCapitalStock');

    return {
      endDate: item.date.toISOString(),
      totalCashFromOperatingActivities: getNumberField(normalizedItem, 'operatingCashFlow'),
      capitalExpenditures: capitalExpenditure ? -Math.abs(capitalExpenditure) : null,
      dividendsPaid: cashDividendsPaid ? -Math.abs(cashDividendsPaid) : null,
      repurchasesOfStock: repurchaseOfCapitalStock ? -Math.abs(repurchaseOfCapitalStock) : null,
    };
  });

  return { incomeStatements, balanceSheetStatements, cashflowStatements };
}
const REPORT_QUOTE_SUMMARY_MODULES = [
  'assetProfile',
  'price',
  'summaryDetail',
  'financialData',
  'defaultKeyStatistics',
  'earningsTrend',
  'majorHoldersBreakdown',
  'institutionOwnership',
  'insiderTransactions',
  'recommendationTrend',
  'calendarEvents',
] as const;

const ONE_YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;

async function getSharedQuoteSummary(symbol: string) {
  return yahooFinance.quoteSummary(symbol, {
    modules: [...REPORT_QUOTE_SUMMARY_MODULES],
  });
}

async function getSharedChart(symbol: string) {
  return yahooFinance.chart(symbol, {
    period1: new Date(Date.now() - 5 * ONE_YEAR_IN_MS).toISOString().slice(0, 10),
    period2: new Date().toISOString().slice(0, 10),
    interval: '1mo',
    events: 'div',
  });
}

export async function getReportSourceBundle(symbol: string): Promise<ReportSourceBundle> {
  const [summary, chart, annualStatements] = await Promise.all([
    getSharedQuoteSummary(symbol),
    getSharedChart(symbol),
    getAnnualFinancialStatements(symbol),
  ]);

  return { summary, chart, annualStatements };
}

function deriveCurrencySymbol(currencyCode: string): string | null {
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(1);

    return parts.find((part) => part.type === 'currency')?.value ?? null;
  } catch {
    return null;
  }
}

const MARKET_TYPE_MATCHERS: Array<{
  marketType: ReportMarketType;
  exchangeKeywords: string[];
  countryKeywords: string[];
}> = [
  {
    marketType: 'India',
    exchangeKeywords: ['bse', 'nse', 'mumbai', 'national stock exchange of india'],
    countryKeywords: ['india'],
  },
  {
    marketType: 'US',
    exchangeKeywords: ['nasdaq', 'nyse', 'amex', 'new york', 'cboe', 'otc'],
    countryKeywords: ['united states', 'usa', 'us'],
  },
  {
    marketType: 'UK',
    exchangeKeywords: ['london', 'lse', 'aim'],
    countryKeywords: ['united kingdom', 'uk', 'england'],
  },
  {
    marketType: 'Canada',
    exchangeKeywords: ['tsx', 'toronto', 'tsxv', 'venture'],
    countryKeywords: ['canada'],
  },
  {
    marketType: 'Australia',
    exchangeKeywords: ['asx', 'australian securities exchange', 'sydney'],
    countryKeywords: ['australia'],
  },
  {
    marketType: 'Japan',
    exchangeKeywords: ['tokyo', 'tse', 'jpx', 'nagoya', 'sapporo', 'fukuoka'],
    countryKeywords: ['japan'],
  },
  {
    marketType: 'China',
    exchangeKeywords: ['shanghai', 'shenzhen', 'sse', 'szse', 'beijing stock exchange'],
    countryKeywords: ['china', "people's republic of china", 'prc'],
  },
  {
    marketType: 'Hong Kong',
    exchangeKeywords: ['hong kong', 'hkex', 'hkg'],
    countryKeywords: ['hong kong'],
  },
  {
    marketType: 'Singapore',
    exchangeKeywords: ['singapore', 'sgx'],
    countryKeywords: ['singapore'],
  },
  {
    marketType: 'South Korea',
    exchangeKeywords: ['krx', 'kospi', 'kosdaq', 'korea exchange', 'seoul'],
    countryKeywords: ['south korea', 'korea, republic of', 'republic of korea'],
  },
  {
    marketType: 'Taiwan',
    exchangeKeywords: ['taiwan stock exchange', 'twse', 'taipei exchange', 'tpex'],
    countryKeywords: ['taiwan'],
  },
  {
    marketType: 'Europe',
    exchangeKeywords: [
      'euronext',
      'xetra',
      'frankfurt',
      'deutsche b',
      'paris',
      'amsterdam',
      'brussels',
      'milan',
      'madrid',
      'swiss',
      'six',
      'oslo',
      'stockholm',
      'copenhagen',
      'helsinki',
      'vienna',
      'warsaw',
    ],
    countryKeywords: [
      'germany',
      'france',
      'netherlands',
      'belgium',
      'italy',
      'spain',
      'switzerland',
      'sweden',
      'norway',
      'denmark',
      'finland',
      'austria',
      'poland',
      'portugal',
      'ireland',
      'luxembourg',
    ],
  },
  {
    marketType: 'Middle East',
    exchangeKeywords: [
      'tadawul',
      'saudi exchange',
      'abu dhabi',
      'adx',
      'dubai',
      'dfm',
      'qatar exchange',
      'bahrain bourse',
      'kuwait',
      'tel aviv',
      'egyptian exchange',
    ],
    countryKeywords: [
      'saudi arabia',
      'united arab emirates',
      'uae',
      'qatar',
      'bahrain',
      'kuwait',
      'oman',
      'israel',
      'egypt',
      'jordan',
    ],
  },
];

function deriveMarketType(exchangeName: string | null, country: string | null): ReportMarketType {
  const normalizedExchange = exchangeName?.toLowerCase() ?? '';
  const normalizedCountry = country?.toLowerCase() ?? '';

  for (const matcher of MARKET_TYPE_MATCHERS) {
    if (matcher.exchangeKeywords.some((keyword) => normalizedExchange.includes(keyword))) {
      return matcher.marketType;
    }
  }

  for (const matcher of MARKET_TYPE_MATCHERS) {
    if (matcher.countryKeywords.some((keyword) => normalizedCountry.includes(keyword))) {
      return matcher.marketType;
    }
  }

  return 'Global';
}

function resolveReportMarketContextFromSummary(
  summary: ReportSourceBundle['summary'],
): ReportMarketContext {
  const currencyCode =
    summary.price?.currency ??
    summary.summaryDetail?.currency ??
    summary.financialData?.financialCurrency ??
    'USD';

  const exchangeName =
    summary.price?.exchangeName ??
    summary.price?.exchange ??
    summary.price?.quoteSourceName ??
    null;

  const marketType = deriveMarketType(exchangeName, summary.assetProfile?.country ?? null);

  return {
    currencyCode,
    exchangeName,
    marketType,
    currencySymbol: deriveCurrencySymbol(currencyCode),
  };
}

export function resolveReportMarketContext(sourceBundle: ReportSourceBundle): ReportMarketContext {
  return resolveReportMarketContextFromSummary(sourceBundle.summary);
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringValues(item));
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap((item) => collectStringValues(item));
  }
  return [];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsCurrencyMarker(text: string, marker: string): boolean {
  const escapedMarker = escapeRegex(marker);
  const normalizedText = text.normalize('NFKC');

  if (/^[A-Za-z]{2,}$/.test(marker)) {
    const beforeNumberPattern = new RegExp(`\\b${escapedMarker}\\b\\s*\\d`, 'i');
    const afterNumberPattern = new RegExp(`\\d(?:[\\d,\\.\\s])*\\s*\\b${escapedMarker}\\b`, 'i');
    return beforeNumberPattern.test(normalizedText) || afterNumberPattern.test(normalizedText);
  }

  if (/^[A-Za-z]{1,2}$/.test(marker)) {
    const beforeNumberPattern = new RegExp(`(?:^|\\s)${escapedMarker}\\s*\\d`, 'i');
    const afterNumberPattern = new RegExp(`\\d(?:[\\d,\\.\\s])*\\s*${escapedMarker}(?:\\s|$)`, 'i');
    return beforeNumberPattern.test(normalizedText) || afterNumberPattern.test(normalizedText);
  }

  const prefixedAmountPattern = new RegExp(`${escapedMarker}\\s*\\d`, 'i');
  const suffixedAmountPattern = new RegExp(`\\d(?:[\\d,\\.\\s])*\\s*${escapedMarker}`, 'i');
  return prefixedAmountPattern.test(normalizedText) || suffixedAmountPattern.test(normalizedText);
}

export function validateReportCurrencyConsistency(
  payload: unknown,
  marketContext: ReportMarketContext,
): void {
  const currencyMarkers: Record<string, string[]> = {
    INR: ['₹', 'INR'],
    USD: ['$', 'US$', 'USD'],
    GBP: ['£', 'GBP'],
    EUR: ['€', 'EUR'],
    JPY: ['¥', 'JPY'],
    CNY: ['CN¥', 'CNY', 'RMB'],
    HKD: ['HK$', 'HKD'],
    SGD: ['S$', 'SGD'],
    AUD: ['A$', 'AUD'],
    CAD: ['C$', 'CAD'],
    CHF: ['CHF'],
    KRW: ['₩', 'KRW'],
    TWD: ['NT$', 'TWD'],
    AED: ['AED'],
    SAR: ['SAR'],
    SEK: ['SEK', 'kr'],
    NOK: ['NOK', 'kr'],
    DKK: ['DKK', 'kr'],
    ZAR: ['R', 'ZAR'],
    BRL: ['R$', 'BRL'],
    MXN: ['MX$', 'MXN'],
  };

  const allowedMarkers = new Set([
    ...(currencyMarkers[marketContext.currencyCode] ?? []),
    marketContext.currencySymbol ?? '',
  ]);
  const disallowedMarkers = Object.entries(currencyMarkers)
    .filter(([currencyCode]) => currencyCode !== marketContext.currencyCode)
    .flatMap(([, markers]) => markers)
    .filter((marker) => marker && !allowedMarkers.has(marker));

  if (!disallowedMarkers.length) return;

  for (const text of collectStringValues(payload)) {
    if (disallowedMarkers.some((marker) => containsCurrencyMarker(text, marker))) {
      throw new Error(
        `Generated section output contains currency markers inconsistent with ${marketContext.currencyCode}`,
      );
    }
  }
}

async function fetchReportSection<T>({
  userPrompt,
  systemPrompt,
  schema,
  schemaName,
  enableWebSearch,
  marketContext,
}: {
  userPrompt: string;
  systemPrompt: string;
  schema: z.ZodObject<z.ZodRawShape>;
  schemaName: string;
  enableWebSearch?: boolean;
  marketContext: ReportMarketContext;
}): Promise<T> {
  const analysis = await fetchSection<T>({
    userPrompt,
    systemPrompt,
    schema,
    schemaName,
    options: { enableWebSearch },
  });

  validateReportCurrencyConsistency(analysis, marketContext);

  return analysis;
}

function calculateOneYearReturnPercent(chart: ReportSourceBundle['chart']) {
  const quotes = chart.quotes ?? [];
  const lastClose = quotes[quotes.length - 1]?.adjclose ?? null;

  const oneYearAgo = Date.now() - ONE_YEAR_IN_MS;
  const oneYearQuote =
    quotes.find((quote) => {
      if (!(quote.date instanceof Date)) return false;
      return quote.date.getTime() >= oneYearAgo && typeof quote.adjclose === 'number';
    }) ?? quotes[0];

  const startClose = oneYearQuote?.adjclose ?? null;
  return startClose && lastClose ? ((lastClose - startClose) / startClose) * 100 : null;
}

async function getTrimmedExecutiveData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<StockResearchData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { annualStatements, summary, chart } = sharedBundle;
  const { incomeStatements } = annualStatements;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const safe = <T>(value: T | null | undefined): T | null => value ?? null;

  // ---- Financials ----
  const latest = incomeStatements[0];
  const previous = incomeStatements[1];

  const revenueTTM = latest?.totalRevenue ?? null;
  const netIncomeTTM = latest?.netIncome ?? null;

  const revenueYoYGrowth =
    revenueTTM && previous?.totalRevenue
      ? ((revenueTTM - previous.totalRevenue) / previous.totalRevenue) * 100
      : null;

  const netMargin = revenueTTM && netIncomeTTM ? (netIncomeTTM / revenueTTM) * 100 : null;

  // ---- Analyst ----
  const currentPrice = summary.price?.regularMarketPrice ?? null;
  const targetMean = summary.financialData?.targetMeanPrice ?? null;

  const upsidePercent =
    currentPrice && targetMean ? ((targetMean - currentPrice) / currentPrice) * 100 : null;

  // ---- Dividends ----
  const dividends = chart.events?.dividends?.reduce((sum, d) => sum + (d.amount ?? 0), 0) ?? null;

  // ---- 1Y Return ----
  const oneYearReturn = calculateOneYearReturnPercent(chart);

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
    },
    company: {
      name: safe(summary.price?.longName),
      sector: safe(summary.assetProfile?.sector),
      industry: safe(summary.assetProfile?.industry),
      employees: safe(summary.assetProfile?.fullTimeEmployees),
    },

    valuation: {
      price: currentPrice,
      marketCap: safe(summary.price?.marketCap),
      trailingPE: safe(summary.summaryDetail?.trailingPE),
      forwardPE: safe(summary.summaryDetail?.forwardPE),
      priceToBook: safe(summary.defaultKeyStatistics?.priceToBook),
      evToRevenue: safe(summary.defaultKeyStatistics?.enterpriseToRevenue),
      evToEbitda: safe(summary.defaultKeyStatistics?.enterpriseToEbitda),
      beta: safe(summary.defaultKeyStatistics?.beta),
    },

    financials: {
      revenueTTM,
      netIncomeTTM,
      revenueYoYGrowth,
      netMargin,
      freeCashFlow: safe(summary.financialData?.freeCashflow),
      totalDebt: safe(summary.financialData?.totalDebt),
      totalCash: safe(summary.financialData?.totalCash),
      roe: toPercentOrNull(summary.financialData?.returnOnEquity),
    },

    analyst: {
      targetMean,
      upsidePercent,
      recommendationKey: safe(summary.financialData?.recommendationKey),
      earningsGrowth: toPercentOrNull(summary.financialData?.earningsGrowth),
      revenueGrowth: toPercentOrNull(summary.financialData?.revenueGrowth),
    },

    pricePerformance: {
      fiftyTwoWeekHigh: safe(summary.summaryDetail?.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: safe(summary.summaryDetail?.fiftyTwoWeekLow),
      oneYearReturn,
    },

    dividends: {
      totalDividendsLastYear: dividends,
      dividendYield: toPercentOrNull(summary.summaryDetail?.dividendYield),
    },
  };
}

export async function getExecutiveInformationAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getTrimmedExecutiveData(symbol, options?.sourceBundle);
  const analysis = await fetchReportSection<z.infer<typeof ExecutiveSchema>>({
    userPrompt: `Input data: ${JSON.stringify(response)}`,
    systemPrompt: EXECUTIVE_PROMPT,
    schema: ExecutiveSchema,
    schemaName: 'ExecutiveSchema',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });
  return { companyName: response.company.name, ...analysis };
}

export const ExecutiveSchema = z.object({
  executiveSummary: z.string().nullable(),
  investmentThesis: z.object({
    positives: z.string().nullable(),
    risks: z.string().nullable(),
    currentPrice: z.string().nullable(),
    dcfFairValue: z.string().nullable(),
    analystConsensus: z.string().nullable(),
    upside: z.string().nullable(),
  }),
});

async function getTrimmedCompanyOverviewMetrics(
  symbol: string,
  terminalGrowth = 0.04, // 4% default India large cap
  riskFreeRate = 0.07, // 7% India 10Y G-Sec
  marketRiskPremium = 0.06, // 6% India ERP
  sourceBundle?: ReportSourceBundle,
): Promise<CompanyOverviewMetrics> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary, chart } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const safe = <T>(value: T | null | undefined): T | null => value ?? null;

  const price = summary.price?.regularMarketPrice ?? null;
  const high52 = summary.summaryDetail?.fiftyTwoWeekHigh ?? null;
  const low52 = summary.summaryDetail?.fiftyTwoWeekLow ?? null;

  const sharesOutstanding = summary.defaultKeyStatistics?.sharesOutstanding ?? null;

  const beta = summary.defaultKeyStatistics?.beta ?? null;
  const totalDebt = summary.financialData?.totalDebt ?? 0;
  const totalCash = summary.financialData?.totalCash ?? 0;
  const freeCashFlow = summary.financialData?.freeCashflow ?? null;

  // --------------------------
  // 1️⃣ WACC Calculation (CAPM)
  // --------------------------

  let wacc: number | null = null;

  if (beta !== null && price !== null && sharesOutstanding !== null) {
    const costOfEquity = riskFreeRate + beta * marketRiskPremium;

    const equityValue = price * sharesOutstanding;
    const debtValue = totalDebt;
    const totalValue = equityValue + debtValue;

    const weightEquity = equityValue / totalValue;
    const weightDebt = debtValue / totalValue;

    const costOfDebt = 0.09; // assume 9% India corporate avg

    wacc = weightEquity * costOfEquity + weightDebt * costOfDebt * (1 - 0.25); // assume 25% tax
  }

  // --------------------------
  // 2️⃣ Simple 5Y DCF Model
  // --------------------------

  let dcfFairValue: number | null = null;

  if (freeCashFlow && wacc && sharesOutstanding && wacc > terminalGrowth) {
    const growthRate = summary.financialData?.revenueGrowth ?? 0.1;

    let projectedFCF = freeCashFlow;
    let totalPV = 0;

    for (let year = 1; year <= 5; year++) {
      projectedFCF *= 1 + growthRate;
      totalPV += projectedFCF / Math.pow(1 + wacc, year);
    }

    const terminalValue = (projectedFCF * (1 + terminalGrowth)) / (wacc - terminalGrowth);

    const discountedTerminal = terminalValue / Math.pow(1 + wacc, 5);

    const enterpriseValue = totalPV + discountedTerminal;

    const equityValue = enterpriseValue + totalCash - totalDebt;

    dcfFairValue = equityValue / sharesOutstanding;
  }

  // --------------------------
  // Performance Metrics
  // --------------------------

  const fiftyTwoWeekRangePercent = high52 && low52 ? ((high52 - low52) / low52) * 100 : null;

  const recoveryFromLowPercent = price && low52 ? ((price - low52) / low52) * 100 : null;

  const oneYearReturnPercent = calculateOneYearReturnPercent(chart);

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
    },
    price,
    marketCap: safe(summary.price?.marketCap),
    sharesOutstanding,

    fiftyTwoWeekHigh: high52,
    fiftyTwoWeekLow: low52,
    fiftyTwoWeekRangePercent,

    trailingPE: safe(summary.summaryDetail?.trailingPE),
    forwardPE: safe(summary.summaryDetail?.forwardPE),

    dividendYield: summary.summaryDetail?.dividendYield
      ? summary.summaryDetail.dividendYield * 100
      : null,

    annualDividend: safe(summary.defaultKeyStatistics?.lastDividendValue),

    analystTargetMean: safe(summary.financialData?.targetMeanPrice),
    analystTargetHigh: safe(summary.financialData?.targetHighPrice),
    analystTargetLow: safe(summary.financialData?.targetLowPrice),
    analystCount: safe(summary.financialData?.numberOfAnalystOpinions),

    oneYearReturnPercent,
    recoveryFromLowPercent,

    // NEW VALUES
    dcfFairValue,
    wacc: wacc ? wacc * 100 : null, // return in %
    terminalGrowth: terminalGrowth * 100,
    asOfDate: summary.price?.regularMarketTime
      ? new Date(summary.price.regularMarketTime).toLocaleDateString('en-IN')
      : null,
  };
}

export async function getOverviewMetricsAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getTrimmedCompanyOverviewMetrics(
    symbol,
    undefined,
    undefined,
    undefined,
    options?.sourceBundle,
  );
  const analysis = await fetchReportSection<z.infer<typeof CompanyOverviewSchema>>({
    userPrompt: `Generate the Company Overview & Stock Metrics section using the following input data:

CompanyOverviewMetrics:
${JSON.stringify(response)}`,
    systemPrompt: OVERVIEW_PROMPT,
    schema: CompanyOverviewSchema,
    schemaName: 'OverviewAndStockMetrics',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });
  return analysis;
}

export const CompanyOverviewSchema = z.object({
  metrics: z
    .array(
      z.object({
        name: z.enum([
          'Current Share Price',
          '52-Week Range',
          'Market Cap',
          'Current P/E Ratio',
          'Forward P/E (2026E)',
          'DCF Fair Value',
          'Dividend Yield',
          'Price Target (Consensus)',
        ]),
        value: z.string(), // keep string because of pence, £, %, x etc
        note: z.string(),
      }),
    )
    .length(8),
  fiftyTwoWeekPerformance: z.string(),
});

async function getTrimmedShareholderStructure(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<ShareholderStructure> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const safe = <T>(value: T | null | undefined): T | null => value ?? null;

  // --------------------------
  // Ownership Breakdown
  // --------------------------

  const institutionalPercent = summary.majorHoldersBreakdown?.institutionsPercentHeld
    ? summary.majorHoldersBreakdown.institutionsPercentHeld * 100
    : null;

  const insiderPercent = summary.majorHoldersBreakdown?.insidersPercentHeld
    ? summary.majorHoldersBreakdown.insidersPercentHeld * 100
    : null;

  const freeFloatPercent =
    institutionalPercent !== null && insiderPercent !== null
      ? 100 - (institutionalPercent + insiderPercent)
      : null;

  // --------------------------
  // Major Institutions
  // --------------------------

  const majorInstitutions =
    summary.institutionOwnership?.ownershipList?.map((inst: InstitutionOwnershipRow) => ({
      name: inst.organization,
      percentHeld: typeof inst.pctHeld === 'number' ? inst.pctHeld * 100 : 0,
    })) ?? [];

  // --------------------------
  // Insider Transaction Analytics
  // --------------------------

  const transactions = summary.insiderTransactions?.transactions ?? [];

  let totalBuysValue = 0;
  let totalSellsValue = 0;
  let largestTransactionValue = 0;
  let largestTransaction: ShareholderStructure['insiderSummary']['largestTransaction'] | null =
    null;

  const uniqueInsiders = new Set<string>();

  for (const tx of transactions as InsiderTransactionRow[]) {
    const value = tx.value ?? 0;
    const isBuy = tx.transactionText?.toLowerCase().includes('buy');

    if (tx.filerName) {
      uniqueInsiders.add(tx.filerName);
    }

    if (isBuy) {
      totalBuysValue += value;
    } else {
      totalSellsValue += value;
    }

    if (value > largestTransactionValue) {
      largestTransactionValue = value;
      largestTransaction = {
        name: tx.filerName ?? null,
        type: isBuy ? 'BUY' : 'SELL',
        value: value,
        date: tx.startDate ? new Date(tx.startDate).toLocaleDateString('en-IN') : null,
      };
    }
  }

  let netActivity: 'NET_BUY' | 'NET_SELL' | 'NEUTRAL';

  if (totalBuysValue > totalSellsValue) {
    netActivity = 'NET_BUY';
  } else if (totalSellsValue > totalBuysValue) {
    netActivity = 'NET_SELL';
  } else {
    netActivity = 'NEUTRAL';
  }

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
    },
    freeFloatPercent,
    institutionalPercent,
    insiderPercent,

    sharesOutstanding: safe(summary.defaultKeyStatistics?.sharesOutstanding),

    floatShares: safe(summary.defaultKeyStatistics?.floatShares),

    majorInstitutions,

    insiderSummary: {
      totalBuysValue,
      totalSellsValue,
      netActivity,
      largestTransaction: largestTransaction ?? {
        name: null,
        type: null,
        value: null,
        date: null,
      },
      activeInsiders: uniqueInsiders.size,
      transactionCount: transactions.length,
    },
  };
}

export const ShareholderStructureSectionSchema = z.object({
  majorShareholders: z
    .array(
      z.object({
        shareHolderType: z.enum(['FREE_FLOAT', 'INSTITUTIONAL_HOLDINGS', 'MANAGEMENT_DIRECTORS']),
        ownership: z.string(), // e.g., "~75%"
        notes: z.string(),
      }),
    )
    .length(3),

  shareCapitalStructure: z.object({
    totalShares: z.string(), // e.g., "401m shares"
    notes: z.string(), // e.g., "Post-10:1 split equivalent..."
  }),

  keyInsiderObservations: z.array(z.string()).min(1).max(10),
});

export async function getShareholderStructureAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getTrimmedShareholderStructure(symbol, options?.sourceBundle);
  const analysis = await fetchReportSection<z.infer<typeof ShareholderStructureSectionSchema>>({
    userPrompt: `Generate the "Shareholder Structure & Insider Activity" section using the following structured input data: ShareholderStructureRawData: ${JSON.stringify(response)}`,
    systemPrompt: SHARE_HOLDER_STRUCTURE_PROMPT,
    schema: ShareholderStructureSectionSchema,
    schemaName: 'ShareHolderStructure',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });
  return analysis;
}

async function getAnalystRecommendationsData(
  symbol: string,
  reportingPeriod: string = 'Last 3 Months',
  sourceBundle?: ReportSourceBundle,
): Promise<AnalystRecommendationsData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  // -------------------------
  // Current Market Data
  // -------------------------

  const currentPrice = summary.price?.regularMarketPrice ?? null;
  // -------------------------
  // Analyst Ratings
  // -------------------------

  const trend = summary.recommendationTrend?.trend?.[0];

  const strongBuy = trend?.strongBuy ?? 0;
  const buy = trend?.buy ?? 0;
  const hold = trend?.hold ?? 0;
  const sell = trend?.sell ?? 0;
  const strongSell = trend?.strongSell ?? 0;

  const total = strongBuy + buy + hold + sell + strongSell;

  // -------------------------
  // Price Targets
  // -------------------------

  const mean = summary.financialData?.targetMeanPrice ?? null;
  const median = summary.financialData?.targetMedianPrice ?? null;
  const high = summary.financialData?.targetHighPrice ?? null;
  const low = summary.financialData?.targetLowPrice ?? null;

  const recommendationKey = summary.financialData?.recommendationKey ?? null;

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
    },
    currentPrice,
    reportingPeriod,

    ratings: {
      buy,
      hold,
      sell,
      strongBuy,
      strongSell,
      total,
    },

    priceTargets: {
      mean,
      median,
      high,
      low,
    },

    recommendationKey,
  };
}

export const AnalystRecommendationsSchema = z.object({
  currentConsensus: z
    .array(
      z.object({
        rating: z.enum(['BUY_OR_STRONG_BUY', 'HOLD', 'SELL', 'TOTAL_ANALYSTS']),
        count: z.string(), // e.g., "4-5" or "11"
        percentageOfTotal: z.string(), // e.g., "36-45%" or "100%"
        trend: z.string(), // e.g., "Stable", "Outlier", "Good coverage"
      }),
    )
    .length(4),

  consensusDetails: z
    .array(
      z.object({
        name: z.enum([
          'AVERAGE_PRICE_TARGET',
          'MEDIAN_PT',
          'BULL_CASE_PT_TOP',
          'BEAR_CASE_PT_BOTTOM',
          'CONSENSUS_RATING',
        ]),
        value: z.string(), // e.g., "533p (+20.5% upside)", "HOLD"
      }),
    )
    .length(5),

  recentAnalystViews: z.array(z.string()).min(1).max(10),
});

export async function getAnalystRecommendationsAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getAnalystRecommendationsData(symbol, undefined, options?.sourceBundle);

  const analysis = await fetchReportSection<z.infer<typeof AnalystRecommendationsSchema>>({
    userPrompt: `Generate the "Analyst Recommendations & Price Targets" section using the following structured input: ${JSON.stringify(response)}`,
    systemPrompt: ANALYST_RECOMMENDATION_PROMPT,
    schema: AnalystRecommendationsSchema,
    schemaName: 'AnalystRecommendations',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });
  return analysis;
}

async function getTrimmedEquityValuationData(
  symbol: string,
  options?: {
    wacc?: number;
    terminalGrowth?: number;
    forecastYears?: number;
    revenueGrowth?: number;
    taxRate?: number;
    reportingStandard?: 'UK' | 'US' | 'India' | 'Global';
    sourceBundle?: ReportSourceBundle;
  },
): Promise<EquityValuationData> {
  const {
    wacc = 0.085,
    terminalGrowth = 0.035,
    forecastYears = 5,
    revenueGrowth = 0.12,
    taxRate = 0.19,
    reportingStandard = 'Global',
    sourceBundle,
  } = options || {};

  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary } = sharedBundle;
  const { incomeStatements } = sharedBundle.annualStatements;
  const marketContext = resolveReportMarketContext(sharedBundle);

  // -----------------------------
  // Context
  // -----------------------------

  const currentPrice = summary.price?.regularMarketPrice ?? null;

  // -----------------------------
  // Financial Inputs
  // -----------------------------

  const shares = summary.defaultKeyStatistics?.sharesOutstanding ?? 0;

  const totalDebt = summary.financialData?.totalDebt ?? 0;

  const totalCash = summary.financialData?.totalCash ?? 0;

  const netDebt = totalDebt - totalCash;

  const latestRevenue = incomeStatements[0]?.totalRevenue ?? 0;

  const latestNetIncome = incomeStatements[0]?.netIncome ?? 0;

  const netMargin = latestRevenue > 0 ? latestNetIncome / latestRevenue : 0;

  // -----------------------------
  // 1️⃣ Projections
  // -----------------------------

  const projections = [];
  let projectedRevenue = latestRevenue;
  let projectedShares = shares;
  let pvOfFCF = 0;

  for (let i = 1; i <= forecastYears; i++) {
    projectedRevenue *= 1 + revenueGrowth;

    const projectedNetIncome = projectedRevenue * netMargin;

    projectedShares *= 0.99; // 1% annual buyback assumption

    const eps = projectedShares > 0 ? projectedNetIncome / projectedShares : 0;

    const discountedFCF = projectedNetIncome / Math.pow(1 + wacc, i);

    pvOfFCF += discountedFCF;

    projections.push({
      year: 2025 + i,
      revenue: projectedRevenue,
      revenueGrowth,
      netIncome: projectedNetIncome,
      shares: projectedShares,
      eps,
    });
  }

  // -----------------------------
  // 2️⃣ Terminal Value
  // -----------------------------

  const finalYearIncome = projections[projections.length - 1].netIncome;

  const terminalValue = (finalYearIncome * (1 + terminalGrowth)) / (wacc - terminalGrowth);

  const discountedTerminal = terminalValue / Math.pow(1 + wacc, forecastYears);

  const enterpriseValue = pvOfFCF + discountedTerminal;

  const equityValue = enterpriseValue - netDebt;

  const fairValuePerShare = shares > 0 ? equityValue / shares : 0;

  const impliedUpsidePercent = currentPrice
    ? ((fairValuePerShare - currentPrice) / currentPrice) * 100
    : null;

  // -----------------------------
  // 3️⃣ Sensitivity Grid
  // -----------------------------

  const waccRange = [0.075, 0.08, 0.085, 0.09, 0.095];
  const growthRange = [0.025, 0.03, 0.035, 0.04, 0.045];

  const sensitivityTable = [];

  for (const w of waccRange) {
    for (const g of growthRange) {
      const tv = (finalYearIncome * (1 + g)) / (w - g);

      const discountedTV = tv / Math.pow(1 + w, forecastYears);

      const ev = pvOfFCF + discountedTV;
      const eq = ev - netDebt;

      const fairValue = shares > 0 ? eq / shares : 0;

      sensitivityTable.push({
        wacc: w,
        terminalGrowth: g,
        fairValue,
      });
    }
  }

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
      forecastYears,
      currentPrice,
      reportingStandard,
    },

    assumptions: {
      wacc,
      terminalGrowth,
      forecastYears,
      revenueGrowth,
      taxRate,
    },

    projections,

    valuation: {
      pvOfFCF,
      pvOfTerminalValue: discountedTerminal,
      enterpriseValue,
      netDebt,
      equityValue,
      fairValuePerShare,
      impliedUpsidePercent,
    },

    sensitivityTable,
  };
}

export const EquityValuationDcfSchema = z.object({
  keyAssumptions: z
    .array(
      z.object({
        modelName: z.enum(['WACC', 'TERMINAL_GROWTH_RATE', 'FORECAST_PERIOD', 'REVENUE_GROWTH']),
        assumption: z.string(),
      }),
    )
    .length(4),

  projectedFinanacialNext5Years: z
    .array(
      z.object({
        financialYear: z.enum(['FY_2026', 'FY_2027', 'FY_2028', 'FY_2029', 'FY_2030']),
        projections: z
          .array(
            z.object({
              metric: z.enum([
                'REVENUE_GBP_M',
                'REVENUE_GROWTH',
                'PBT_MARGIN_PERCENT',
                'PBT_GBP_M',
                'TAX_RATE',
                'NET_INCOME_GBP_M',
                'DILUTED_SHARES_M',
                'DILUTED_EPS_P',
              ]),
              value: z.string(),
            }),
          )
          .length(8),
      }),
    )
    .length(5),

  dcfValuationBuildups: z.object({
    pvOfFCF: z.string(),
    pvOfTerminalValue: z.string(),
    enterpriseValue: z.string(),
    netDebt: z.string(),
    equityValue: z.string(),
    fairValuePerShare: z.string(),
    currentPrice: z.string(),
    impliedUpside: z.string(),
    note: z.string(),
  }),

  valuationSensitivityAnalysis: z
    .array(
      z.object({
        wacc: z.enum(['7.5%', '8.0%', '8.5%', '9.0%', '9.5%']),
        value: z
          .array(
            z.object({
              terminalGrowth: z.enum(['2.5%', '3.0%', '3.5%', '4.0%', '4.5%']),
              value: z.string(),
            }),
          )
          .length(5),
      }),
    )
    .length(5),

  keyTakeAway: z.string(),
});

export async function getEquityValuationAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getTrimmedEquityValuationData(symbol, {
    sourceBundle: options?.sourceBundle,
  });
  const analysis = await fetchReportSection<z.infer<typeof EquityValuationDcfSchema>>({
    userPrompt: `Generate Section 4: Equity Valuation & DCF Analysis Using the following structured input from getEquityValuationData: ${JSON.stringify(response)}`,
    systemPrompt: EQUITY_VALUATION_PROMPT,
    schema: EquityValuationDcfSchema,
    schemaName: 'EquityValuationDcf',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });
  return analysis;
}

async function getTrimmedFinancialStatementsAnalysisData(
  symbol: string,
  reportingStandard?: ReportMarketType,
  sourceBundle?: ReportSourceBundle,
): Promise<FinancialStatementsAnalysisData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary, annualStatements } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const { incomeStatements, balanceSheetStatements, cashflowStatements } = annualStatements;

  const balanceSheets = balanceSheetStatements;

  const cashFlows = cashflowStatements;

  // Take latest 6 fiscal years
  const latestIncome = incomeStatements.slice(0, 6);
  const latestBalance = balanceSheets.slice(0, 6);
  const latestCashFlow = cashFlows.slice(0, 6);

  const sharesOutstanding = summary.defaultKeyStatistics?.sharesOutstanding ?? null;

  const currentPrice = summary.price?.regularMarketPrice ?? null;

  // Helper to format fiscal year label like FY20
  const getFYLabel = (date: string) => {
    const year = new Date(date).getFullYear();
    return `FY${String(year).slice(-2)}`;
  };

  const incomeStatement = latestIncome.map((stmt: LegacyIncomeStatement) => ({
    fiscalYear: getFYLabel(stmt.endDate),
    revenue: stmt.totalRevenue ?? null,
    operatingIncome: stmt.operatingIncome ?? null,
    netIncome: stmt.netIncome ?? null,
    eps: stmt.netIncome && sharesOutstanding ? stmt.netIncome / sharesOutstanding : null,
  }));

  const balanceSheet = latestBalance.map((bs: LegacyBalanceSheetStatement) => ({
    fiscalYear: getFYLabel(bs.endDate),
    cash: bs.cash ?? null,
    totalAssets: bs.totalAssets ?? null,
    totalDebt: bs.totalDebt ?? null,
    shareholdersEquity: bs.totalStockholderEquity ?? null,
  }));

  const cashFlow = latestCashFlow.map((cf: LegacyCashflowStatement) => ({
    fiscalYear: getFYLabel(cf.endDate),
    operatingCF: cf.totalCashFromOperatingActivities ?? null,
    capex: cf.capitalExpenditures ?? null,
    freeCF:
      cf.totalCashFromOperatingActivities && cf.capitalExpenditures
        ? cf.totalCashFromOperatingActivities + cf.capitalExpenditures
        : null,
    dividendsPaid: cf.dividendsPaid ?? null,
    shareBuyback: cf.repurchasesOfStock ?? null,
  }));

  const ratios = incomeStatement.map((is) => {
    const balance = balanceSheet.find((b) => b.fiscalYear === is.fiscalYear);

    const pe = currentPrice && is.eps ? currentPrice / is.eps : null;

    const debtToEquity =
      balance?.totalDebt && balance?.shareholdersEquity
        ? balance.totalDebt / balance.shareholdersEquity
        : null;

    const roe =
      balance?.shareholdersEquity && is.netIncome
        ? is.netIncome / balance.shareholdersEquity
        : null;

    const currentRatio = summary.financialData?.currentRatio ?? null;

    return {
      fiscalYear: is.fiscalYear,
      pe,
      debtToEquity,
      roe,
      currentRatio,
    };
  });

  const fiscalYearsCovered =
    incomeStatement.length > 0
      ? `${incomeStatement[incomeStatement.length - 1].fiscalYear}–${incomeStatement[0].fiscalYear}`
      : 'N/A';

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
      reportingStandard: reportingStandard ?? marketContext.marketType,
      fiscalYearsCovered,
    },

    incomeStatement,
    balanceSheet,
    cashFlow,
    ratios,
  };
}

export const FinancialStatementsAnalysisSchema = z.object({
  incomeStatementTrend: z.object({
    table: z
      .array(
        z.object({
          fiscalYear: z.enum(['FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25', 'FY25_EST']),
          revenue: z.string(), // "126.7"
          yoyGrowth: z.string(), // "-12%"
          operatingIncome: z.string(), // "49.2"
          netIncome: z.string(), // "38.8"
          eps: z.string(), // "9.5p"
        }),
      )
      .length(6),
    keyObservations: z.array(z.string()).min(1),
  }),

  balanceSheetStrength: z.object({
    table: z
      .array(
        z.object({
          fiscalYear: z.enum(['FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25', 'FY25_EST']),
          cash: z.string(),
          totalAssets: z.string(),
          totalDebt: z.string(),
          shareholdersEquity: z.string(),
          debtToEquity: z.string(),
        }),
      )
      .length(6),
    capitalPositionAnalysis: z.array(z.string()).min(1),
  }),

  cashFlowAnalysis: z.object({
    table: z
      .array(
        z.object({
          fiscalYear: z.enum(['FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25', 'FY25_EST']),
          operatingCF: z.string(),
          capex: z.string(),
          freeCF: z.string(),
          fcfMargin: z.string(),
          dividendsPaid: z.string(),
          shareBuyback: z.string(),
        }),
      )
      .length(6),
    fcfQualityAnalysis: z.array(z.string()).min(1),
  }),

  financialRatiosAndCreditMetrics: z.object({
    table: z
      .array(
        z.object({
          metric: z.enum([
            'P/E Ratio',
            'PEG Ratio',
            'EV/Revenue',
            'EV/EBITDA',
            'Debt/Equity',
            'Interest Coverage',
            'Current Ratio',
            'ROE',
            'ROIC',
          ]),
          values: z.object({
            FY20: z.string(),
            FY21: z.string(),
            FY22: z.string(),
            FY23: z.string(),
            FY24: z.string(),
            FY25: z.string(),
          }),
        }),
      )
      .length(9),
    valuationObservations: z.array(z.string()).min(1),
  }),
});

export async function getFinancialStatementsAnalysisAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getTrimmedFinancialStatementsAnalysisData(
    symbol,
    undefined,
    options?.sourceBundle,
  );

  const analysis = await fetchReportSection<z.infer<typeof FinancialStatementsAnalysisSchema>>({
    userPrompt: `
    Generate Section 5: Financial Statements Analysis 
    Using the following structured data from getFinancialStatementsAnalysisData: ${JSON.stringify(response)}
`,
    systemPrompt: FINANCIAL_STATEMENT_ANALYSIS_PROMPT,
    schema: FinancialStatementsAnalysisSchema,
    schemaName: 'FinancialStatementsAnalysis',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });

  return analysis;
}

async function getTrimmedBusinessSegmentsData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<BusinessSegmentsData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary, annualStatements } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const { incomeStatements, balanceSheetStatements } = annualStatements;

  const latestIncome = incomeStatements[0] ?? null;

  const latestBalance = balanceSheetStatements[0] ?? null;

  // 3Y revenue volatility (growth consistency proxy)
  const revenues = incomeStatements
    .slice(0, 3)
    .map((statement: LegacyIncomeStatement) => statement.totalRevenue)
    .filter((revenue): revenue is number => typeof revenue === 'number');

  let revenueVolatility3Y: number | null = null;

  if (revenues.length === 3) {
    const growthRates = [
      (revenues[0] - revenues[1]) / revenues[1],
      (revenues[1] - revenues[2]) / revenues[2],
    ];

    const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

    revenueVolatility3Y = Math.sqrt(
      growthRates.map((g) => Math.pow(g - mean, 2)).reduce((a, b) => a + b, 0) / growthRates.length,
    );
  }

  //@ts-ignore
  const netDebt = (latestBalance?.totalDebt ?? 0) - (latestBalance?.cash ?? 0);

  const debtToEquity =
    //@ts-ignore
    latestBalance?.totalDebt && latestBalance?.totalStockholderEquity
      ? //@ts-ignore
        latestBalance.totalDebt / latestBalance.totalStockholderEquity
      : null;

  // Capital-light detection
  const grossMargin = summary.financialData?.grossMargins ?? null;

  let costStructureSignal: 'Capital Light' | 'Asset Heavy' | 'Mixed' | null = null;

  if (grossMargin !== null) {
    if (grossMargin > 0.45) costStructureSignal = 'Capital Light';
    else if (grossMargin < 0.25) costStructureSignal = 'Asset Heavy';
    else costStructureSignal = 'Mixed';
  }

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
      industry: summary.assetProfile?.industry ?? null,
      sector: summary.assetProfile?.sector ?? null,
    },

    revenue: {
      totalRevenue: latestIncome?.totalRevenue ?? null,
      revenueGrowth: summary.financialData?.revenueGrowth ?? null,
      operatingMargin: summary.financialData?.operatingMargins ?? null,
      profitMargin: summary.financialData?.profitMargins ?? null,
      revenueVolatility3Y,
    },

    profitability: {
      returnOnEquity: summary.financialData?.returnOnEquity ?? null,
      returnOnAssets: summary.financialData?.returnOnAssets ?? null,
      ebitdaMargin: summary.financialData?.ebitdaMargins ?? null,
    },

    scaleMetrics: {
      marketCap: summary.price?.marketCap ?? null,
      enterpriseValue: summary.defaultKeyStatistics?.enterpriseValue ?? null,
      //@ts-ignore
      totalAssets: latestBalance?.totalAssets ?? null,
      //@ts-ignore
      totalDebt: latestBalance?.totalDebt ?? null,
      beta: summary.defaultKeyStatistics?.beta ?? null,
    },

    balanceStrength: {
      debtToEquity,
      currentRatio: summary.financialData?.currentRatio ?? null,
      netDebt,
    },

    segmentData: [], // still optional unless injected from filings

    competitiveSignals: {
      grossMargins: grossMargin,
      costStructureSignal,
    },
  };
}

export const BusinessSegmentsCompetitivePositionSchema = z.object({
  revenueModelBreakdown: z
    .array(
      z.object({
        revenueStream: z.enum([
          'Recurring Fixed',
          'Recurring Ad Valorem',
          'Transactional',
          'Total',
        ]),
        amount: z.string(), // "32.5", "317.8"
        percentOfTotal: z.string(), // "10%"
        growth: z.string(), // "+15%"
        driver: z.string(),
      }),
    )
    .length(4),

  platformSegmentsPerformance: z
    .array(
      z.object({
        segment: z.enum([
          'Advised',
          'D2C',
          'Total Platform',
          'AJ Bell Investments',
          'Non-Platform',
        ]),
        customers: z.string(), // "182k", "N/A"
        aua: z.string(), // "62.4", "AUM £8.9bn"
        growth: z.string(), // "+11%"
        netInflows: z.string(), // "1.7"
        comments: z.string(),
      }),
    )
    .length(5),

  businessModelDynamics: z.array(z.string()).min(1),

  competitivePosition: z.object({
    keyCompetitors: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      )
      .min(1),
    competitiveAdvantages: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .min(1),
  }),
});

export async function getBusinessSegmentDataAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getTrimmedBusinessSegmentsData(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<
    z.infer<typeof BusinessSegmentsCompetitivePositionSchema>
  >({
    userPrompt: `
    Generate Section 6: Business Segments & Competitive Position
    Using the input: ${JSON.stringify(response)}
    Additional Context:
    - Currency Code: ${response.context.currencyCode}
    - Exchange: ${response.context.exchangeName}
    - Industry: ${response.context.industry}
    - Sector: ${response.context.sector}
    - Market Type: ${response.context.marketType}
`,
    systemPrompt: BUSINESS_SEGMENT_DATA_PROMPT,
    schema: BusinessSegmentsCompetitivePositionSchema,
    schemaName: 'BusinessSegmentsCompetitivePosition',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });

  return analysis;
}

async function getInterimResultsData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<InterimResultsData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary, annualStatements } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const { incomeStatements, cashflowStatements } = annualStatements;

  const cashFlows = cashflowStatements;

  const latestIncome = incomeStatements[0];
  const previousIncome = incomeStatements[1];

  const latestCF = cashFlows[0] as ExtendedCashFlowStatement;
  const previousCF = cashFlows[1] as ExtendedCashFlowStatement;

  const growth = (c: number | null, p: number | null) => (c && p ? (c - p) / p : null);

  const revenueGrowthHistorical = summary.financialData?.revenueGrowth ?? null;

  const latestRevenue = latestIncome?.totalRevenue ?? null;
  const prevRevenue = previousIncome?.totalRevenue ?? null;

  const latestNet = latestIncome?.netIncome ?? null;
  const prevNet = previousIncome?.netIncome ?? null;

  const latestOCF = latestCF?.totalCashFromOperatingActivities ?? null;
  const prevOCF = previousCF?.totalCashFromOperatingActivities ?? null;

  const latestFCF =
    latestCF?.totalCashFromOperatingActivities && latestCF?.capitalExpenditures
      ? latestCF.totalCashFromOperatingActivities + latestCF.capitalExpenditures
      : null;

  const prevFCF =
    previousCF?.totalCashFromOperatingActivities && previousCF?.capitalExpenditures
      ? previousCF.totalCashFromOperatingActivities + previousCF.capitalExpenditures
      : null;

  const shares = summary.defaultKeyStatistics?.sharesOutstanding ?? null;

  const impliedShares = summary.defaultKeyStatistics?.impliedSharesOutstanding ?? null;

  const shareCountChange = shares && impliedShares ? impliedShares - shares : null;

  const epsCurrent = latestNet && shares ? latestNet / shares : null;

  const epsPrevious = prevNet && shares ? prevNet / shares : null;

  const earningsTrend = summary.earningsTrend?.trend?.find((t) => t.period === '0y');

  const revenueGrowthFY1 = earningsTrend?.revenueEstimate?.growth ?? null;

  const operatingMargin = summary.financialData?.operatingMargins ?? null;

  const profitMargin = summary.financialData?.profitMargins ?? null;

  const previousMargin = null; // Not reliably available historically via Yahoo

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
      fiscalYearLabel: latestIncome?.endDate ?? null,
      previousFiscalYearLabel: previousIncome?.endDate ?? null,
    },

    fullYearComparison: {
      revenue: {
        current: latestRevenue,
        previous: prevRevenue,
        growth: growth(latestRevenue, prevRevenue),
        absoluteChange: latestRevenue && prevRevenue ? latestRevenue - prevRevenue : null,
      },
      netIncome: {
        current: latestNet,
        previous: prevNet,
        growth: growth(latestNet, prevNet),
      },
      operatingCashFlow: {
        current: latestOCF,
        previous: prevOCF,
        growth: growth(latestOCF, prevOCF),
      },
      freeCashFlow: {
        current: latestFCF,
        previous: prevFCF,
        growth: growth(latestFCF, prevFCF),
        conversionRatio: latestFCF && latestNet ? latestFCF / latestNet : null,
      },
      eps: {
        current: epsCurrent,
        previous: epsPrevious,
        growth: growth(epsCurrent, epsPrevious),
      },
      profitMargin,
      operatingMargin,
      marginExpansion: operatingMargin && previousMargin ? operatingMargin - previousMargin : null,
    },

    leverageSignals: {
      operatingLeverage:
        revenueGrowthHistorical && growth(latestNet, prevNet)
          ? growth(latestNet, prevNet)! - revenueGrowthHistorical
          : null,
      buybackSignal: shareCountChange ? shareCountChange > 0 : false,
      shareCountChange,
    },

    forwardSignals: {
      revenueFY1: earningsTrend?.revenueEstimate?.avg ?? null,
      revenueGrowthFY1,
      epsFY1: earningsTrend?.earningsEstimate?.avg ?? null,
      epsGrowthFY1: earningsTrend?.earningsEstimate?.growth ?? null,
      dividendRate: summary.summaryDetail?.dividendRate ?? null,
      forwardGrowthVsHistorical:
        revenueGrowthFY1 && revenueGrowthHistorical
          ? revenueGrowthFY1 - revenueGrowthHistorical
          : null,
    },

    riskSignals: {
      growthDeceleration:
        revenueGrowthFY1 && revenueGrowthHistorical
          ? revenueGrowthFY1 < revenueGrowthHistorical
          : false,
      marginCompressionRisk: revenueGrowthFY1 && revenueGrowthFY1 < 0.1 ? true : false,
    },
  };
}

export const InterimResultsQuarterlyPerformanceSchema = z.object({
  title: z.string(), // "FY25 Full-Year Results (Year Ended Sept 30, 2025)"

  recordFinancialPerformance: z
    .array(
      z.object({
        metric: z.enum(['Revenue', 'PBT', 'Net Income', 'Diluted EPS', 'Operating CF', 'FCF']),
        currentYearValue: z.string(), // "£317.8m", "25.56p"
        previousYearValue: z.string(), // "£269.4m"
        change: z.string(), // "+18%"
        margin: z.string(), // "32.3bps AUA", "43.4%", "-"
      }),
    )
    .length(6),

  keyPositives: z.array(z.string()).min(1),

  keyNegatives: z.array(z.string()).min(1),

  forwardGuidance: z.object({
    managementCommentary: z.object({
      ceoName: z.string(),
      quotes: z.array(z.string()).min(1),
    }),
    analystConsensusFY1: z
      .array(
        z.object({
          metric: z.enum(['Revenue', 'PBT', 'EPS', 'Dividend']),
          forecastValue: z.string(), // "£355m", "30p"
          growth: z.string(), // "+12%"
          commentary: z.string(), // short explanation
        }),
      )
      .length(4),
  }),
});

export async function getInterimResultsAndQuarterlyPerformanceAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getInterimResultsData(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<
    z.infer<typeof InterimResultsQuarterlyPerformanceSchema>
  >({
    userPrompt: `
    Generate Section 7: Interim Results & Quarterly Performance
    Using input: ${JSON.stringify(response)}
    Additional Context:
    - Currency Code: ${response.context.currencyCode}
    - Exchange: ${response.context.exchangeName}
    - Fiscal Year: ${response.context.fiscalYearLabel}
    - Previous Fiscal Year: ${response.context.previousFiscalYearLabel}
    - Market Type: ${response.context.marketType}
`,
    systemPrompt: INTERIM_RESULT_AND_QUARTERLY_PERFORMANCE_PROMPT,
    schema: InterimResultsQuarterlyPerformanceSchema,
    schemaName: 'InterimResultsQuarterlyPerformance',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });

  return analysis;
}

async function getContingentLiabilitiesData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<ContingentLiabilitiesRegulatoryRiskData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary, chart, annualStatements } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  /* ============================= */
  /* Context                       */
  /* ============================= */

  const industry = summary.assetProfile?.industry ?? null;
  const sector = summary.assetProfile?.sector ?? null;
  const country = summary.assetProfile?.country ?? null;

  /* ============================= */
  /* Scale Metrics                 */
  /* ============================= */

  const revenueTTM = summary.financialData?.totalRevenue ?? null;

  const marketCap = summary.price?.marketCap ?? null;

  const enterpriseValue = summary.defaultKeyStatistics?.enterpriseValue ?? null;

  /* ============================= */
  /* Balance Sheet                 */
  /* ============================= */

  const balanceStatements = annualStatements.balanceSheetStatements;

  const latestBalance = balanceStatements[0] as ExtendedBalanceSheet | undefined;

  const totalDebt = latestBalance?.totalDebt ?? null;
  const cash = latestBalance?.cash ?? null;

  const netDebt = totalDebt !== null && cash !== null ? totalDebt - cash : null;

  const debtToEquity =
    totalDebt && latestBalance?.totalStockholderEquity
      ? totalDebt / latestBalance.totalStockholderEquity
      : null;

  /* ============================= */
  /* Cash Flow                     */
  /* ============================= */

  const cashFlows = annualStatements.cashflowStatements;

  const latestCF = cashFlows[0] as ExtendedCashFlow | undefined;

  const freeCashFlow =
    latestCF?.totalCashFromOperatingActivities && latestCF?.capitalExpenditures
      ? latestCF.totalCashFromOperatingActivities + latestCF.capitalExpenditures
      : null;

  /* ============================= */
  /* Income                        */
  /* ============================= */

  const incomeStatements = annualStatements.incomeStatements;

  const latestIncome = incomeStatements[0] as ExtendedIncomeStatement | undefined;
  const latestInterestExpense =
    typeof latestIncome?.interestExpense === 'number' ? latestIncome.interestExpense : null;

  const netIncome = latestIncome?.netIncome ?? null;

  const fcfToNetIncome = freeCashFlow && netIncome ? freeCashFlow / netIncome : null;

  /* ============================= */
  /* Leverage Strength             */
  /* ============================= */

  const ebitda = summary.financialData?.ebitda ?? null;

  const interestCoverage = ebitda && latestInterestExpense ? ebitda / latestInterestExpense : null;

  const netDebtToEbitda = netDebt && ebitda ? netDebt / ebitda : null;

  /* ============================= */
  /* Liquidity                     */
  /* ============================= */

  const currentRatio = summary.financialData?.currentRatio ?? null;

  const quickRatio = summary.financialData?.quickRatio ?? null;

  /* ============================= */
  /* Shareholder Pressure          */
  /* ============================= */

  const dividendYield = summary.summaryDetail?.dividendYield
    ? summary.summaryDetail.dividendYield * 100
    : null;

  const payoutRatio = summary.summaryDetail?.payoutRatio ?? null;

  /* ============================= */
  /* Market Risk Signals           */
  /* ============================= */

  const oneYearReturnPercent = calculateOneYearReturnPercent(chart);

  const beta = summary.defaultKeyStatistics?.beta ?? null;

  const volatilityProxy =
    summary.summaryDetail?.fiftyTwoWeekHigh && summary.summaryDetail?.fiftyTwoWeekLow
      ? ((summary.summaryDetail.fiftyTwoWeekHigh - summary.summaryDetail.fiftyTwoWeekLow) /
          summary.summaryDetail.fiftyTwoWeekLow) *
        100
      : null;

  /* ============================= */
  /* Legal Risk Flag               */
  /* ============================= */

  const litigationKeywordFlag =
    summary.assetProfile?.longBusinessSummary?.toLowerCase().includes('litigation') ?? false;

  return {
    context: {
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
      industry,
      sector,
      country,
    },

    scaleMetrics: {
      revenueTTM,
      marketCap,
      enterpriseValue,
    },

    balanceSheet: {
      totalAssets: latestBalance?.totalAssets ?? null,
      totalLiabilities: latestBalance?.totalLiab ?? null,
      totalDebt,
      cash,
      netDebt,
      equity: latestBalance?.totalStockholderEquity ?? null,
    },

    liquidityStrength: {
      currentRatio,
      quickRatio,
    },

    profitabilityBuffer: {
      operatingMargin: summary.financialData?.operatingMargins ?? null,
      profitMargin: summary.financialData?.profitMargins ?? null,
      freeCashFlow,
      netIncome,
      fcfToNetIncome,
    },

    leverageMetrics: {
      debtToEquity,
      netDebtToEbitda,
      interestCoverage,
    },

    shareholderPressure: {
      dividendYield,
      payoutRatio,
    },

    marketRiskSignals: {
      beta,
      oneYearReturnPercent,
      volatilityProxy,
    },

    legalRiskSignals: {
      litigationKeywordFlag,
    },
  };
}

export const ContingentLiabilitiesRegulatoryRisksSchema = z.object({
  sectionTitle: z.literal('CONTINGENT LIABILITIES & REGULATORY RISKS'),

  balanceSheetContingencies: z.array(
    z.object({
      item: z.string(), // e.g. "ISA Reform Costs"
      amount: z.string(), // e.g. "£2-5m p.a."
      status: z.string(), // e.g. "Confirmed (April 2027)"
      riskLevel: z.enum(['Low', 'Low-Medium', 'Medium', 'Medium-High', 'High']),
      impact: z.string(), // explanation text
    }),
  ),

  netContingentPosition: z.object({
    quantifiedAnnualLiabilities: z.string(), // "~£5-10m annually"
    oneTimeCosts: z.string(), // "~£3-5m"
    valuationImpact: z.string(), // "Immaterial to valuation..."
  }),

  regulatoryEnvironment: z.object({
    keyRegulatoryConsiderations: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    ),
  }),
});

export async function getContingentLiabilitiesAndRegulatoryRiskAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getContingentLiabilitiesData(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<
    z.infer<typeof ContingentLiabilitiesRegulatoryRisksSchema>
  >({
    userPrompt: `
    Generate Section 8: CONTINGENT LIABILITIES & REGULATORY RISKS 
    based strictly on the following structured input data.

    Input Data:
    ${JSON.stringify(response)}

    Requirements:

    1. Populate:
      - balanceSheetContingencies[]
      - netContingentPosition
      - regulatoryEnvironment.keyRegulatoryConsiderations[]

    2. Tailor analysis to:
      - Industry: ${response.context.industry}
      - Sector: ${response.context.sector}
      - Market Type: ${response.context.marketType}
      - Currency Code: ${response.context.currencyCode}
      - Exchange: ${response.context.exchangeName}

    3. If explicit contingent liabilities are not present:
      - Infer realistic regulatory cost categories
      - Base risk classification on leverage, margins, and cash flow buffers
      - Avoid hallucinating exact confirmed amounts

    4. Ensure:
      - Risk levels are consistent with financial strength
      - Commentary reflects profitability buffer and debt position
      - Regulatory environment reflects jurisdiction context

    Return ONLY valid JSON conforming to:
    ContingentLiabilitiesRegulatoryRisksSchema
`,
    systemPrompt: CONTINGENT_LIABILITY_AND_REGULATORY_RISK_PROMPT,
    schema: ContingentLiabilitiesRegulatoryRisksSchema,
    schemaName: 'ContingentLiabilitiesRegulatoryRisks',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.context,
  });

  return analysis;
}

async function getDcfValuationRecapData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<DcfValuationRecapData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const asNumber = (value: unknown): number | null => (typeof value === 'number' ? value : null);

  return {
    company: {
      name: summary.price?.longName ?? null,
      marketType: marketContext.marketType,
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      currencySymbol: marketContext.currencySymbol,
    },
    valuation: {
      currentPrice: asNumber(summary.price?.regularMarketPrice),
      targetMeanPrice: asNumber(summary.financialData?.targetMeanPrice),
      targetHighPrice: asNumber(summary.financialData?.targetHighPrice),
      targetLowPrice: asNumber(summary.financialData?.targetLowPrice),
      recommendationKey: summary.financialData?.recommendationKey ?? null,
      enterpriseValue: asNumber(summary.defaultKeyStatistics?.enterpriseValue),
      marketCap: asNumber(summary.price?.marketCap),
      totalDebt: asNumber(summary.financialData?.totalDebt),
      totalCash: asNumber(summary.financialData?.totalCash),
    },
    dcfSignals: {
      trailingPE: asNumber(summary.summaryDetail?.trailingPE),
      forwardPE: asNumber(summary.summaryDetail?.forwardPE),
      enterpriseToRevenue: asNumber(summary.defaultKeyStatistics?.enterpriseToRevenue),
      enterpriseToEbitda: asNumber(summary.defaultKeyStatistics?.enterpriseToEbitda),
    },
  };
}

export const DcfValuationRecapAndPriceTargetSchema = z.object({
  sectionTitle: z.literal('DCF VALUATION RECAP & PRICE TARGET'),
  valuationSummaryTitle: z.string(),
  baseCaseAssumption: z.string(),
  valuationBuildUp: z.object({
    pvOfFcf: z.string(),
    pvOfTerminalValue: z.string(),
    enterpriseValue: z.string(),
    netDebt: z.string(),
    equityValue: z.string(),
    sharesDiluted: z.string(),
    fairValuePerShare: z.string(),
    currentPrice: z.string(),
    upside: z.string(),
    recommendation: z.enum(['BUY', 'HOLD', 'SELL']),
  }),
  sensitivityAnalysisRecap: z
    .array(
      z.object({
        scenario: z.enum(['Bull Case', 'Base Case', 'Bear Case']),
        assumption: z.string(),
        value: z.string(),
      }),
    )
    .length(3),
  twelveMonthPriceTarget: z.string(),
  rationaleForPriceTarget: z.array(z.string()).min(2),
});

export async function getDcfValuationRecapAndPriceTargetAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getDcfValuationRecapData(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<z.infer<typeof DcfValuationRecapAndPriceTargetSchema>>({
    userPrompt: `
Generate Section 9: DCF VALUATION RECAP & PRICE TARGET.
Input Data: ${JSON.stringify(response)}

Requirements:
1. Include valuation summary with build-up and recommendation.
2. Include exactly 3 sensitivity scenarios (bull/base/bear).
3. Include a 12-month price target and rationale bullets.
4. Keep tone institutional and objective.
5. Return only valid JSON matching DcfValuationRecapAndPriceTargetSchema.
`,
    systemPrompt: DCF_VALUATION_RECAP_AND_PRICE_TARGET_PROMPT,
    schema: DcfValuationRecapAndPriceTargetSchema,
    schemaName: 'DcfValuationRecapAndPriceTargetSchema',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.company,
  });

  return analysis;
}

async function getAgmAndShareholderMattersData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<AgmAndShareholderMattersData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const asNumber = (value: unknown): number | null => (typeof value === 'number' ? value : null);

  const exDividendDate = summary.calendarEvents?.exDividendDate?.toISOString() ?? null;

  return {
    company: {
      name: summary.price?.longName ?? null,
      marketType: marketContext.marketType,
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      currencySymbol: marketContext.currencySymbol,
    },
    agm: {
      expectedDate: exDividendDate,
      location: summary.assetProfile?.address1 ?? null,
      noticeFiledDate: exDividendDate,
    },
    governance: {
      auditRisk: asNumber(summary.assetProfile?.auditRisk),
      boardRisk: asNumber(summary.assetProfile?.boardRisk),
      compensationRisk: asNumber(summary.assetProfile?.compensationRisk),
      shareholderRightsRisk: asNumber(summary.assetProfile?.shareHolderRightsRisk),
      overallRisk: asNumber(summary.assetProfile?.overallRisk),
    },
    valuationSignals: {
      marketCap: summary.price?.marketCap ?? null,
      recommendationKey: summary.financialData?.recommendationKey ?? null,
      targetMeanPrice: summary.financialData?.targetMeanPrice ?? null,
    },
  };
}

export const AgmAndShareholderMattersSchema = z.object({
  sectionTitle: z.literal('ANNUAL GENERAL MEETING & SHAREHOLDER MATTERS'),
  nextAgmDetails: z.object({
    announcedDate: z.string(),
    location: z.string(),
    noticeFiled: z.string(),
  }),
  expectedVotingAgenda: z
    .array(
      z.object({
        resolutionNumber: z.number(),
        title: z.string(),
        type: z.enum(['Ordinary', 'Advisory', 'Special']),
        expectedResult: z.string(),
      }),
    )
    .min(5),
  specialResolutionsExpected: z.array(z.string()).min(1),
  keyGovernanceNotes: z.array(z.string()).min(2),
});

export async function getAgmAndShareholderMattersAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getAgmAndShareholderMattersData(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<z.infer<typeof AgmAndShareholderMattersSchema>>({
    userPrompt: `
Generate section for ANNUAL GENERAL MEETING & SHAREHOLDER MATTERS.
Input Data: ${JSON.stringify(response)}

Requirements:
1. Include nextAgmDetails, expectedVotingAgenda, specialResolutionsExpected, keyGovernanceNotes.
2. Keep agenda realistic for listed companies.
3. Tailor tone to market type: ${response.company.marketType}.
4. Return valid JSON only.
`,
    systemPrompt: AGM_AND_SHAREHOLDER_MATTERS_PROMPT,
    schema: AgmAndShareholderMattersSchema,
    schemaName: 'AgmAndShareholderMattersSchema',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.company,
  });

  return analysis;
}

async function getForwardProjectionsAndValuationInput(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<ForwardProjectionsValuationInput> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  return {
    company: {
      name: summary.price?.longName ?? null,
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      marketType: marketContext.marketType,
      currencySymbol: marketContext.currencySymbol,
    },
    valuationSignals: {
      currentPrice: summary.price?.regularMarketPrice ?? null,
      targetMeanPrice: summary.financialData?.targetMeanPrice ?? null,
      recommendationKey: summary.financialData?.recommendationKey ?? null,
      marketCap: summary.price?.marketCap ?? null,
    },
    forwardSignals: {
      revenueGrowth: summary.financialData?.revenueGrowth ?? null,
      earningsGrowth: summary.financialData?.earningsGrowth ?? null,
      operatingMargins: summary.financialData?.operatingMargins ?? null,
      profitMargins: summary.financialData?.profitMargins ?? null,
      returnOnEquity: summary.financialData?.returnOnEquity ?? null,
      debtToEquity: summary.financialData?.debtToEquity ?? null,
    },
  };
}

export const ForwardProjectionsAndValuationSchema = z.object({
  sectionTitle: z.literal('FORWARD PROJECTIONS: P&L, BALANCE SHEET & VALUATION'),
  projectedIncomeStatement: z
    .array(
      z.object({
        metric: z.string(),
        fy26e: z.string(),
        fy27e: z.string(),
        fy28e: z.string(),
        fy29e: z.string(),
        fy30e: z.string(),
      }),
    )
    .min(8),
  keyProjectionDrivers: z.array(z.string()).min(3).max(5),
  projectedBalanceSheet: z
    .array(
      z.object({
        item: z.string(),
        fy25a: z.string(),
        fy26e: z.string(),
        fy27e: z.string(),
        fy28e: z.string(),
        fy29e: z.string(),
        fy30e: z.string(),
      }),
    )
    .min(5),
  balanceSheetDynamics: z.array(z.string()).min(3).max(5),
  projectedCashFlow: z
    .array(
      z.object({
        metric: z.string(),
        fy26e: z.string(),
        fy27e: z.string(),
        fy28e: z.string(),
        fy29e: z.string(),
        fy30e: z.string(),
      }),
    )
    .min(5),
  keyObservations: z.array(z.string()).min(3).max(5),
  creditMetricsProjection: z
    .array(
      z.object({
        metric: z.string(),
        fy26e: z.string(),
        fy27e: z.string(),
        fy28e: z.string(),
        fy29e: z.string(),
        fy30e: z.string(),
      }),
    )
    .min(4),
  creditOutlook: z.string(),
});

export async function getForwardProjectionsAndValuationAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getForwardProjectionsAndValuationInput(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<z.infer<typeof ForwardProjectionsAndValuationSchema>>({
    userPrompt: `
Generate section: FORWARD PROJECTIONS: P&L, BALANCE SHEET & VALUATION.
Input Data: ${JSON.stringify(response)}

Requirements:
1. Build realistic 5-year forward views (FY26E-FY30E) with coherent internal consistency.
2. Include all four sub-sections: projected income statement, projected balance sheet, projected cash flow & FCF, credit metrics projection.
3. Use ${response.company.currencyCode} formatting with readable financial notation.
4. Tailor risk/credit narrative to market type: ${response.company.marketType}.
5. Return valid JSON only matching schema.
`,
    systemPrompt: FORWARD_PROJECTIONS_AND_VALUATION_PROMPT,
    schema: ForwardProjectionsAndValuationSchema,
    schemaName: 'ForwardProjectionsAndValuationSchema',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.company,
  });

  return analysis;
}

async function getConclusionRecommendationData(
  symbol: string,
  sourceBundle?: ReportSourceBundle,
): Promise<ConclusionRecommendationData> {
  const sharedBundle = sourceBundle ?? (await getReportSourceBundle(symbol));
  const { summary, chart } = sharedBundle;
  const marketContext = resolveReportMarketContext(sharedBundle);

  const profile = summary.assetProfile;
  const oneYearReturnPercent = calculateOneYearReturnPercent(chart);

  return {
    company: {
      name: summary.price?.longName ?? null,
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      marketType: marketContext.marketType,
      currencyCode: marketContext.currencyCode,
      exchangeName: marketContext.exchangeName,
      currencySymbol: marketContext.currencySymbol,
    },
    valuation: {
      currentPrice: summary.price?.regularMarketPrice ?? null,
      targetMeanPrice: summary.financialData?.targetMeanPrice ?? null,
      targetHighPrice: summary.financialData?.targetHighPrice ?? null,
      targetLowPrice: summary.financialData?.targetLowPrice ?? null,
      recommendationKey: summary.financialData?.recommendationKey ?? null,
      trailingPE: summary.summaryDetail?.trailingPE ?? null,
      forwardPE: summary.summaryDetail?.forwardPE ?? null,
      marketCap: summary.price?.marketCap ?? null,
      fiftyTwoWeekHigh: summary.summaryDetail?.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: summary.summaryDetail?.fiftyTwoWeekLow ?? null,
      oneYearReturnPercent,
    },
    fundamentals: {
      revenueGrowth: summary.financialData?.revenueGrowth ?? null,
      earningsGrowth: summary.financialData?.earningsGrowth ?? null,
      returnOnEquity: summary.financialData?.returnOnEquity ?? null,
      operatingMargin: summary.financialData?.operatingMargins ?? null,
      profitMargin: summary.financialData?.profitMargins ?? null,
      totalDebt: summary.financialData?.totalDebt ?? null,
      totalCash: summary.financialData?.totalCash ?? null,
      freeCashFlow: summary.financialData?.freeCashflow ?? null,
    },
  };
}

export const ConclusionAndRecommendationSchema = z.object({
  sectionTitle: z.literal('CONCLUSION'),
  summary: z.string(),
  strengths: z.array(z.string()).min(3),
  valuationSummary: z.string(),
  analystConsensus: z.string(),
  investorFit: z.array(z.string()).min(2),
  entryStrategy: z.array(z.string()).min(2),
  upsideCatalysts: z.array(z.string()).min(3),
  downsideCatalysts: z.array(z.string()).min(3),
  recommendation: z.enum(['BUY', 'HOLD', 'SELL']),
  priceTarget: z.string(),
  expectedReturn: z.string(),
  timeHorizon: z.string(),
  riskProfile: z.string(),
  disclaimer: z.string(),
});

export async function getConclusionAndRecommendationAboutCompany(
  symbol: string,
  options?: SectionGenerationOptions,
) {
  const response = await getConclusionRecommendationData(symbol, options?.sourceBundle);

  const analysis = await fetchReportSection<z.infer<typeof ConclusionAndRecommendationSchema>>({
    userPrompt: `
Generate final Section 9: CONCLUSION.
Input Data: ${JSON.stringify(response)}

Requirements:
1. Focus on investment conclusion for institutional / advanced retail investors.
2. Use specific valuation context from current price and target metrics.
3. Include clear risk-reward framing and recommendation.
4. Output only valid JSON for ConclusionAndRecommendationSchema.
`,
    systemPrompt: CONCLUSION_AND_RECOMMENDATION_PROMPT,
    schema: ConclusionAndRecommendationSchema,
    schemaName: 'ConclusionAndRecommendationSchema',
    enableWebSearch: options?.enableWebSearch,
    marketContext: response.company,
  });

  return analysis;
}
