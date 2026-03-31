import { ChartResultArray } from 'yahoo-finance2/modules/chart';
import { QuoteSummaryResult } from 'yahoo-finance2/modules/quoteSummary-iface';
import { ReportMarketType } from '@/types';

export interface LegacyIncomeStatement {
  endDate: string;
  totalRevenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  interestExpense: number | null;
}

export interface LegacyBalanceSheetStatement {
  endDate: string;
  cash: number | null;
  totalAssets: number | null;
  totalDebt: number | null;
  totalStockholderEquity: number | null;
  totalLiab: number | null;
}

export interface LegacyCashflowStatement {
  endDate: string;
  totalCashFromOperatingActivities: number | null;
  capitalExpenditures: number | null;
  dividendsPaid: number | null;
  repurchasesOfStock: number | null;
}

export interface InstitutionOwnershipRow {
  organization: string;
  pctHeld: number | null;
}

export interface InsiderTransactionRow {
  value: number | null;
  transactionText: string | null;
  filerName: string | null;
  startDate: string | Date | null;
}

export interface ReportMarketContext {
  currencyCode: string;
  exchangeName: string | null;
  marketType: ReportMarketType;
  currencySymbol: string | null;
}

export interface ReportSourceBundle {
  summary: QuoteSummaryResult;
  chart: ChartResultArray;
  annualStatements: {
    incomeStatements: LegacyIncomeStatement[];
    balanceSheetStatements: LegacyBalanceSheetStatement[];
    cashflowStatements: LegacyCashflowStatement[];
  };
}

export interface StockResearchData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
  };
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
}

export interface SectionGenerationOptions {
  sourceBundle?: ReportSourceBundle;
  enableWebSearch?: boolean;
}

export interface CompanyOverviewMetrics {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
  };
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
  dcfFairValue: number | null;
  wacc: number | null;
  terminalGrowth: number;
  asOfDate: string | null;
}

export interface ShareholderStructure {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
  };
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

export interface AnalystRecommendationsData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
  };
  currentPrice: number | null;
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

export interface EquityValuationData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
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

export interface FinancialStatementsAnalysisData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
    reportingStandard: ReportMarketType;
    fiscalYearsCovered: string;
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

export interface BusinessSegmentsData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
    industry: string | null;
    sector: string | null;
  };
  revenue: {
    totalRevenue: number | null;
    revenueGrowth: number | null;
    operatingMargin: number | null;
    profitMargin: number | null;
    revenueVolatility3Y: number | null;
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

export interface InterimResultsData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
    fiscalYearLabel: string | null;
    previousFiscalYearLabel: string | null;
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
      conversionRatio: number | null;
    };
    eps: {
      current: number | null;
      previous: number | null;
      growth: number | null;
    };
    profitMargin: number | null;
    operatingMargin: number | null;
    marginExpansion: number | null;
  };
  leverageSignals: {
    operatingLeverage: number | null;
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

export interface ExtendedCashFlowStatement {
  totalCashFromOperatingActivities?: number;
  capitalExpenditures?: number;
}

export interface ContingentLiabilitiesRegulatoryRiskData {
  context: {
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
    industry: string | null;
    sector: string | null;
    country: string | null;
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

export interface ExtendedBalanceSheet {
  totalAssets?: number;
  totalLiab?: number;
  totalDebt?: number;
  cash?: number;
  totalStockholderEquity?: number;
}

export interface ExtendedCashFlow {
  totalCashFromOperatingActivities?: number;
  capitalExpenditures?: number;
}

export interface ExtendedIncomeStatement {
  netIncome?: number;
  interestExpense?: number;
}

export interface DcfValuationRecapData {
  company: {
    name: string | null;
    marketType: ReportMarketType;
    currencyCode: string;
    exchangeName: string | null;
    currencySymbol: string | null;
  };
  valuation: {
    currentPrice: number | null;
    targetMeanPrice: number | null;
    targetHighPrice: number | null;
    targetLowPrice: number | null;
    recommendationKey: string | null;
    enterpriseValue: number | null;
    marketCap: number | null;
    totalDebt: number | null;
    totalCash: number | null;
  };
  dcfSignals: {
    trailingPE: number | null;
    forwardPE: number | null;
    enterpriseToRevenue: number | null;
    enterpriseToEbitda: number | null;
  };
}

export interface AgmAndShareholderMattersData {
  company: {
    name: string | null;
    marketType: ReportMarketType;
    currencyCode: string;
    exchangeName: string | null;
    currencySymbol: string | null;
  };
  agm: {
    expectedDate: string | null;
    location: string | null;
    noticeFiledDate: string | null;
  };
  governance: {
    auditRisk: number | null;
    boardRisk: number | null;
    compensationRisk: number | null;
    shareholderRightsRisk: number | null;
    overallRisk: number | null;
  };
  valuationSignals: {
    marketCap: number | null;
    recommendationKey: string | null;
    targetMeanPrice: number | null;
  };
}

export interface ForwardProjectionsValuationInput {
  company: {
    name: string | null;
    currencyCode: string;
    exchangeName: string | null;
    marketType: ReportMarketType;
    currencySymbol: string | null;
  };
  valuationSignals: {
    currentPrice: number | null;
    targetMeanPrice: number | null;
    recommendationKey: string | null;
    marketCap: number | null;
  };
  forwardSignals: {
    revenueGrowth: number | null;
    earningsGrowth: number | null;
    operatingMargins: number | null;
    profitMargins: number | null;
    returnOnEquity: number | null;
    debtToEquity: number | null;
  };
}

export interface ConclusionRecommendationData {
  company: {
    name: string | null;
    sector: string | null;
    industry: string | null;
    marketType: ReportMarketType;
    currencyCode: string;
    exchangeName: string | null;
    currencySymbol: string | null;
  };
  valuation: {
    currentPrice: number | null;
    targetMeanPrice: number | null;
    targetHighPrice: number | null;
    targetLowPrice: number | null;
    recommendationKey: string | null;
    trailingPE: number | null;
    forwardPE: number | null;
    marketCap: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    oneYearReturnPercent: number | null;
  };
  fundamentals: {
    revenueGrowth: number | null;
    earningsGrowth: number | null;
    returnOnEquity: number | null;
    operatingMargin: number | null;
    profitMargin: number | null;
    totalDebt: number | null;
    totalCash: number | null;
    freeCashFlow: number | null;
  };
}
