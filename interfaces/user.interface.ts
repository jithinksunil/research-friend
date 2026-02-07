import { HistoricalHistoryResult } from 'yahoo-finance2/modules/historical';

export interface SearchSuggestion {
  id: string;
  name: string;
  region: string;
  symbol: string;
}

export interface CompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  OfficialSite: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  AnalystRatingStrongBuy: string;
  AnalystRatingBuy: string;
  AnalystRatingHold: string;
  AnalystRatingSell: string;
  AnalystRatingStrongSell: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  SharesFloat: string;
  PercentInsiders: string;
  PercentInstitutions: string;
  DividendDate: string;
  ExDividendDate: string;
}

export interface AnnualBalanceSheetReport {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalAssets: string;
  totalCurrentAssets: string;
  cashAndCashEquivalentsAtCarryingValue: string;
  cashAndShortTermInvestments: string;
  inventory: string;
  currentNetReceivables: string;
  totalNonCurrentAssets: string;
  propertyPlantEquipment: string;
  accumulatedDepreciationAmortizationPPE: string;
  intangibleAssets: string;
  intangibleAssetsExcludingGoodwill: string;
  goodwill: string;
  investments: string;
  longTermInvestments: string;
  shortTermInvestments: string;
  otherCurrentAssets: string;
  otherNonCurrentAssets: string;
  totalLiabilities: string;
  totalCurrentLiabilities: string;
  currentAccountsPayable: string;
  deferredRevenue: string;
  currentDebt: string;
  shortTermDebt: string;
  totalNonCurrentLiabilities: string;
  capitalLeaseObligations: string;
  longTermDebt: string;
  currentLongTermDebt: string;
  longTermDebtNoncurrent: string;
  shortLongTermDebtTotal: string;
  otherCurrentLiabilities: string;
  otherNonCurrentLiabilities: string;
  totalShareholderEquity: string;
  treasuryStock: string;
  retainedEarnings: string;
  commonStock: string;
  commonStockSharesOutstanding: string;
}

export interface BalanceSheetData {
  symbol: string;
  annualReports: AnnualBalanceSheetReport[];
}

export interface MetricItem {
  label: string;
  value: number | null;
  unit?: 'USD' | '%' | 'shares' | null;
  description?: string;
  format: 'currency' | 'currencyCompact' | 'percentage' | 'compact' | 'number';
}
export interface StockHeader {
  symbol: string;
  name: string | null;
  exchange: string | null;
}

export interface CompanyProfile {
  description: string | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
  name: string | null;
}

export interface KeyMetrics {
  header: StockHeader;
  keyMetrics: MetricItem[];
  fundamentals: MetricItem[];
  riskMetrics: MetricItem[];
  companyProfile: CompanyProfile;
}

export interface StockDashboardData {
  keyMetrics: KeyMetrics;
  chartData: HistoricalHistoryResult | null;
  quickMetrics: QuickMetric | null;
  riskMetrics: RiskMetric[] | null;
}

export interface DailyOHLCV {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface TimeSeriesDaily {
  [date: string]: DailyOHLCV;
}

export interface TimeSeriesDailyResponse {
  'Meta Data': TimeSeriesDailyMetaData;
  'Time Series (Daily)': TimeSeriesDaily;
}

export interface TimeSeriesDailyMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string; // YYYY-MM-DD
  '4. Output Size': 'Compact' | 'Full' | string;
  '5. Time Zone': string;
}

export interface BasicStockInfo {
  symbol: string;
  name: string | null;
  price: number | null;
  currency: string;
  exchange: string | null;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  eps: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  avgVolume: number | null;
  beta: number | null;
  sector: string | null;
  industry: string | null;
  website: string | null;
  description: string | null;
}

export interface QuickMetric {
  keyMetrics: Metric[];
  name: string | null;
  description: string | null;
}

export interface Metric {
  label: string;
  value: string;
}

export interface RiskMetric extends Metric {
  description: string;
}
