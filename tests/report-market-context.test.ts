import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAnalystRecommendationsData,
  getConclusionRecommendationData,
  getDcfValuationRecapData,
  getForwardProjectionsAndValuationInput,
  getTrimmedCompanyOverviewMetrics,
  getTrimmedExecutiveData,
  getTrimmedFinancialStatementsAnalysisData,
  resolveReportMarketContextFromSummary,
  type ReportSourceBundle,
} from '../server/report';

function createMockSourceBundle(
  overrides: Partial<ReportSourceBundle['summary']> = {},
): ReportSourceBundle {
  return {
    summary: {
      assetProfile: {
        country: 'India',
        sector: 'Technology',
        industry: 'Software',
        fullTimeEmployees: 1200,
      },
      price: {
        currency: 'INR',
        exchangeName: 'BSE',
        regularMarketPrice: 1500,
        marketCap: 2500000000,
        longName: 'Example Co',
        regularMarketTime: new Date('2026-03-30T00:00:00.000Z'),
      },
      summaryDetail: {
        fiftyTwoWeekHigh: 1800,
        fiftyTwoWeekLow: 1200,
        trailingPE: 24,
        forwardPE: 20,
        dividendYield: 0.012,
      },
      financialData: {
        targetMeanPrice: 1650,
        targetHighPrice: 1800,
        targetLowPrice: 1400,
        recommendationKey: 'buy',
        revenueGrowth: 0.15,
        earningsGrowth: 0.18,
        totalDebt: 200000000,
        totalCash: 100000000,
        freeCashflow: 150000000,
        returnOnEquity: 0.16,
        currentRatio: 1.8,
        profitMargins: 0.19,
        operatingMargins: 0.23,
        totalRevenue: 900000000,
        ebitda: 220000000,
      },
      defaultKeyStatistics: {
        sharesOutstanding: 1000000,
        enterpriseToRevenue: 3.5,
        enterpriseToEbitda: 12.2,
        enterpriseValue: 2600000000,
        beta: 1.1,
        priceToBook: 4.2,
        lastDividendValue: 18,
        numberOfAnalystOpinions: 12,
      },
      majorHoldersBreakdown: {
        institutionsPercentHeld: 0.22,
        insidersPercentHeld: 0.11,
      },
      institutionOwnership: {
        ownershipList: [{ organization: 'Fund A', pctHeld: 0.08 }],
      },
      insiderTransactions: {
        transactions: [],
      },
      recommendationTrend: {
        trend: [{ strongBuy: 2, buy: 6, hold: 3, sell: 1, strongSell: 0 }],
      },
      calendarEvents: {
        exDividendDate: new Date('2026-04-15T00:00:00.000Z'),
      },
      earningsTrend: {
        trend: [
          {
            period: '0y',
            revenueEstimate: { avg: 1000000000, growth: 0.12 },
            earningsEstimate: { avg: 25, growth: 0.14 },
          },
        ],
      },
      ...overrides,
    } as ReportSourceBundle['summary'],
    chart: {
      quotes: [
        { date: new Date('2025-03-30T00:00:00.000Z'), adjclose: 1200 },
        { date: new Date('2026-03-30T00:00:00.000Z'), adjclose: 1500 },
      ],
      events: {
        dividends: [{ amount: 12 }, { amount: 12 }],
      },
    } as ReportSourceBundle['chart'],
    annualStatements: {
      incomeStatements: [
        {
          endDate: '2025-03-31T00:00:00.000Z',
          totalRevenue: 900000000,
          operatingIncome: 210000000,
          netIncome: 150000000,
          interestExpense: 10000000,
        },
        {
          endDate: '2024-03-31T00:00:00.000Z',
          totalRevenue: 780000000,
          operatingIncome: 180000000,
          netIncome: 120000000,
          interestExpense: 9000000,
        },
      ],
      balanceSheetStatements: [
        {
          endDate: '2025-03-31T00:00:00.000Z',
          cash: 100000000,
          totalAssets: 1200000000,
          totalDebt: 200000000,
          totalStockholderEquity: 500000000,
          totalLiab: 700000000,
        },
        {
          endDate: '2024-03-31T00:00:00.000Z',
          cash: 90000000,
          totalAssets: 1100000000,
          totalDebt: 210000000,
          totalStockholderEquity: 470000000,
          totalLiab: 630000000,
        },
      ],
      cashflowStatements: [
        {
          endDate: '2025-03-31T00:00:00.000Z',
          totalCashFromOperatingActivities: 180000000,
          capitalExpenditures: -30000000,
          dividendsPaid: -12000000,
          repurchasesOfStock: -5000000,
        },
        {
          endDate: '2024-03-31T00:00:00.000Z',
          totalCashFromOperatingActivities: 160000000,
          capitalExpenditures: -25000000,
          dividendsPaid: -11000000,
          repurchasesOfStock: -4000000,
        },
      ],
    },
  };
}

