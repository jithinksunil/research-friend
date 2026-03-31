import { HistoricalHistoryResult } from 'yahoo-finance2/modules/historical';

export interface MetricItem {
  label: string;
  value: number | null;
  unit?: string | null;
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
  website: string | null;
  exchange: string | null;
  employees: number | null;
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

export interface RiskMetric {
  label: string;
  value: string;
  description: string;
}

export interface StockDashboardData {
  keyMetrics: KeyMetrics;
  chartData: HistoricalHistoryResult | null;
  quickMetrics: QuickMetric | null;
  riskMetrics: RiskMetric[] | null;
}

export interface VotesResponse {
  upVotes: number;
  downVotes: number;
}
