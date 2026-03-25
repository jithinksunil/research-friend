import {
  enhanceAgmAndShareholderMattersSection,
  enhanceAnalystRecommendationSection,
  enhanceBusinessSegmentDataSection,
  enhanceCompanyOverviewAndStockMetricsSection,
  enhanceConclusionAndRecommendationSection,
  enhanceContingentLiabilitiesAndRegulatoryRiskSection,
  enhanceDcfValuationRecapAndPriceTargetSection,
  enhanceEquityValuationAndDcfAnalysisSection,
  enhanceExecutiveSection,
  enhanceFinancialStatementAnalysisSection,
  enhanceForwardProjectionsAndValuationSection,
  enhanceInterimResultsAndQuarterlyPerformanceSection,
  enhanceShareholderStructureSection,
} from '@/app/actions/user/enhancement.actions';
import { REPORT_SECTION_KEYS } from '@/lib/server-only/report';
import { NextRequest, NextResponse } from 'next/server';

type ReportSectionKey = (typeof REPORT_SECTION_KEYS)[number];

type EnhanceHandler = (
  symbol: string,
  improvementNeeded: string,
) => Promise<{
  okay: boolean;
  data?: unknown;
  error?: { message?: string };
}>;

const ENHANCE_BY_SECTION: Record<ReportSectionKey, EnhanceHandler> = {
  executiveSummary: enhanceExecutiveSection,
  overviewAndStockMetrics: enhanceCompanyOverviewAndStockMetricsSection,
  shareHolderStructure: enhanceShareholderStructureSection,
  analystRecommendation: enhanceAnalystRecommendationSection,
  equityValuationAndDcfAnalysis: enhanceEquityValuationAndDcfAnalysisSection,
  financialStatementAnalyasis: enhanceFinancialStatementAnalysisSection,
  businessSegmentData: enhanceBusinessSegmentDataSection,
  interimResultsAndQuarterlyPerformance: enhanceInterimResultsAndQuarterlyPerformanceSection,
  contingentLiabilitiesAndRegulatoryRisk: enhanceContingentLiabilitiesAndRegulatoryRiskSection,
  dcfValuationRecapAndPriceTarget: enhanceDcfValuationRecapAndPriceTargetSection,
  forwardProjectionsAndValuation: enhanceForwardProjectionsAndValuationSection,
  agmAndShareholderMatters: enhanceAgmAndShareholderMattersSection,
  conclusionAndRecommendation: enhanceConclusionAndRecommendationSection,
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ symbol: string; sectionKey: string }> },
) {
  const { symbol, sectionKey } = await context.params;
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    return NextResponse.json({ message: 'Symbol is required' }, { status: 400 });
  }

  if (!(REPORT_SECTION_KEYS as readonly string[]).includes(sectionKey)) {
    return NextResponse.json({ message: `Invalid section key: ${sectionKey}` }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { improvementNeeded?: string } | null;
  const improvementNeeded = body?.improvementNeeded?.trim();

  if (!improvementNeeded) {
    return NextResponse.json({ message: 'Improvement details are required' }, { status: 400 });
  }

  const typedSectionKey = sectionKey as ReportSectionKey;

  try {
    const result = await ENHANCE_BY_SECTION[typedSectionKey](normalizedSymbol, improvementNeeded);

    if (!result.okay || result.data === undefined) {
      return NextResponse.json(
        {
          message: result.error?.message ?? 'Failed to enhance section',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        data: {
          sectionKey: typedSectionKey,
          data: result.data,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to enhance section',
      },
      { status: 500 },
    );
  }
}