test('report market context resolver prefers price currency, then summary detail, then financial currency', () => {
  const fromPrice = resolveReportMarketContextFromSummary(
    createMockSourceBundle({
      price: { currency: 'INR', exchangeName: 'BSE' } as ReportSourceBundle['summary']['price'],
    }).summary,
  );
  assert.equal(fromPrice.currencyCode, 'INR');
  assert.equal(fromPrice.marketType, 'India');

  const fromSummaryDetail = resolveReportMarketContextFromSummary(
    createMockSourceBundle({
      price: {
        currency: null,
        exchangeName: 'NasdaqGS',
      } as unknown as ReportSourceBundle['summary']['price'],
      summaryDetail: {
        currency: 'USD',
      } as ReportSourceBundle['summary']['summaryDetail'],
      assetProfile: { country: 'United States' } as ReportSourceBundle['summary']['assetProfile'],
    }).summary,
  );
  assert.equal(fromSummaryDetail.currencyCode, 'USD');
  assert.equal(fromSummaryDetail.marketType, 'US');

  const fromFinancialCurrency = resolveReportMarketContextFromSummary(
    createMockSourceBundle({
      price: {
        currency: null,
        exchangeName: 'Tokyo',
      } as unknown as ReportSourceBundle['summary']['price'],
      summaryDetail: {
        currency: null,
      } as unknown as ReportSourceBundle['summary']['summaryDetail'],
      financialData: {
        financialCurrency: 'JPY',
      } as ReportSourceBundle['summary']['financialData'],
      assetProfile: { country: 'Japan' } as ReportSourceBundle['summary']['assetProfile'],
    }).summary,
  );
  assert.equal(fromFinancialCurrency.currencyCode, 'JPY');
  assert.equal(fromFinancialCurrency.exchangeName, 'Tokyo');
  assert.equal(fromFinancialCurrency.marketType, 'Global');
});

test('representative report input builders share the same market currency context', async () => {
  const sourceBundle = createMockSourceBundle({
    price: {
      currency: 'USD',
      exchangeName: 'NasdaqGS',
      regularMarketPrice: 42,
      marketCap: 990000000,
      longName: 'US Example Co',
      regularMarketTime: new Date('2026-03-30T00:00:00.000Z'),
    } as ReportSourceBundle['summary']['price'],
    assetProfile: {
      country: 'United States',
      sector: 'Technology',
      industry: 'Software',
      fullTimeEmployees: 500,
    } as ReportSourceBundle['summary']['assetProfile'],
    summaryDetail: {
      fiftyTwoWeekHigh: 50,
      fiftyTwoWeekLow: 30,
      trailingPE: 18,
      forwardPE: 15,
      dividendYield: 0.01,
    } as ReportSourceBundle['summary']['summaryDetail'],
  });

  const [executive, overview, analyst, financials, dcfRecap, forward, conclusion] =
    await Promise.all([
      getTrimmedExecutiveData('US', sourceBundle),
      getTrimmedCompanyOverviewMetrics('US', undefined, undefined, undefined, sourceBundle),
      getAnalystRecommendationsData('US', undefined, sourceBundle),
      getTrimmedFinancialStatementsAnalysisData('US', undefined, sourceBundle),
      getDcfValuationRecapData('US', sourceBundle),
      getForwardProjectionsAndValuationInput('US', sourceBundle),
      getConclusionRecommendationData('US', sourceBundle),
    ]);

  const contexts = [
    executive.context,
    overview.context,
    analyst.context,
    financials.context,
    dcfRecap.company,
    forward.company,
    conclusion.company,
  ];

  for (const context of contexts) {
    assert.equal(context.currencyCode, 'USD');
    assert.equal(context.exchangeName, 'NasdaqGS');
    assert.equal(context.marketType, 'US');
  }
});
