import 'server-only';
import YahooFinance from 'yahoo-finance2';
import { z } from 'zod';
import { fetchSection } from './common';
import { EXECUTIVE_PROMPT } from '@/lib';
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
      period1: '2023-01-01',
      period2: '2024-01-01',
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
    input: JSON.stringify(response),
    prompt: EXECUTIVE_PROMPT,
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
