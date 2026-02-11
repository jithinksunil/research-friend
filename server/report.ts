import 'server-only';
import YahooFinance from 'yahoo-finance2';
import { z } from 'zod';
import { fetchSection } from './common';
import { EXECUTIVE_PROMPT, OVERVIEW_PROMPT } from '@/lib';
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
