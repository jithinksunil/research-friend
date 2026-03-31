import { ReportSectionKey } from '@/types';

export interface Citation {
  title?: string;
  url: string;
  claim?: string;
}

export interface ReportExecutiveSummary {
  analystConsensus: string;
  positive: string;
  risk: string;
  summary: string;
  upside: string;
  dcfFairValue: string;
  currentPrice: string;
}

export interface ReportOverviewStockMetric {
  name: string;
  value: string;
  note: string;
}

export interface ReportOverviewAndStockMetrics {
  stockMetrics: ReportOverviewStockMetric[];
  fiftyTwoWeekPerformance: string;
}

export interface ReportShareholderEntry {
  shareHolderType: string;
  ownership: string;
  notes: string;
}

export interface ReportShareHolderStructure {
  majorShareholders: ReportShareholderEntry[];
  keyInsiderObservations: string[];
  shareCapitalNotes: string;
  totalShares: string;
}

export interface ReportAnalystConsensusRow {
  rating: string;
  count: string;
  percentageOfTotal: string;
  trend: string;
}

export interface ReportAnalystConsensusDetail {
  name: string;
  value: string;
}

export interface ReportAnalystRecommendation {
  consensusDetails: ReportAnalystConsensusDetail[];
  currentConsensus: ReportAnalystConsensusRow[];
  recentAnalystViews: string[];
}

export interface ProjectionMetricRow {
  metric: string;
  value: string;
}

export interface ProjectedFinancialYearRow {
  financialYear: string;
  projections: ProjectionMetricRow[];
}

export interface ReportDcfValuationBuildup {
  pvOfFCF: string;
  pvOfTerminalValue: string;
  enterpriseValue: string;
  netDebt: string;
  equityValue: string;
  fairValuePerShare: string;
  currentPrice: string;
  impliedUpside: string;
  note: string | null;
}

export interface ReportValuationSensitivityValue {
  terminalGrowth: string;
  value: string;
}

export interface ReportValuationSensitivityRow {
  wacc: string;
  values: ReportValuationSensitivityValue[];
}

export interface ReportKeyAssumption {
  modelName: string;
  assumption: string;
}

export interface ReportEquityValuationAndDcfAnalysis {
  keyAssumptions: ReportKeyAssumption[];
  dcfValuationBuildup: ReportDcfValuationBuildup | null;
  keyTakeAway: string;
  projectedFinancialYears: ProjectedFinancialYearRow[];
  valuationSensitivities: ReportValuationSensitivityRow[];
}

export interface IncomeStatementTrendRow {
  fiscalYear: string;
  revenue: string;
  yoyGrowth: string;
  operatingIncome: string;
  netIncome: string;
  eps: string;
}

export interface BalanceSheetStrengthRow {
  fiscalYear: string;
  cash: string;
  totalAssets: string;
  totalDebt: string;
  shareholdersEquity: string;
  debtToEquity: string;
}

export interface CashFlowAnalysisRow {
  fiscalYear: string;
  operatingCF: string;
  capex: string;
  freeCF: string;
  fcfMargin: string;
  dividendsPaid: string;
  shareBuyback: string;
}

export interface ReportFinancialRatioMetricValue {
  year: string;
  value: string;
}

export interface ReportFinancialRatioMetric {
  metric: string;
  values: ReportFinancialRatioMetricValue[];
}

export interface ReportFinancialStatementAnalyasis {
  keyObservations: string[];
  capitalPositionAnalysis: string[];
  fcfQualityAnalysis: string[];
  valuationObservations: string[];
  incomeStatementTrendRows: IncomeStatementTrendRow[];
  balanceSheetStrengthRows: BalanceSheetStrengthRow[];
  cashFlowAnalysisRows: CashFlowAnalysisRow[];
  financialRatioMetrics: ReportFinancialRatioMetric[];
}

export interface ReportRevenueModelBreakdownRow {
  revenueStream: string;
  amount: string;
  percentOfTotal: string;
  growth: string;
  driver: string;
}

export interface ReportCompetitorRow {
  name: string;
  description: string;
}

export interface ReportCompetitiveAdvantageRow {
  title: string;
  description: string;
}

export interface ReportCompetitivePosition {
  keyCompetitors: ReportCompetitorRow[];
  competitiveAdvantage: ReportCompetitiveAdvantageRow[];
}

export interface ReportBusinessSegmentData {
  businessModelDynamics: string[];
  competitivePosition: ReportCompetitivePosition | null;
  platformSegmentPerformance: unknown[];
  revenueModelBreakdown: ReportRevenueModelBreakdownRow[];
}

export interface ReportFinancialPerformanceRow {
  metric: string;
  currentYearValue: string;
  previousYearValue: string;
  change: string;
  margin: string;
}

export interface ReportManagementCommentary {
  ceoName: string;
  quotes: string[];
}

export interface ReportAnalystConsensusForecastRow {
  metric: string;
  forecastValue: string;
  growth: string;
  commentary: string;
}

export interface ReportForwardGuidance {
  managementCommentary: ReportManagementCommentary | null;
  analystConsensusFY1: ReportAnalystConsensusForecastRow[];
}

export interface ReportInterimResultsAndQuarterlyPerformance {
  title: string;
  keyPositives: string[];
  keyNegatives: string[];
  recordFinancialPerformance: ReportFinancialPerformanceRow[];
  forwardGuidance: ReportForwardGuidance | null;
}

export interface ReportBalanceSheetContingencyRow {
  item: string;
  amount: string;
  status: string;
  riskLevel: string;
  impact: string;
}

export interface ReportNetContingentPosition {
  quantifiedAnnualLiabilities: string;
  oneTimeCosts: string;
  valuationImpact: string;
}

