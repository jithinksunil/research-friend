import { HistoricalHistoryResult } from 'yahoo-finance2/modules/historical';

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

export interface Metric {
  label: string;
  value: string;
}

export interface QuickMetric {
  keyMetrics: Metric[];
  name: string | null;
  description: string | null;
}

export interface RiskMetric extends Metric {
  description: string;
}

export interface StockDashboardData {
  keyMetrics: KeyMetrics;
  chartData: HistoricalHistoryResult | null;
  quickMetrics: QuickMetric | null;
  riskMetrics: RiskMetric[] | null;
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
