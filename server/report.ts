import 'server-only';
import YahooFinance from 'yahoo-finance2';
import { z } from 'zod';
import { fetchSection } from './common';
import {
  ANALYST_RECOMMENDATION_PROMPT,
  BUSINESS_SEGMENT_DATA_PROMPT,
  CONTINGENT_LIABILITY_AND_REGULATORY_RISK_PROMPT,
  EQUITY_VALUATION_PROMPT,
  EXECUTIVE_PROMPT,
  FINANCIAL_STATEMENT_ANALYSIS_PROMPT,
  INTERIM_RESULT_AND_QUARTERLY_PERFORMANCE_PROMPT,
  OVERVIEW_PROMPT,
  SHARE_HOLDER_STRUCTURE_PROMPT,
} from '@/lib';
interface StockResearchData {
  company: {
    name: string | null;
    sector: string | null;
    industry: string | null;
    employees: number | null;
  };
  valuation: {
    price: number | null;
    marketCap: number | null;
    trailingPE: number | null;
    forwardPE: number | null;
    priceToBook: number | null;
    evToRevenue: number | null;
    evToEbitda: number | null;
    beta: number | null;
  };
  financials: {
    revenueTTM: number | null;
    netIncomeTTM: number | null;
    revenueYoYGrowth: number | null;
    netMargin: number | null;
    freeCashFlow: number | null;
    totalDebt: number | null;
    totalCash: number | null;
    roe: number | null;
  };
  analyst: {
    targetMean: number | null;
    upsidePercent: number | null;
    recommendationKey: string | null;
    earningsGrowth: number | null;
    revenueGrowth: number | null;
  };
  pricePerformance: {
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    oneYearReturn: number | null;
  };
  dividends: {
    totalDividendsLastYear: number | null;
    dividendYield: number | null;
  };
  currency: string;
}

const yahooFinance = new YahooFinance();
export async function getTrimmedExecutiveData(
  symbol: string,
): Promise<StockResearchData> {
  const [summary, chart] = await Promise.all([
    yahooFinance.quoteSummary(symbol, {
      modules: [
        'assetProfile',
        'price',
        'summaryDetail',
        'financialData',
        'defaultKeyStatistics',
        'incomeStatementHistory',
        'earningsTrend',
      ],
    }),
    yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 5 * 365.25 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      period2: new Date().toISOString().slice(0, 10),
      interval: '1mo',
      events: 'div',
    }),
  ]);

  const safe = (v: any) => v ?? null;

  // ---- Financials ----
  const income = summary.incomeStatementHistory?.incomeStatementHistory || [];
  const latest = income[0];
  const previous = income[1];

  const revenueTTM = latest?.totalRevenue ?? null;
  const netIncomeTTM = latest?.netIncome ?? null;

  const revenueYoYGrowth =
    revenueTTM && previous?.totalRevenue
      ? ((revenueTTM - previous.totalRevenue) / previous.totalRevenue) * 100
      : null;

  const netMargin =
    revenueTTM && netIncomeTTM ? (netIncomeTTM / revenueTTM) * 100 : null;

  // ---- Analyst ----
  const currentPrice = summary.price?.regularMarketPrice ?? null;
  const targetMean = summary.financialData?.targetMeanPrice ?? null;

  const upsidePercent =
    currentPrice && targetMean
      ? ((targetMean - currentPrice) / currentPrice) * 100
      : null;

  // ---- Dividends ----
  const dividends =
    chart.events?.dividends?.reduce((sum, d) => sum + (d.amount ?? 0), 0) ??
    null;

  // ---- 1Y Return ----
  const quotes = chart.quotes || [];
  const firstClose = quotes[0]?.adjclose ?? null;
  const lastClose = quotes[quotes.length - 1]?.adjclose ?? null;

  const oneYearReturn =
    firstClose && lastClose
      ? ((lastClose - firstClose) / firstClose) * 100
      : null;

  return {
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
      roe: safe(summary.financialData?.returnOnEquity) * 100,
    },

    analyst: {
      targetMean,
      upsidePercent,
      recommendationKey: safe(summary.financialData?.recommendationKey),
      earningsGrowth: safe(summary.financialData?.earningsGrowth) * 100,
      revenueGrowth: safe(summary.financialData?.revenueGrowth) * 100,
    },

    pricePerformance: {
      fiftyTwoWeekHigh: safe(summary.summaryDetail?.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: safe(summary.summaryDetail?.fiftyTwoWeekLow),
      oneYearReturn,
    },

    dividends: {
      totalDividendsLastYear: dividends,
      dividendYield: safe(summary.summaryDetail?.dividendYield) * 100,
    },
    currency: 'INR',
  };
}