export interface ReportRegulatoryConsideration {
  title: string;
  description: string;
}

export interface ReportContingentLiabilitiesAndRegulatoryRisk {
  balanceSheetContingencies: ReportBalanceSheetContingencyRow[];
  keyRegulatoryConsiderations: ReportRegulatoryConsideration[];
  netContingentPosition: ReportNetContingentPosition | null;
}

export interface ReportSensitivityAnalysisRecapRow {
  scenario: string;
  assumption: string;
  value: string;
}

export interface ReportDcfValuationRecapAndPriceTarget {
  sectionTitle: string;
  valuationSummaryTitle: string;
  baseCaseAssumption: string;
  pvOfFcf: string;
  pvOfTerminalValue: string;
  enterpriseValue: string;
  netDebt: string;
  equityValue: string;
  sharesDiluted: string;
  fairValuePerShare: string;
  currentPrice: string;
  upside: string;
  recommendation: string;
  twelveMonthPriceTarget: string;
  rationaleForPriceTarget: string[];
  sensitivityAnalysisRecap: ReportSensitivityAnalysisRecapRow[];
}

export interface ReportForwardProjectionMetricRow {
  metric: string;
  fy26e: string;
  fy27e: string;
  fy28e: string;
  fy29e: string;
  fy30e: string;
}

export interface ReportForwardBalanceSheetRow {
  item: string;
  fy25a: string;
  fy26e: string;
  fy27e: string;
  fy28e: string;
  fy29e: string;
  fy30e: string;
}

export interface ReportForwardProjectionsAndValuation {
  sectionTitle: string;
  keyProjectionDrivers: string[];
  balanceSheetDynamics: string[];
  keyObservations: string[];
  creditOutlook: string;
  projectedIncomeStatementRows: ReportForwardProjectionMetricRow[];
  projectedBalanceSheetRows: ReportForwardBalanceSheetRow[];
  projectedCashFlowRows: ReportForwardProjectionMetricRow[];
  creditMetricsRows: ReportForwardProjectionMetricRow[];
}

export interface ReportExpectedVotingAgendaRow {
  resolutionNumber: string;
  title: string;
  type: string;
  expectedResult: string;
}

export interface ReportAgmAndShareholderMatters {
  sectionTitle: string;
  announcedDate: string;
  location: string;
  noticeFiled: string;
  specialResolutionsExpected: string[];
  keyGovernanceNotes: string[];
  expectedVotingAgenda: ReportExpectedVotingAgendaRow[];
}

export interface ReportConclusionAndRecommendation {
  summary: string;
  strengths: string[];
  valuationSummary: string;
  analystConsensus: string;
  investorFit: string[];
  entryStrategy: string[];
  upsideCatalysts: string[];
  downsideCatalysts: string[];
  recommendation: string;
  priceTarget: string;
  expectedReturn: string;
  timeHorizon: string;
  riskProfile: string;
  disclaimer: string;
}

export interface ReportContent {
  executiveSummary: ReportExecutiveSummary | null;
  overviewAndStockMetrics: ReportOverviewAndStockMetrics | null;
  shareHolderStructure: ReportShareHolderStructure | null;
  analystRecommendation: ReportAnalystRecommendation | null;
  equityValuationAndDcfAnalysis: ReportEquityValuationAndDcfAnalysis | null;
  financialStatementAnalyasis: ReportFinancialStatementAnalyasis | null;
  businessSegmentData: ReportBusinessSegmentData | null;
  interimResultsAndQuarterlyPerformance: ReportInterimResultsAndQuarterlyPerformance | null;
  contingentLiabilitiesAndRegulatoryRisk: ReportContingentLiabilitiesAndRegulatoryRisk | null;
  dcfValuationRecapAndPriceTarget: ReportDcfValuationRecapAndPriceTarget | null;
  forwardProjectionsAndValuation: ReportForwardProjectionsAndValuation | null;
  agmAndShareholderMatters: ReportAgmAndShareholderMatters | null;
  conclusionAndRecommendation: ReportConclusionAndRecommendation | null;
}

export interface ReportDetailsData {
  companyName: string;
  report: ReportContent | null;
}

export interface ReportSectionDataMap {
  executiveSummary: ReportExecutiveSummary;
  overviewAndStockMetrics: ReportOverviewAndStockMetrics;
  shareHolderStructure: ReportShareHolderStructure;
  analystRecommendation: ReportAnalystRecommendation;
  equityValuationAndDcfAnalysis: ReportEquityValuationAndDcfAnalysis;
  financialStatementAnalyasis: ReportFinancialStatementAnalyasis;
  businessSegmentData: ReportBusinessSegmentData;
  interimResultsAndQuarterlyPerformance: ReportInterimResultsAndQuarterlyPerformance;
  contingentLiabilitiesAndRegulatoryRisk: ReportContingentLiabilitiesAndRegulatoryRisk;
  dcfValuationRecapAndPriceTarget: ReportDcfValuationRecapAndPriceTarget;
  forwardProjectionsAndValuation: ReportForwardProjectionsAndValuation;
  agmAndShareholderMatters: ReportAgmAndShareholderMatters;
  conclusionAndRecommendation: ReportConclusionAndRecommendation;
}

export interface ReportDetailsResponse {
  data: ReportDetailsData;
}

export interface ReportSectionResponse<K extends ReportSectionKey = ReportSectionKey> {
  sectionKey: K;
  companyName: string;
  data: ReportSectionDataMap[K] | null;
}

export interface EnhanceSectionResponse<K extends ReportSectionKey = ReportSectionKey> {
  sectionKey: K;
  data: ReportSectionDataMap[K] | null;
}