export async function getExecutiveInformationAboutCompany(symbol: string) {
  const response = await getTrimmedExecutiveData(symbol);
  const analysis = await fetchSection<z.infer<typeof ExecutiveSchema>>({
    userPrompt: `Input data: ${JSON.stringify(response)}`,
    systemPrompt: EXECUTIVE_PROMPT,
    schema: ExecutiveSchema,
    schemaName: 'ExecutiveSchema',
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

interface CompanyOverviewMetrics {
  price: number | null;
  marketCap: number | null;
  sharesOutstanding: number | null;

  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyTwoWeekRangePercent: number | null;

  trailingPE: number | null;
  forwardPE: number | null;

  dividendYield: number | null;
  annualDividend: number | null;

  analystTargetMean: number | null;
  analystTargetHigh: number | null;
  analystTargetLow: number | null;
  analystCount: number | null;

  oneYearReturnPercent: number | null;
  recoveryFromLowPercent: number | null;

  // NEW
  dcfFairValue: number | null;
  wacc: number | null;
  terminalGrowth: number;
  asOfDate: string | null;
}

export async function getTrimmedCompanyOverviewMetrics(
  symbol: string,
  terminalGrowth = 0.04, // 4% default India large cap
  riskFreeRate = 0.07, // 7% India 10Y G-Sec
  marketRiskPremium = 0.06, // 6% India ERP
): Promise<CompanyOverviewMetrics> {
  const [summary, chart] = await Promise.all([
    yahooFinance.quoteSummary(symbol, {
      modules: [
        'price',
        'summaryDetail',
        'financialData',
        'defaultKeyStatistics',
      ],
    }),
    yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 1 * 365.25 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      period2: new Date().toISOString().slice(0, 10),
      interval: '1mo',
    }),
  ]);

  const safe = (v: any) => v ?? null;

  const price = summary.price?.regularMarketPrice ?? null;
  const high52 = summary.summaryDetail?.fiftyTwoWeekHigh ?? null;
  const low52 = summary.summaryDetail?.fiftyTwoWeekLow ?? null;

  const sharesOutstanding =
    summary.defaultKeyStatistics?.sharesOutstanding ?? null;

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

    const terminalValue =
      (projectedFCF * (1 + terminalGrowth)) / (wacc - terminalGrowth);

    const discountedTerminal = terminalValue / Math.pow(1 + wacc, 5);

    const enterpriseValue = totalPV + discountedTerminal;

    const equityValue = enterpriseValue + totalCash - totalDebt;

    dcfFairValue = equityValue / sharesOutstanding;
  }

  // --------------------------
  // Performance Metrics
  // --------------------------

  const fiftyTwoWeekRangePercent =
    high52 && low52 ? ((high52 - low52) / low52) * 100 : null;

  const recoveryFromLowPercent =
    price && low52 ? ((price - low52) / low52) * 100 : null;

  const quotes = chart.quotes || [];
  const firstClose = quotes[0]?.adjclose ?? null;
  const lastClose = quotes[quotes.length - 1]?.adjclose ?? null;

  const oneYearReturnPercent =
    firstClose && lastClose
      ? ((lastClose - firstClose) / firstClose) * 100
      : null;

  return {
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

export async function getOverviewMetricsAboutCompany(symbol: string) {
  const response = await getTrimmedCompanyOverviewMetrics(symbol);
  const analysis = await fetchSection<z.infer<typeof CompanyOverviewSchema>>({
    userPrompt: `Generate the Company Overview & Stock Metrics section using the following input data:

CompanyOverviewMetrics:
${JSON.stringify(response)}`,
    systemPrompt: OVERVIEW_PROMPT,
    schema: CompanyOverviewSchema,
    schemaName: 'OverviewAndStockMetrics',
  });
  return analysis;
}

 const CompanyOverviewSchema = z.object({
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

interface ShareholderStructure {
  freeFloatPercent: number | null;
  institutionalPercent: number | null;
  insiderPercent: number | null;

  sharesOutstanding: number | null;
  floatShares: number | null;

  majorInstitutions: {
    name: string;
    percentHeld: number;
  }[];

  insiderSummary: {
    totalBuysValue: number;
    totalSellsValue: number;
    netActivity: 'NET_BUY' | 'NET_SELL' | 'NEUTRAL';
    largestTransaction: {
      name: string | null;
      type: 'BUY' | 'SELL' | null;
      value: number | null;
      date: string | null;
    };
    activeInsiders: number;
    transactionCount: number;
  };
}

export async function getTrimmedShareholderStructure(
  symbol: string,
): Promise<ShareholderStructure> {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: [
      'defaultKeyStatistics',
      'majorHoldersBreakdown',
      'institutionOwnership',
      'insiderTransactions',
    ],
  });

  const safe = (v: any) => v ?? null;

  // --------------------------
  // Ownership Breakdown
  // --------------------------

  const institutionalPercent = summary.majorHoldersBreakdown
    ?.institutionsPercentHeld
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
    summary.institutionOwnership?.ownershipList?.map((inst: any) => ({
      name: inst.organization,
      percentHeld: inst.percentHeld ? inst.percentHeld * 100 : 0,
    })) ?? [];

  // --------------------------
  // Insider Transaction Analytics
  // --------------------------

  const transactions = summary.insiderTransactions?.transactions ?? [];

  let totalBuysValue = 0;
  let totalSellsValue = 0;
  let largestTransactionValue = 0;
  let largestTransaction: any = null;

  const uniqueInsiders = new Set<string>();

  for (const tx of transactions) {
    const value = tx.value ?? 0;
    const isBuy = tx.transactionText?.toLowerCase().includes('buy');

    uniqueInsiders.add(tx.filerName);

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
        date: tx.startDate
          ? new Date(tx.startDate).toLocaleDateString('en-IN')
          : null,
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
        shareHolderType: z.enum([
          'FREE_FLOAT',
          'INSTITUTIONAL_HOLDINGS',
          'MANAGEMENT_DIRECTORS',
        ]),
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

export async function getShareholderStructureAboutCompany(symbol: string) {
  const response = await getTrimmedShareholderStructure(symbol);
  const analysis = await fetchSection<
    z.infer<typeof ShareholderStructureSectionSchema>
  >({
    userPrompt: `Generate the "Shareholder Structure & Insider Activity" section using the following structured input data: ShareholderStructureRawData: ${JSON.stringify(response)}`,
    systemPrompt: SHARE_HOLDER_STRUCTURE_PROMPT,
    schema: ShareholderStructureSectionSchema,
    schemaName: 'ShareHolderStructure',
  });
  return analysis;
}

interface AnalystRecommendationsData {
  currentPrice: number | null;
  currency: string | null;
  reportingPeriod: string;

  ratings: {
    buy: number;
    hold: number;
    sell: number;
    strongBuy: number;
    strongSell: number;
    total: number;
  };

  priceTargets: {
    mean: number | null;
    median: number | null;
    high: number | null;
    low: number | null;
  };

  recommendationKey: string | null;
}

export async function getAnalystRecommendationsData(
  symbol: string,
  reportingPeriod: string = 'Last 3 Months',
): Promise<AnalystRecommendationsData> {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: ['price', 'financialData', 'recommendationTrend'],
  });

  // -------------------------
  // Current Market Data
  // -------------------------

  const currentPrice = summary.price?.regularMarketPrice ?? null;
  const currency = summary.price?.currency ?? null;

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
    currentPrice,
    currency,
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

export async function getAnalystRecommendationsAboutCompany(symbol: string) {
  const response = await getAnalystRecommendationsData(symbol);

  const analysis = await fetchSection<
    z.infer<typeof AnalystRecommendationsSchema>
  >({
    userPrompt: `Generate the "Analyst Recommendations & Price Targets" section using the following structured input: ${JSON.stringify(response)}`,
    systemPrompt: ANALYST_RECOMMENDATION_PROMPT,
    schema: AnalystRecommendationsSchema,
    schemaName: 'AnalystRecommendations',
  });
  return analysis;
}

interface EquityValuationData {
  context: {
    currency: string | null;
    forecastYears: number;
    currentPrice: number | null;
    reportingStandard: 'UK' | 'US' | 'India' | 'Global';
  };

  assumptions: {
    wacc: number;
    terminalGrowth: number;
    forecastYears: number;
    revenueGrowth: number;
    taxRate: number;
  };

  projections: {
    year: number;
    revenue: number;
    revenueGrowth: number;
    netIncome: number;
    shares: number;
    eps: number;
  }[];

  valuation: {
    pvOfFCF: number;
    pvOfTerminalValue: number;
    enterpriseValue: number;
    netDebt: number;
    equityValue: number;
    fairValuePerShare: number;
    impliedUpsidePercent: number | null;
  };

  sensitivityTable: {
    wacc: number;
    terminalGrowth: number;
    fairValue: number;
  }[];
}

export async function getTrimmedEquityValuationData(
  symbol: string,
  options?: {
    wacc?: number;
    terminalGrowth?: number;
    forecastYears?: number;
    revenueGrowth?: number;
    taxRate?: number;
    reportingStandard?: 'UK' | 'US' | 'India' | 'Global';
  },
): Promise<EquityValuationData> {
  const {
    wacc = 0.085,
    terminalGrowth = 0.035,
    forecastYears = 5,
    revenueGrowth = 0.12,
    taxRate = 0.19,
    reportingStandard = 'Global',
  } = options || {};

  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: [
      'price',
      'financialData',
      'defaultKeyStatistics',
      'incomeStatementHistory',
    ],
  });

  // -----------------------------
  // Context
  // -----------------------------

  const currentPrice = summary.price?.regularMarketPrice ?? null;

  const currency = summary.price?.currency ?? null;

  // -----------------------------
  // Financial Inputs
  // -----------------------------

  const shares = summary.defaultKeyStatistics?.sharesOutstanding ?? 0;

  const totalDebt = summary.financialData?.totalDebt ?? 0;

  const totalCash = summary.financialData?.totalCash ?? 0;

  const netDebt = totalDebt - totalCash;

  const latestRevenue =
    summary.incomeStatementHistory?.incomeStatementHistory?.[0]?.totalRevenue ??
    0;

  const latestNetIncome =
    summary.incomeStatementHistory?.incomeStatementHistory?.[0]?.netIncome ?? 0;

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

  const terminalValue =
    (finalYearIncome * (1 + terminalGrowth)) / (wacc - terminalGrowth);

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
      currency,
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
        modelName: z.enum([
          'WACC',
          'TERMINAL_GROWTH_RATE',
          'FORECAST_PERIOD',
          'REVENUE_GROWTH',
        ]),
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

export async function getEquityValuationAboutCompany(symbol: string) {
  const response = await getTrimmedEquityValuationData(symbol);
  const analysis = await fetchSection<z.infer<typeof EquityValuationDcfSchema>>(
    {
      userPrompt: `Generate Section 4: Equity Valuation & DCF Analysis Using the following structured input from getEquityValuationData: ${JSON.stringify(response)}`,
      systemPrompt: EQUITY_VALUATION_PROMPT,
      schema: EquityValuationDcfSchema,
      schemaName: 'EquityValuationDcf',
    },
  );
  return analysis;
}

interface FinancialStatementsAnalysisData {
  context: {
    currency: string | null;
    reportingStandard: 'UK' | 'US' | 'India' | 'Global';
    fiscalYearsCovered: string; // "FY20–FY25"
  };

  incomeStatement: {
    fiscalYear: string;
    revenue: number | null;
    operatingIncome: number | null;
    netIncome: number | null;
    eps: number | null;
  }[];

  balanceSheet: {
    fiscalYear: string;
    cash: number | null;
    totalAssets: number | null;
    totalDebt: number | null;
    shareholdersEquity: number | null;
  }[];

  cashFlow: {
    fiscalYear: string;
    operatingCF: number | null;
    capex: number | null;
    freeCF: number | null;
    dividendsPaid: number | null;
    shareBuyback: number | null;
  }[];

  ratios: {
    fiscalYear: string;
    pe: number | null;
    debtToEquity: number | null;
    roe: number | null;
    currentRatio: number | null;
  }[];
}

export async function getTrimmedFinancialStatementsAnalysisData(
  symbol: string,
  reportingStandard: 'UK' | 'US' | 'India' | 'Global' = 'Global',
): Promise<FinancialStatementsAnalysisData> {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: [
      'price',
      'incomeStatementHistory',
      'balanceSheetHistory',
      'cashflowStatementHistory',
      'defaultKeyStatistics',
      'financialData',
    ],
  });

  const currency = summary.price?.currency ?? null;

  const incomeStatements =
    summary.incomeStatementHistory?.incomeStatementHistory ?? [];

  const balanceSheets =
    summary.balanceSheetHistory?.balanceSheetStatements ?? [];

  const cashFlows = summary.cashflowStatementHistory?.cashflowStatements ?? [];

  // Take latest 6 fiscal years
  const latestIncome = incomeStatements.slice(0, 6);
  const latestBalance = balanceSheets.slice(0, 6);
  const latestCashFlow = cashFlows.slice(0, 6);

  const sharesOutstanding =
    summary.defaultKeyStatistics?.sharesOutstanding ?? null;

  const currentPrice = summary.price?.regularMarketPrice ?? null;

  // Helper to format fiscal year label like FY20
  const getFYLabel = (date: string) => {
    const year = new Date(date).getFullYear();
    return `FY${String(year).slice(-2)}`;
  };

  const incomeStatement = latestIncome.map((stmt: any) => ({
    fiscalYear: getFYLabel(stmt.endDate),
    revenue: stmt.totalRevenue ?? null,
    operatingIncome: stmt.operatingIncome ?? null,
    netIncome: stmt.netIncome ?? null,
    eps:
      stmt.netIncome && sharesOutstanding
        ? stmt.netIncome / sharesOutstanding
        : null,
  }));

  const balanceSheet = latestBalance.map((bs: any) => ({
    fiscalYear: getFYLabel(bs.endDate),
    cash: bs.cash ?? null,
    totalAssets: bs.totalAssets ?? null,
    totalDebt: bs.totalDebt ?? null,
    shareholdersEquity: bs.totalStockholderEquity ?? null,
  }));

  const cashFlow = latestCashFlow.map((cf: any) => ({
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
      currency,
      reportingStandard,
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
          fiscalYear: z.enum([
            'FY20',
            'FY21',
            'FY22',
            'FY23',
            'FY24',
            'FY25',
            'FY25_EST',
          ]),
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
          fiscalYear: z.enum([
            'FY20',
            'FY21',
            'FY22',
            'FY23',
            'FY24',
            'FY25',
            'FY25_EST',
          ]),
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
          fiscalYear: z.enum([
            'FY20',
            'FY21',
            'FY22',
            'FY23',
            'FY24',
            'FY25',
            'FY25_EST',
          ]),
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
) {
  const response = await getTrimmedFinancialStatementsAnalysisData(symbol);

  const analysis = await fetchSection<
    z.infer<typeof FinancialStatementsAnalysisSchema>
  >({
    userPrompt: `
    Generate Section 5: Financial Statements Analysis 
    Using the following structured data from getFinancialStatementsAnalysisData: ${JSON.stringify(response)}
`,
    systemPrompt: FINANCIAL_STATEMENT_ANALYSIS_PROMPT,
    schema: FinancialStatementsAnalysisSchema,
    schemaName: 'FinancialStatementsAnalysis',
  });

  return analysis;
}

interface BusinessSegmentsData {
  context: {
    currency: string | null;
    industry: string | null;
    sector: string | null;
    marketType: 'UK' | 'US' | 'India' | 'Global';
  };

  revenue: {
    totalRevenue: number | null;
    revenueGrowth: number | null;
    operatingMargin: number | null;
    profitMargin: number | null;
    revenueVolatility3Y: number | null; // std dev growth proxy
  };

  profitability: {
    returnOnEquity: number | null;
    returnOnAssets: number | null;
    ebitdaMargin: number | null;
  };

  scaleMetrics: {
    marketCap: number | null;
    enterpriseValue: number | null;
    totalAssets: number | null;
    totalDebt: number | null;
    beta: number | null;
  };

  balanceStrength: {
    debtToEquity: number | null;
    currentRatio: number | null;
    netDebt: number | null;
  };

  segmentData: {
    name: string;
    revenue: number | null;
    revenueGrowth: number | null;
  }[];

  competitiveSignals: {
    grossMargins: number | null;
    costStructureSignal: 'Capital Light' | 'Asset Heavy' | 'Mixed' | null;
  };
}

export async function getTrimmedBusinessSegmentsData(
  symbol: string,
  marketType: 'UK' | 'US' | 'India' | 'Global' = 'Global',
): Promise<BusinessSegmentsData> {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: [
      'price',
      'assetProfile',
      'financialData',
      'defaultKeyStatistics',
      'incomeStatementHistory',
      'balanceSheetHistory',
    ],
  });

  const currency = summary.price?.currency ?? null;

  const incomeStatements =
    summary.incomeStatementHistory?.incomeStatementHistory ?? [];

  const latestIncome = incomeStatements[0] ?? null;

  const balanceSheets =
    summary.balanceSheetHistory?.balanceSheetStatements ?? [];

  const latestBalance = balanceSheets[0] ?? null;

  // 3Y revenue volatility (growth consistency proxy)
  const revenues = incomeStatements
    .slice(0, 3)
    .map((i: any) => i.totalRevenue)
    .filter(Boolean);

  let revenueVolatility3Y: number | null = null;

  if (revenues.length === 3) {
    const growthRates = [
      (revenues[0] - revenues[1]) / revenues[1],
      (revenues[1] - revenues[2]) / revenues[2],
    ];

    const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

    revenueVolatility3Y = Math.sqrt(
      growthRates.map((g) => Math.pow(g - mean, 2)).reduce((a, b) => a + b, 0) /
        growthRates.length,
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

  let costStructureSignal: 'Capital Light' | 'Asset Heavy' | 'Mixed' | null =
    null;

  if (grossMargin !== null) {
    if (grossMargin > 0.45) costStructureSignal = 'Capital Light';
    else if (grossMargin < 0.25) costStructureSignal = 'Asset Heavy';
    else costStructureSignal = 'Mixed';
  }

  return {
    context: {
      currency,
      industry: summary.assetProfile?.industry ?? null,
      sector: summary.assetProfile?.sector ?? null,
      marketType,
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

export async function getBusinessSegmentDataAboutCompany(symbol: string) {
  const response = await getTrimmedBusinessSegmentsData(symbol);

  const analysis = await fetchSection<
    z.infer<typeof BusinessSegmentsCompetitivePositionSchema>
  >({
    userPrompt: `
    Generate Section 6: Business Segments & Competitive Position
    Using the input: ${JSON.stringify(response)}
    Additional Context:
    - Currency: ${response.context.currency}
    - Industry: ${response.context.industry}
    - Sector: ${response.context.sector}
    - Market Type: ${response.context.marketType}
`,
    systemPrompt: BUSINESS_SEGMENT_DATA_PROMPT,
    schema: BusinessSegmentsCompetitivePositionSchema,
    schemaName: 'BusinessSegmentsCompetitivePosition',
  });

  return analysis;
}

interface InterimResultsData {
  context: {
    currency: string | null;
    fiscalYearLabel: Date | null;
    previousFiscalYearLabel: Date | null;
    marketType: 'UK' | 'US' | 'India' | 'Global';
  };

  fullYearComparison: {
    revenue: {
      current: number | null;
      previous: number | null;
      growth: number | null;
      absoluteChange: number | null;
    };
    netIncome: {
      current: number | null;
      previous: number | null;
      growth: number | null;
    };
    operatingCashFlow: {
      current: number | null;
      previous: number | null;
      growth: number | null;
    };
    freeCashFlow: {
      current: number | null;
      previous: number | null;
      growth: number | null;
      conversionRatio: number | null; // FCF / Net Income
    };
    eps: {
      current: number | null;
      previous: number | null;
      growth: number | null;
    };
    profitMargin: number | null;
    operatingMargin: number | null;
    marginExpansion: number | null; // current - previous margin
  };

  leverageSignals: {
    operatingLeverage: number | null; // revenue growth vs net income growth
    buybackSignal: boolean;
    shareCountChange: number | null;
  };

  forwardSignals: {
    revenueFY1: number | null;
    revenueGrowthFY1: number | null;
    epsFY1: number | null;
    epsGrowthFY1: number | null;
    dividendRate: number | null;
    forwardGrowthVsHistorical: number | null;
  };

  riskSignals: {
    growthDeceleration: boolean;
    marginCompressionRisk: boolean;
  };
}

type ExtendedCashFlowStatement = {
  totalCashFromOperatingActivities?: number;
  capitalExpenditures?: number;
};

export async function getInterimResultsData(
  symbol: string,
  marketType: 'UK' | 'US' | 'India' | 'Global' = 'Global',
): Promise<InterimResultsData> {
  const summary = await yahooFinance.quoteSummary(symbol, {
    modules: [
      'price',
      'incomeStatementHistory',
      'cashflowStatementHistory',
      'financialData',
      'defaultKeyStatistics',
      'earningsTrend',
      'summaryDetail',
    ],
  });

  const currency = summary.price?.currency ?? null;

  const incomeStatements =
    summary.incomeStatementHistory?.incomeStatementHistory ?? [];

  const cashFlows = summary.cashflowStatementHistory?.cashflowStatements ?? [];

  const latestIncome = incomeStatements[0];
  const previousIncome = incomeStatements[1];

  const latestCF = cashFlows[0] as ExtendedCashFlowStatement;
  const previousCF = cashFlows[1] as ExtendedCashFlowStatement;

  const growth = (c: number | null, p: number | null) =>
    c && p ? (c - p) / p : null;

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
    previousCF?.totalCashFromOperatingActivities &&
    previousCF?.capitalExpenditures
      ? previousCF.totalCashFromOperatingActivities +
        previousCF.capitalExpenditures
      : null;

  const shares = summary.defaultKeyStatistics?.sharesOutstanding ?? null;

  const impliedShares =
    summary.defaultKeyStatistics?.impliedSharesOutstanding ?? null;

  const shareCountChange =
    shares && impliedShares ? impliedShares - shares : null;

  const epsCurrent = latestNet && shares ? latestNet / shares : null;

  const epsPrevious = prevNet && shares ? prevNet / shares : null;

  const earningsTrend = summary.earningsTrend?.trend?.find(
    (t) => t.period === '0y',
  );

  const revenueGrowthFY1 = earningsTrend?.revenueEstimate?.growth ?? null;

  const operatingMargin = summary.financialData?.operatingMargins ?? null;

  const profitMargin = summary.financialData?.profitMargins ?? null;

  const previousMargin = null; // Not reliably available historically via Yahoo

  return {
    context: {
      currency,
      fiscalYearLabel: latestIncome?.endDate ?? null,
      previousFiscalYearLabel: previousIncome?.endDate ?? null,
      marketType,
    },

    fullYearComparison: {
      revenue: {
        current: latestRevenue,
        previous: prevRevenue,
        growth: growth(latestRevenue, prevRevenue),
        absoluteChange:
          latestRevenue && prevRevenue ? latestRevenue - prevRevenue : null,
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
      marginExpansion:
        operatingMargin && previousMargin
          ? operatingMargin - previousMargin
          : null,
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
      marginCompressionRisk:
        revenueGrowthFY1 && revenueGrowthFY1 < 0.1 ? true : false,
    },
  };
}

export const InterimResultsQuarterlyPerformanceSchema = z.object({
  title: z.string(), // "FY25 Full-Year Results (Year Ended Sept 30, 2025)"

  recordFinancialPerformance: z
    .array(
      z.object({
        metric: z.enum([
          'Revenue',
          'PBT',
          'Net Income',
          'Diluted EPS',
          'Operating CF',
          'FCF',
        ]),
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

export type InterimResultsQuarterlyPerformanceSection = z.infer<
  typeof InterimResultsQuarterlyPerformanceSchema
>;

export async function getInterimResultsAndQuarterlyPerformanceAboutCompany(
  symbol: string,
) {
  const response = await getInterimResultsData(symbol);

  const analysis = await fetchSection<
    z.infer<typeof InterimResultsQuarterlyPerformanceSchema>
  >({
    userPrompt: `
    Generate Section 7: Interim Results & Quarterly Performance
    Using input: ${JSON.stringify(response)}
    Additional Context:
    - Currency: ${response.context.currency}
    - Fiscal Year: ${response.context.fiscalYearLabel}
    - Previous Fiscal Year: ${response.context.previousFiscalYearLabel}
    - Market Type: ${response.context.marketType}
`,
    systemPrompt: INTERIM_RESULT_AND_QUARTERLY_PERFORMANCE_PROMPT,
    schema: InterimResultsQuarterlyPerformanceSchema,
    schemaName: 'InterimResultsQuarterlyPerformance',
  });

  return analysis;
}

interface ContingentLiabilitiesRegulatoryRiskData {
  context: {
    currency: string | null;
    industry: string | null;
    sector: string | null;
    country: string | null;
    marketType: 'UK' | 'US' | 'India' | 'Global';
  };

  scaleMetrics: {
    revenueTTM: number | null;
    marketCap: number | null;
    enterpriseValue: number | null;
  };

  balanceSheet: {
    totalAssets: number | null;
    totalLiabilities: number | null;
    totalDebt: number | null;
    cash: number | null;
    netDebt: number | null;
    equity: number | null;
  };

  liquidityStrength: {
    currentRatio: number | null;
    quickRatio: number | null;
  };

  profitabilityBuffer: {
    operatingMargin: number | null;
    profitMargin: number | null;
    freeCashFlow: number | null;
    netIncome: number | null;
    fcfToNetIncome: number | null;
  };

  leverageMetrics: {
    debtToEquity: number | null;
    netDebtToEbitda: number | null;
    interestCoverage: number | null;
  };

  shareholderPressure: {
    dividendYield: number | null;
    payoutRatio: number | null;
  };

  marketRiskSignals: {
    beta: number | null;
    oneYearReturnPercent: number | null;
    volatilityProxy: number | null;
  };

  legalRiskSignals: {
    litigationKeywordFlag: boolean;
  };
}

type ExtendedBalanceSheet = {
  totalAssets?: number;
  totalLiab?: number;
  totalDebt?: number;
  cash?: number;
  totalStockholderEquity?: number;
};

type ExtendedCashFlow = {
  totalCashFromOperatingActivities?: number;
  capitalExpenditures?: number;
};

type ExtendedIncomeStatement = {
  netIncome?: number;
};

export async function getContingentLiabilitiesData(
  symbol: string,
  marketType: 'UK' | 'US' | 'India' | 'Global' = 'Global',
): Promise<ContingentLiabilitiesRegulatoryRiskData> {
  const [summary, chart] = await Promise.all([
    yahooFinance.quoteSummary(symbol, {
      modules: [
        'price',
        'assetProfile',
        'financialData',
        'balanceSheetHistory',
        'cashflowStatementHistory',
        'incomeStatementHistory',
        'defaultKeyStatistics',
        'summaryDetail',
      ],
    }),
    yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 1 * 365.25 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      period2: new Date().toISOString().slice(0, 10),
      interval: '1mo',
    }),
  ]);

  /* ============================= */
  /* Context                       */
  /* ============================= */

  const currency = summary.price?.currency ?? null;
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

  const balanceStatements =
    summary.balanceSheetHistory?.balanceSheetStatements ?? [];

  const latestBalance = balanceStatements[0] as
    | ExtendedBalanceSheet
    | undefined;

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

  const cashFlows = summary.cashflowStatementHistory?.cashflowStatements ?? [];

  const latestCF = cashFlows[0] as ExtendedCashFlow | undefined;

  const freeCashFlow =
    latestCF?.totalCashFromOperatingActivities && latestCF?.capitalExpenditures
      ? latestCF.totalCashFromOperatingActivities + latestCF.capitalExpenditures
      : null;

  /* ============================= */
  /* Income                        */
  /* ============================= */

  const incomeStatements =
    summary.incomeStatementHistory?.incomeStatementHistory ?? [];

  const latestIncome = incomeStatements[0] as
    | ExtendedIncomeStatement
    | undefined;

  const netIncome = latestIncome?.netIncome ?? null;

  const fcfToNetIncome =
    freeCashFlow && netIncome ? freeCashFlow / netIncome : null;

  /* ============================= */
  /* Leverage Strength             */
  /* ============================= */

  const ebitda = summary.financialData?.ebitda ?? null;

  const interestExpense = summary.financialData?.interestExpense ?? null;

  const interestCoverage =
    //@ts-ignore
    ebitda && interestExpense ? ebitda / interestExpense : null;

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

  const quotes = chart.quotes ?? [];
  const firstClose = quotes[0]?.adjclose ?? null;
  const lastClose = quotes[quotes.length - 1]?.adjclose ?? null;

  const oneYearReturnPercent =
    firstClose && lastClose
      ? ((lastClose - firstClose) / firstClose) * 100
      : null;

  const beta = summary.defaultKeyStatistics?.beta ?? null;

  const volatilityProxy =
    summary.summaryDetail?.fiftyTwoWeekHigh &&
    summary.summaryDetail?.fiftyTwoWeekLow
      ? ((summary.summaryDetail.fiftyTwoWeekHigh -
          summary.summaryDetail.fiftyTwoWeekLow) /
          summary.summaryDetail.fiftyTwoWeekLow) *
        100
      : null;

  /* ============================= */
  /* Legal Risk Flag               */
  /* ============================= */

  const litigationKeywordFlag =
    summary.assetProfile?.longBusinessSummary
      ?.toLowerCase()
      .includes('litigation') ?? false;

  return {
    context: {
      currency,
      industry,
      sector,
      country,
      marketType,
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
) {
  const response = await getContingentLiabilitiesData(symbol);

  const analysis = await fetchSection<
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
      - Currency: ${response.context.currency}

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
  });

  return analysis;
}
