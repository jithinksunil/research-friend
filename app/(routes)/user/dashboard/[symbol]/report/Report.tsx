'use client';
import {
  BalanceSheetStrengthRow,
  CashFlowAnalysisRow,
  EnhanceSectionResponse,
  IncomeStatementTrendRow,
  ProjectionMetricRow,
  ReportFinancialRatioMetric,
  ReportSectionResponse,
} from '@/interfaces';
import { ReportSectionKey } from '@/types';
import { Heading } from './Heading';
import { SubHeading } from './SubHeading';
import { TertiaryHeading } from './TertiaryHeading';
import { SectionWrapper } from './SectionWrapper';
import { Description } from './Description';
import { List } from './List';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
import { cn, formatDate } from '@/lib';
import { REPORT_FINANCIAL_YEAR } from '@/lib/enum';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRef, useState } from 'react';
import { DownloadPdfButton } from './DownloadPdfButton';
const FY_ORDER = [
  REPORT_FINANCIAL_YEAR.FY20,
  REPORT_FINANCIAL_YEAR.FY21,
  REPORT_FINANCIAL_YEAR.FY22,
  REPORT_FINANCIAL_YEAR.FY23,
  REPORT_FINANCIAL_YEAR.FY24,
  REPORT_FINANCIAL_YEAR.FY25,
  REPORT_FINANCIAL_YEAR.FY25_EST,
] as const;
const FY_LABEL: Record<REPORT_FINANCIAL_YEAR, string> = {
  [REPORT_FINANCIAL_YEAR.FY20]: 'FY20',
  [REPORT_FINANCIAL_YEAR.FY21]: 'FY21',
  [REPORT_FINANCIAL_YEAR.FY22]: 'FY22',
  [REPORT_FINANCIAL_YEAR.FY23]: 'FY23',
  [REPORT_FINANCIAL_YEAR.FY24]: 'FY24',
  [REPORT_FINANCIAL_YEAR.FY25]: 'FY25',
  [REPORT_FINANCIAL_YEAR.FY25_EST]: 'FY25 (est)',
};

function Report({ symbol }: { symbol: string }) {
  const queryClient = useQueryClient();
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [enhancingSections, setEnhancingSections] = useState<
    Partial<Record<ReportSectionKey, boolean>>
  >({});

  const useSectionQuery = <K extends ReportSectionKey>(sectionKey: K) =>
    useQuery({
      queryKey: ['report-section', symbol, sectionKey],
      retry: false,
      queryFn: async () => {
        const res = await axios.get<ReportSectionResponse<K>>(
          `/api/report/${symbol}/sections/${sectionKey}`,
        );
        return res.data;
      },
    });

  const { data: executiveSummaryData, isLoading: executiveSummaryLoading } =
    useSectionQuery('executiveSummary');
  const { data: overviewAndStockMetricsData, isLoading: overviewAndStockMetricsLoading } =
    useSectionQuery('overviewAndStockMetrics');
  const { data: shareHolderStructureData, isLoading: shareHolderStructureLoading } =
    useSectionQuery('shareHolderStructure');
  const { data: analystRecommendationData, isLoading: analystRecommendationLoading } =
    useSectionQuery('analystRecommendation');
  const {
    data: equityValuationAndDcfAnalysisData,
    isLoading: equityValuationAndDcfAnalysisLoading,
  } = useSectionQuery('equityValuationAndDcfAnalysis');
  const { data: financialStatementAnalyasisData, isLoading: financialStatementAnalyasisLoading } =
    useSectionQuery('financialStatementAnalyasis');
  const { data: businessSegmentData, isLoading: businessSegmentDataLoading } =
    useSectionQuery('businessSegmentData');
  const {
    data: interimResultsAndQuarterlyPerformanceData,
    isLoading: interimResultsAndQuarterlyPerformanceLoading,
  } = useSectionQuery('interimResultsAndQuarterlyPerformance');
  const {
    data: contingentLiabilitiesAndRegulatoryRiskData,
    isLoading: contingentLiabilitiesAndRegulatoryRiskLoading,
  } = useSectionQuery('contingentLiabilitiesAndRegulatoryRisk');
  const {
    data: dcfValuationRecapAndPriceTargetData,
    isLoading: dcfValuationRecapAndPriceTargetLoading,
  } = useSectionQuery('dcfValuationRecapAndPriceTarget');
  const {
    data: forwardProjectionsAndValuationData,
    isLoading: forwardProjectionsAndValuationLoading,
  } = useSectionQuery('forwardProjectionsAndValuation');
  const { data: agmAndShareholderMattersData, isLoading: agmAndShareholderMattersLoading } =
    useSectionQuery('agmAndShareholderMatters');
  const { data: conclusionAndRecommendationData, isLoading: conclusionAndRecommendationLoading } =
    useSectionQuery('conclusionAndRecommendation');

  const sectionResponses = [
    executiveSummaryData,
    overviewAndStockMetricsData,
    shareHolderStructureData,
    analystRecommendationData,
    equityValuationAndDcfAnalysisData,
    financialStatementAnalyasisData,
    businessSegmentData,
    interimResultsAndQuarterlyPerformanceData,
    contingentLiabilitiesAndRegulatoryRiskData,
    dcfValuationRecapAndPriceTargetData,
    forwardProjectionsAndValuationData,
    agmAndShareholderMattersData,
    conclusionAndRecommendationData,
  ].filter(Boolean);

  const allSectionLoadingCompleted =
    !executiveSummaryLoading &&
    !overviewAndStockMetricsLoading &&
    !shareHolderStructureLoading &&
    !analystRecommendationLoading &&
    !equityValuationAndDcfAnalysisLoading &&
    !financialStatementAnalyasisLoading &&
    !businessSegmentDataLoading &&
    !interimResultsAndQuarterlyPerformanceLoading &&
    !contingentLiabilitiesAndRegulatoryRiskLoading &&
    !dcfValuationRecapAndPriceTargetLoading &&
    !forwardProjectionsAndValuationLoading &&
    !agmAndShareholderMattersLoading &&
    !conclusionAndRecommendationLoading;

  const companyName = executiveSummaryData?.companyName ?? symbol;

  const setSectionData = (sectionKey: ReportSectionKey, sectionData: unknown) => {
    queryClient.setQueryData(
      ['report-section', symbol, sectionKey],
      (oldData: ReportSectionResponse | undefined) =>
        ({
          sectionKey,
          companyName: oldData?.companyName ?? companyName,
          data: sectionData,
        }) as ReportSectionResponse,
    );
  };

  const enhanceSectionMutation = useMutation({
    mutationFn: async ({
      sectionKey,
      improvementText,
    }: {
      sectionKey: ReportSectionKey;
      improvementText: string;
    }): Promise<EnhanceSectionResponse<ReportSectionKey>> => {
      const response = await axios.post<EnhanceSectionResponse<ReportSectionKey>>(
        `/api/report/${symbol}/sections/${sectionKey}/enhance`,
        { improvementNeeded: improvementText },
      );

      return response.data;
    },
    onMutate: ({ sectionKey }: { sectionKey: ReportSectionKey; improvementText: string }): void => {
      setEnhancingSections((prev) => ({ ...prev, [sectionKey]: true }));
    },
    onSuccess: (
      response: EnhanceSectionResponse<ReportSectionKey>,
      { sectionKey }: { sectionKey: ReportSectionKey; improvementText: string },
    ): void => {
      setSectionData(sectionKey, response.data);
    },
    onSettled: (
      _response: EnhanceSectionResponse<ReportSectionKey> | undefined,
      _error: Error | null,
      { sectionKey }: { sectionKey: ReportSectionKey; improvementText: string },
    ): void => {
      setEnhancingSections((prev) => ({ ...prev, [sectionKey]: false }));
    },
  });

  const isSectionEnhancing = (sectionKey: ReportSectionKey) =>
    Boolean(enhancingSections[sectionKey]);

  const executiveSummary = executiveSummaryData?.data ?? null;
  const overviewAndStockMetrics = overviewAndStockMetricsData?.data ?? null;
  const shareHolderStructure = shareHolderStructureData?.data ?? null;
  const analystRecommendation = analystRecommendationData?.data ?? null;
  const equityValuationAndDcfAnalysis = equityValuationAndDcfAnalysisData?.data ?? null;
  const financialStatementAnalyasis = financialStatementAnalyasisData?.data ?? null;
  const reportBusinessSegmentData = businessSegmentData?.data ?? null;
  const interimResultsAndQuarterlyPerformance =
    interimResultsAndQuarterlyPerformanceData?.data ?? null;
  const contingentLiabilitiesAndRegulatoryRisk =
    contingentLiabilitiesAndRegulatoryRiskData?.data ?? null;
  const dcfValuationRecapAndPriceTarget = dcfValuationRecapAndPriceTargetData?.data ?? null;
  const forwardProjectionsAndValuation = forwardProjectionsAndValuationData?.data ?? null;
  const agmAndShareholderMatters = agmAndShareholderMattersData?.data ?? null;
  const conclusionAndRecommendation = conclusionAndRecommendationData?.data ?? null;

  return (
    <div className="py-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Heading className="!text-2xl sm:!text-3xl">{companyName}</Heading>
          <SubHeading className="!mb-1">
            Comprehensive Investment Analysis & Valuation Report
          </SubHeading>
          <TertiaryHeading className="mb-0!">
            Date: {formatDate(new Date().toISOString(), 'January 1, 2000')}
          </TertiaryHeading>
        </div>
        {allSectionLoadingCompleted && sectionResponses.length > 0 && (
          <DownloadPdfButton
            targetRef={reportContentRef}
            companyName={companyName}
            symbol={symbol}
          />
        )}
      </div>
      <div ref={reportContentRef}>
        <SectionWrapper
          heading="EXECUTIVE SUMMARY"
          visible={Boolean(executiveSummary) || executiveSummaryLoading}
          isLoading={executiveSummaryLoading || isSectionEnhancing('executiveSummary')}
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'executiveSummary',
              improvementText,
            });
          }}
        >
          <Description>{executiveSummary?.summary}</Description>
          <SubHeading>Investment Thesis</SubHeading>
          <List
            items={[
              `<span style='font-weight: bold' >Positives</span>: ${executiveSummary?.positive}`,
              `<span style='font-weight: bold' >Risks</span>: ${executiveSummary?.risk}`,
              `<span style='font-weight: bold' >Current Price: ${executiveSummary?.currentPrice} | DCF Fair Value: ${executiveSummary?.dcfFairValue} | Analyst Consensus: ${executiveSummary?.analystConsensus} | Upside: ${executiveSummary?.upside}</span>`,
            ]}
          />
        </SectionWrapper>
        <SectionWrapper
          heading="1. COMPANY OVERVIEW & STOCK METRICS"
          visible={Boolean(overviewAndStockMetrics) || overviewAndStockMetricsLoading}
          isLoading={
            overviewAndStockMetricsLoading || isSectionEnhancing('overviewAndStockMetrics')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'overviewAndStockMetrics',
              improvementText,
            });
          }}
        >
          <SubHeading>Key Statistics</SubHeading>

          <TableWithoutPagination
            headings={[
              <div key={`h1`} className={cn('px-[26px] py-[10px] font-medium')}>
                Metric
              </div>,
              <div key={`h2`} className={cn('px-[26px] py-[10px] font-medium')}>
                Value
              </div>,
              <div key={`h3`} className={cn('px-[26px] py-[10px] font-medium')}>
                Note
              </div>,
            ]}
            rows={overviewAndStockMetrics?.stockMetrics.map((metric, index) => [
              <div className="py-[10px] text-sm text-muted-foreground" key={`col1-${index}`}>
                {metric.name}
              </div>,

              <div key={`col2-${index}`} className={cn('py-[10px] font-medium')}>
                {metric.value}
              </div>,
              <div key={`col3-${index}`} className={cn('py-[10px] font-medium')}>
                {metric.note}
              </div>,
            ])}
            noData="No fundamentals available"
          />
          <SubHeading className="mt-8">52-Week Performance</SubHeading>
          <Description>{overviewAndStockMetrics?.fiftyTwoWeekPerformance}</Description>
        </SectionWrapper>
        <SectionWrapper
          heading="2. SHAREHOLDER STRUCTURE & INSIDER ACTIVITY"
          visible={Boolean(shareHolderStructure) || shareHolderStructureLoading}
          isLoading={shareHolderStructureLoading || isSectionEnhancing('shareHolderStructure')}
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'shareHolderStructure',
              improvementText,
            });
          }}
        >
          <SubHeading>Major Shareholders (Latest Data)</SubHeading>

          <TableWithoutPagination
            headings={[
              <div key={`h1`} className={cn('px-[26px] py-[10px] font-medium')}>
                Shareholder Type
              </div>,
              <div key={`h2`} className={cn('px-[26px] py-[10px] font-medium')}>
                Ownership
              </div>,
              <div key={`h3`} className={cn('px-[26px] py-[10px] font-medium')}>
                Notes
              </div>,
            ]}
            rows={[
              ...(shareHolderStructure?.majorShareholders || []).map((shareHolder, index) => [
                <div className="py-[10px] text-sm text-muted-foreground" key={`col1-${index}`}>
                  {shareHolder.shareHolderType}
                </div>,

                <div key={`col2-${index}`} className={cn('py-[10px] font-medium')}>
                  {shareHolder.ownership}
                </div>,
                <div key={`col3-${index}`} className={cn('py-[10px] font-medium')}>
                  {shareHolder.notes}
                </div>,
              ]),
              [
                <div
                  className="py-[10px] text-sm text-muted-foreground"
                  key={`col1-Share Capital Structure`}
                >
                  Share Capital Structure
                </div>,

                <div key={`col2-Share Capital Structure`} className={cn('py-[10px] font-medium')}>
                  {shareHolderStructure?.totalShares}
                </div>,
                <div key={`col3-Share Capital Structure`} className={cn('py-[10px] font-medium')}>
                  {shareHolderStructure?.shareCapitalNotes}
                </div>,
              ],
            ]}
            noData="No fundamentals available"
          />
          <SubHeading className="mt-8">Key Insider Observations:</SubHeading>
          <List items={shareHolderStructure?.keyInsiderObservations || []} />
        </SectionWrapper>
        <SectionWrapper
          heading="3. ANALYST RECOMMENDATIONS & PRICE TARGETS"
          visible={Boolean(analystRecommendation) || analystRecommendationLoading}
          isLoading={analystRecommendationLoading || isSectionEnhancing('analystRecommendation')}
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'analystRecommendation',
              improvementText,
            });
          }}
        >
          <SubHeading>Current Consensus (Last 3 Months: Oct-Dec 2025)</SubHeading>
          <div className="mx-auto max-w-[900px]">
            <TableWithoutPagination
              headings={[
                <div key={`h1`} className={cn('px-[26px] py-[10px] font-medium')}>
                  Rating
                </div>,
                <div key={`h2`} className={cn('px-[26px] py-[10px] font-medium')}>
                  Count
                </div>,
                <div key={`h3`} className={cn('px-[26px] py-[10px] font-medium')}>
                  % of Total
                </div>,
                <div key={`h4`} className={cn('px-[26px] py-[10px] font-medium')}>
                  Trend
                </div>,
              ]}
              rows={[
                ...(analystRecommendation?.currentConsensus || []).map((consensus, index) => [
                  <div className="py-[10px] text-sm text-muted-foreground" key={`col1-${index}`}>
                    {consensus.rating}
                  </div>,

                  <div key={`col2-${index}`} className={cn('py-[10px] font-medium')}>
                    {consensus.count}
                  </div>,
                  <div key={`col3-${index}`} className={cn('py-[10px] font-medium')}>
                    {consensus.percentageOfTotal}
                  </div>,
                  <div key={`col4-${index}`} className={cn('py-[10px] font-medium')}>
                    {consensus.trend}
                  </div>,
                ]),
              ]}
              noData="No fundamentals available"
            />
          </div>
          <SubHeading>Consensus Details:</SubHeading>
          <List
            items={(analystRecommendation?.consensusDetails || []).map(
              (item) => `<span style="font-weight: bold">${item.name}</span>: ${item.value}`,
            )}
          />
          {analystRecommendation?.recentAnalystViews.length ? (
            <>
              <SubHeading>Recent Analyst Views</SubHeading>
              <List items={analystRecommendation.recentAnalystViews} />
            </>
          ) : null}
        </SectionWrapper>
        <SectionWrapper
          heading="4. EQUITY VALUATION & DCF ANALYSIS"
          visible={Boolean(equityValuationAndDcfAnalysis) || equityValuationAndDcfAnalysisLoading}
          isLoading={
            equityValuationAndDcfAnalysisLoading ||
            isSectionEnhancing('equityValuationAndDcfAnalysis')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'equityValuationAndDcfAnalysis',
              improvementText,
            });
          }}
        >
          <SubHeading>DCF Valuation Model</SubHeading>
          <TertiaryHeading>Key Assumptions</TertiaryHeading>
          <List
            items={(equityValuationAndDcfAnalysis?.keyAssumptions || []).map(
              (a) => `<span style='font-weight: bold'>${a.modelName}</span>: ${a.assumption}`,
            )}
          />
          <TertiaryHeading>Projected Financials (FY26-FY30E):</TertiaryHeading>
          <TableWithoutPagination
            noData="No data"
            headings={(() => {
              const fyOrder = ['FY_2026', 'FY_2027', 'FY_2028', 'FY_2029', 'FY_2030'] as const;
              const label: Record<string, string> = {
                FY_2026: 'FY26E',
                FY_2027: 'FY27E',
                FY_2028: 'FY28E',
                FY_2029: 'FY29E',
                FY_2030: 'FY30E',
              };
              return [
                <div key={`h-metric`} className={cn('px-[26px] py-[10px] font-medium')}>
                  Metric
                </div>,
                ...fyOrder.map((fy) => (
                  <div key={`h-${fy}`} className={cn('px-[26px] py-[10px] font-medium')}>
                    {label[fy]}
                  </div>
                )),
              ];
            })()}
            rows={(() => {
              const pfy = equityValuationAndDcfAnalysis?.projectedFinancialYears || [];
              const byYear: Record<string, { metric: string; value: string }[]> = {};
              pfy.forEach((y) => {
                byYear[y.financialYear] = (y.projections || []).map((p: ProjectionMetricRow) => ({
                  metric: p.metric,
                  value: p.value,
                }));
              });

              const fyOrder = ['FY_2026', 'FY_2027', 'FY_2028', 'FY_2029', 'FY_2030'];
              const metricOrder: { key: string; label: string }[] = [
                { key: 'REVENUE_GBP_M', label: 'Revenue' },
                { key: 'REVENUE_GROWTH', label: 'Revenue Growth' },
                { key: 'PBT_MARGIN_PERCENT', label: 'PBT Margin %' },
                { key: 'PBT_GBP_M', label: 'PBT' },
                { key: 'TAX_RATE', label: 'Tax Rate' },
                { key: 'NET_INCOME_GBP_M', label: 'Net Income' },
                { key: 'DILUTED_SHARES_M', label: 'Diluted Shares (m)' },
                { key: 'DILUTED_EPS_P', label: 'Diluted EPS' },
              ];

              return metricOrder.map((m, mi) => [
                <div className="py-[10px] text-sm text-muted-foreground" key={`met-name-${mi}`}>
                  {m.label}
                </div>,
                ...fyOrder.map((fy, yi) => {
                  const list = byYear[fy] || [];
                  const found = list.find((it) => it.metric === m.key);
                  return (
                    <div className={cn('py-[10px] font-medium')} key={`met-val-${mi}-${yi}`}>
                      {found?.value ?? '-'}
                    </div>
                  );
                }),
              ]);
            })()}
          />
          <TertiaryHeading>DCF Valuation Build-up:</TertiaryHeading>
          {(() => {
            const b = equityValuationAndDcfAnalysis?.dcfValuationBuildup;
            if (!b) return <div className="text-sm text-muted-foreground">No data</div>;
            const items = [
              `<span class='font-semibold'>PV of FCF</span>: ${b.pvOfFCF}`,
              `<span class='font-semibold'>PV of Terminal Value</span>: ${b.pvOfTerminalValue}`,
              `<span class='font-semibold'>Enterprise Value</span>: ${b.enterpriseValue}`,
              `<span class='font-semibold'>Less: Net Debt</span>: ${b.netDebt}`,
              `<span class='font-semibold'>Equity Value</span>: ${b.equityValue}`,
              `<span class='font-semibold'>Fair Value per Share</span>: ${b.fairValuePerShare}`,
              `<span class='font-semibold'>Current Price</span>: ${b.currentPrice}`,
              `<span class='font-semibold'>Implied Upside</span>: ${b.impliedUpside}`,
            ];
            return (
              <>
                <List items={items} />
                {b.note ? (
                  <p className="-mt-4 pt-0 text-xs text-muted-foreground">*Note: {b.note}</p>
                ) : null}
              </>
            );
          })()}
          <SubHeading>Valuation Sensitivity Analysis</SubHeading>
          <TableWithoutPagination
            noData="No data"
            headings={(() => {
              const tg = ['2.5%', '3.0%', '3.5%', '4.0%', '4.5%'];
              return [
                <div key={`h-wacc`} className={cn('px-[26px] py-[10px] font-medium')}>
                  WACC \\ Growth
                </div>,
                ...tg.map((t, i) => (
                  <div key={`h-tg-${i}`} className={cn('px-[26px] py-[10px] font-medium')}>
                    {t}
                  </div>
                )),
              ];
            })()}
            rows={(() => {
              const rows = equityValuationAndDcfAnalysis?.valuationSensitivities || [];
              const tgOrder = ['2.5%', '3.0%', '3.5%', '4.0%', '4.5%'];
              return rows.map((r, idx) => [
                <div className="py-[10px] text-sm text-muted-foreground" key={`sen-w-${idx}`}>
                  {r.wacc}
                </div>,
                ...tgOrder.map((tg, j) => {
                  const found = (r.values || []).find((v) => v.terminalGrowth === tg);
                  return (
                    <div className={cn('py-[10px] font-medium')} key={`sen-v-${idx}-${j}`}>
                      {found?.value ?? '-'}
                    </div>
                  );
                }),
              ]);
            })()}
          />
          <p>Key Takeaway: {equityValuationAndDcfAnalysis?.keyTakeAway || ''}</p>
        </SectionWrapper>
        <SectionWrapper
          heading="5. FINANCIAL STATEMENTS ANALYSIS"
          visible={Boolean(financialStatementAnalyasis) || financialStatementAnalyasisLoading}
          isLoading={
            financialStatementAnalyasisLoading || isSectionEnhancing('financialStatementAnalyasis')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'financialStatementAnalyasis',
              improvementText,
            });
          }}
        >
          {/* Income Statement Trend */}
          <SubHeading>Income Statement Trend (FY20–FY25)</SubHeading>
          <TableWithoutPagination
            noData="No data"
            headings={(() => {
              const cols = [
                'Fiscal Year',
                'Revenue (£m)',
                'Y/Y Growth',
                'Operating Income (£m)',
                'Net Income (£m)',
                'EPS (p)',
              ];
              return cols.map((c, i) => (
                <div key={`ist-h-${i}`} className={cn('px-[26px] py-[10px] font-medium')}>
                  {c}
                </div>
              ));
            })()}
            rows={(() => {
              const rows = financialStatementAnalyasis?.incomeStatementTrendRows || [];
              return FY_ORDER.map((fy) => rows.find((r) => r.fiscalYear === fy))
                .filter((r): r is IncomeStatementTrendRow => Boolean(r))
                .slice(0, 6)
                .map((r, idx: number) => [
                  <div className="py-[10px] text-sm text-muted-foreground" key={`ist-fy-${idx}`}>
                    {FY_LABEL[r.fiscalYear as keyof typeof FY_LABEL]}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`ist-rev-${idx}`}>
                    {r.revenue}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`ist-yoy-${idx}`}>
                    {r.yoyGrowth}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`ist-oi-${idx}`}>
                    {r.operatingIncome}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`ist-ni-${idx}`}>
                    {r.netIncome}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`ist-eps-${idx}`}>
                    {r.eps}
                  </div>,
                ]);
            })()}
          />
          <TertiaryHeading>Key Observations:</TertiaryHeading>
          <List items={financialStatementAnalyasis?.keyObservations || []} />

          {/* Balance Sheet Strength */}
          <SubHeading>Balance Sheet Strength (FY20–FY25)</SubHeading>
          <TableWithoutPagination
            noData="No data"
            headings={(() => {
              const cols = [
                'Fiscal Year',
                'Cash (£m)',
                'Total Assets (£m)',
                'Total Debt (£m)',
                "Shareholders' Equity (£m)",
                'Debt/Equity',
              ];
              return cols.map((c, i) => (
                <div key={`bss-h-${i}`} className={cn('px-[26px] py-[10px] font-medium')}>
                  {c}
                </div>
              ));
            })()}
            rows={(() => {
              const rows = financialStatementAnalyasis?.balanceSheetStrengthRows || [];
              return FY_ORDER.map((fy) => rows.find((r) => r.fiscalYear === fy))
                .filter((r): r is BalanceSheetStrengthRow => Boolean(r))
                .slice(0, 6)
                .map((r, idx: number) => [
                  <div className="py-[10px] text-sm text-muted-foreground" key={`bss-fy-${idx}`}>
                    {FY_LABEL[r.fiscalYear as keyof typeof FY_LABEL]}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`bss-cash-${idx}`}>
                    {r.cash}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`bss-ta-${idx}`}>
                    {r.totalAssets}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`bss-td-${idx}`}>
                    {r.totalDebt}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`bss-se-${idx}`}>
                    {r.shareholdersEquity}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`bss-de-${idx}`}>
                    {r.debtToEquity}
                  </div>,
                ]);
            })()}
          />
          <TertiaryHeading>Capital Position Analysis:</TertiaryHeading>
          <List items={financialStatementAnalyasis?.capitalPositionAnalysis || []} />

          {/* Cash Flow Analysis */}
          <SubHeading>Cash Flow Analysis</SubHeading>
          <TableWithoutPagination
            noData="No data"
            headings={(() => {
              const cols = [
                'Fiscal Year',
                'Operating CF (£m)',
                'CapEx (£m)',
                'Free CF (£m)',
                'FCF Margin',
                'Dividends Paid (£m)',
                'Share Buyback (£m)',
              ];
              return cols.map((c, i) => (
                <div key={`cfa-h-${i}`} className={cn('px-[26px] py-[10px] font-medium')}>
                  {c}
                </div>
              ));
            })()}
            rows={(() => {
              const rows = financialStatementAnalyasis?.cashFlowAnalysisRows || [];
              return FY_ORDER.map((fy) => rows.find((r) => r.fiscalYear === fy))
                .filter((r): r is CashFlowAnalysisRow => Boolean(r))
                .slice(0, 6)
                .map((r, idx: number) => [
                  <div className="py-[10px] text-sm text-muted-foreground" key={`cfa-fy-${idx}`}>
                    {FY_LABEL[r.fiscalYear as keyof typeof FY_LABEL]}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`cfa-ocf-${idx}`}>
                    {r.operatingCF}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`cfa-capex-${idx}`}>
                    {r.capex}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`cfa-fcf-${idx}`}>
                    {r.freeCF}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`cfa-margin-${idx}`}>
                    {r.fcfMargin}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`cfa-div-${idx}`}>
                    {r.dividendsPaid}
                  </div>,
                  <div className={cn('py-[10px] font-medium')} key={`cfa-buy-${idx}`}>
                    {r.shareBuyback}
                  </div>,
                ]);
            })()}
          />
          <TertiaryHeading>FCF Quality Analysis:</TertiaryHeading>
          <List items={financialStatementAnalyasis?.fcfQualityAnalysis || []} />

          {/* Financial Ratios & Credit Metrics */}
          <SubHeading>Financial Ratios & Credit Metrics</SubHeading>
          {(() => {
            const ratioRows: ReportFinancialRatioMetric[] =
              financialStatementAnalyasis?.financialRatioMetrics || [];
            const yearOrder = ['FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25'];
            const yearLabel: Record<string, string> = {
              FY20: 'FY20',
              FY21: 'FY21',
              FY22: 'FY22',
              FY23: 'FY23',
              FY24: 'FY24',
              FY25: 'FY25',
            };
            const labelMap: Record<string, string> = {
              P_E_RATIO: 'P/E Ratio',
              PEG_RATIO: 'PEG Ratio',
              EV_REVENUE: 'EV/Revenue',
              EV_EBITDA: 'EV/EBITDA',
              DEBT_EQUITY: 'Debt/Equity',
              INTEREST_COVERAGE: 'Interest Coverage',
              CURRENT_RATIO: 'Current Ratio',
              ROE: 'ROE',
              ROIC: 'ROIC',
            };

            const buildTable = (metricKeys: string[]) => (
              <TableWithoutPagination
                noData="No data"
                headings={[
                  <div key={`frcm-h-m`} className={cn('px-[26px] py-[10px] font-medium')}>
                    Metric
                  </div>,
                  ...yearOrder.map((y) => (
                    <div key={`frcm-h-${y}`} className={cn('px-[26px] py-[10px] font-medium')}>
                      {yearLabel[y]}
                    </div>
                  )),
                ]}
                rows={metricKeys.map((key, mi) => {
                  const row = ratioRows.find((r) => r.metric === key);
                  const vByYear: Record<string, string> = {};
                  (row?.values || []).forEach((v) => (vByYear[v.year] = v.value));
                  return [
                    <div
                      className="py-[10px] text-sm text-muted-foreground"
                      key={`frcm-name-${mi}`}
                    >
                      {labelMap[key] || key}
                    </div>,
                    ...yearOrder.map((y, yi) => (
                      <div key={`frcm-v-${mi}-${yi}`} className={cn('py-[10px] font-medium')}>
                        {vByYear[y] ?? '-'}
                      </div>
                    )),
                  ];
                })}
              />
            );

            return buildTable([
              'P_E_RATIO',
              'PEG_RATIO',
              'EV_REVENUE',
              'EV_EBITDA',
              'DEBT_EQUITY',
              'INTEREST_COVERAGE',
              'CURRENT_RATIO',
              'ROE',
              'ROIC',
            ]);
          })()}
          <TertiaryHeading>Valuation Observations:</TertiaryHeading>
          <List items={financialStatementAnalyasis?.valuationObservations || []} />
        </SectionWrapper>
        {/* BUSINESS SEGMENTS & COMPETITIVE POSITION */}
        <SectionWrapper
          heading="6. BUSINESS SEGMENTS & COMPETITIVE POSITION"
          visible={Boolean(reportBusinessSegmentData) || businessSegmentDataLoading}
          isLoading={businessSegmentDataLoading || isSectionEnhancing('businessSegmentData')}
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'businessSegmentData',
              improvementText,
            });
          }}
        >
          {(() => {
            const bs = reportBusinessSegmentData;
            if (!bs) return <div className="text-sm text-muted-foreground">No data</div>;

            // Revenue Model Breakdown
            const rmb = bs.revenueModelBreakdown || [];
            const rmbRows = rmb.map((row, i) => [
              <div className="py-[10px] text-sm text-muted-foreground" key={`rmb-rs-${i}`}>
                {row.revenueStream}
              </div>,
              <div className={cn('py-[10px] font-medium')} key={`rmb-amt-${i}`}>
                {row.amount}
              </div>,
              <div className={cn('py-[10px] font-medium')} key={`rmb-pct-${i}`}>
                {row.percentOfTotal}
              </div>,
              <div className={cn('py-[10px] font-medium')} key={`rmb-gr-${i}`}>
                {row.growth}
              </div>,
              <div className={cn('py-[10px] font-medium')} key={`rmb-dr-${i}`}>
                {row.driver}
              </div>,
            ]);

            // Platform Segments Performance
            // const psp = bs.platformSegmentPerformance || [];
            // const pspRows = psp.map((row, i) => [
            //   <div className="py-[10px] text-sm text-muted-foreground" key={`psp-sg-${i}`}>
            //     {row.segment}
            //   </div>,
            //   <div className={cn('py-[10px] font-medium')} key={`psp-cus-${i}`}>
            //     {row.customers}
            //   </div>,
            //   <div className={cn('py-[10px] font-medium')} key={`psp-aua-${i}`}>
            //     {row.aua}
            //   </div>,
            //   <div className={cn('py-[10px] font-medium')} key={`psp-gr-${i}`}>
            //     {row.growth}
            //   </div>,
            //   <div className={cn('py-[10px] font-medium')} key={`psp-ni-${i}`}>
            //     {row.netInflows}
            //   </div>,
            //   <div className={cn('py-[10px] font-medium')} key={`psp-cm-${i}`}>
            //     {row.comments}
            //   </div>,
            // ]);

            const comp = bs.competitivePosition;
            const competitors = comp?.keyCompetitors || [];
            const advantages = comp?.competitiveAdvantage || [];

            return (
              <>
                <TertiaryHeading>Revenue Model Breakdown</TertiaryHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={[
                    <div key="rmb-h-rs" className={cn('px-[26px] py-[10px] font-medium')}>
                      Revenue Stream
                    </div>,
                    <div key="rmb-h-am" className={cn('px-[26px] py-[10px] font-medium')}>
                      Amount
                    </div>,
                    <div key="rmb-h-pt" className={cn('px-[26px] py-[10px] font-medium')}>
                      % of Total
                    </div>,
                    <div key="rmb-h-gr" className={cn('px-[26px] py-[10px] font-medium')}>
                      Growth
                    </div>,
                    <div key="rmb-h-dr" className={cn('px-[26px] py-[10px] font-medium')}>
                      Driver
                    </div>,
                  ]}
                  rows={rmbRows}
                />

                {/* <TertiaryHeading className="mt-8">Platform Segments Performance</TertiaryHeading>
              <TableWithoutPagination
                noData="No data"
                headings={[
                  <div key="psp-h-sg" className={cn('px-[26px] py-[10px] font-medium')}>
                    Segment
                  </div>,
                  <div key="psp-h-cu" className={cn('px-[26px] py-[10px] font-medium')}>
                    Customers (FY)
                  </div>,
                  <div key="psp-h-au" className={cn('px-[26px] py-[10px] font-medium')}>
                    AUA (Ebn)
                  </div>,
                  <div key="psp-h-gr" className={cn('px-[26px] py-[10px] font-medium')}>
                    Growth
                  </div>,
                  <div key="psp-h-ni" className={cn('px-[26px] py-[10px] font-medium')}>
                    Net Inflows (Ebn)
                  </div>,
                  <div key="psp-h-co" className={cn('px-[26px] py-[10px] font-medium')}>
                    Comments
                  </div>,
                ]}
                rows={pspRows}
              /> */}

                <SubHeading className="mt-8">Business Model Dynamics</SubHeading>
                <List items={bs.businessModelDynamics || []} />

                <SubHeading className="mt-8">Competitive Position</SubHeading>
                {competitors.length ? (
                  <>
                    <TertiaryHeading>Key Competitors &amp; Market Share</TertiaryHeading>
                    <List
                      items={competitors.map(
                        (c) => `<span class='font-semibold'>${c.name}</span> — ${c.description}`,
                      )}
                    />
                  </>
                ) : null}
                {advantages.length ? (
                  <>
                    <TertiaryHeading>Competitive Advantages</TertiaryHeading>
                    <List
                      items={advantages.map(
                        (a) => `<span class='font-semibold'>${a.title}</span>: ${a.description}`,
                      )}
                    />
                  </>
                ) : null}
              </>
            );
          })()}
        </SectionWrapper>
        <SectionWrapper
          heading="7. INTERIM RESULTS & QUARTERLY PERFORMANCE"
          visible={
            Boolean(interimResultsAndQuarterlyPerformance) ||
            interimResultsAndQuarterlyPerformanceLoading
          }
          isLoading={
            interimResultsAndQuarterlyPerformanceLoading ||
            isSectionEnhancing('interimResultsAndQuarterlyPerformance')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'interimResultsAndQuarterlyPerformance',
              improvementText,
            });
          }}
        >
          {(() => {
            const interim = interimResultsAndQuarterlyPerformance;
            if (!interim) return <div className="text-sm text-muted-foreground">No data</div>;

            return (
              <>
                <TertiaryHeading>{interim.title}</TertiaryHeading>

                <TertiaryHeading>Record Financial Performance</TertiaryHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={[
                    <div key="irfp-metric" className={cn('px-[26px] py-[10px] font-medium')}>
                      Metric
                    </div>,
                    <div key="irfp-curr" className={cn('px-[26px] py-[10px] font-medium')}>
                      Current Year
                    </div>,
                    <div key="irfp-prev" className={cn('px-[26px] py-[10px] font-medium')}>
                      Previous Year
                    </div>,
                    <div key="irfp-change" className={cn('px-[26px] py-[10px] font-medium')}>
                      Change
                    </div>,
                    <div key="irfp-margin" className={cn('px-[26px] py-[10px] font-medium')}>
                      Margin
                    </div>,
                  ]}
                  rows={
                    interim.recordFinancialPerformance?.map((row, idx) => [
                      <div
                        className="py-[10px] text-sm text-muted-foreground"
                        key={`irfp-metric-${idx}`}
                      >
                        {row.metric}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`irfp-curr-${idx}`}>
                        {row.currentYearValue}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`irfp-prev-${idx}`}>
                        {row.previousYearValue}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`irfp-change-${idx}`}>
                        {row.change}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`irfp-margin-${idx}`}>
                        {row.margin}
                      </div>,
                    ]) || []
                  }
                />

                <TertiaryHeading className="mt-8">Key Positives</TertiaryHeading>
                <List items={interim.keyPositives || []} />

                <TertiaryHeading className="mt-8">Key Negatives</TertiaryHeading>
                <List items={interim.keyNegatives || []} />

                <TertiaryHeading className="mt-8">Forward Guidance & Assumptions</TertiaryHeading>
                <SubHeading>
                  Management Commentary ({interim.forwardGuidance?.managementCommentary?.ceoName})
                </SubHeading>
                <List items={interim.forwardGuidance?.managementCommentary?.quotes || []} />

                <SubHeading className="mt-4">Analyst Consensus FY1</SubHeading>
                <List
                  items={
                    interim.forwardGuidance?.analystConsensusFY1?.map(
                      (row) =>
                        `<span style="font-weight: bold">${row.metric}</span>: ${row.forecastValue} (${row.growth}) — ${row.commentary}`,
                    ) || []
                  }
                />
              </>
            );
          })()}
        </SectionWrapper>

        <SectionWrapper
          heading="8. CONTINGENT LIABILITIES & REGULATORY RISKS"
          visible={
            Boolean(contingentLiabilitiesAndRegulatoryRisk) ||
            contingentLiabilitiesAndRegulatoryRiskLoading
          }
          isLoading={
            contingentLiabilitiesAndRegulatoryRiskLoading ||
            isSectionEnhancing('contingentLiabilitiesAndRegulatoryRisk')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'contingentLiabilitiesAndRegulatoryRisk',
              improvementText,
            });
          }}
        >
          {(() => {
            const contingent = contingentLiabilitiesAndRegulatoryRisk;
            if (!contingent) return <div className="text-sm text-muted-foreground">No data</div>;

            return (
              <>
                <SubHeading>Balance Sheet Contingencies</SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={[
                    <div key="bsc-item" className={cn('px-[26px] py-[10px] font-medium')}>
                      Item
                    </div>,
                    <div key="bsc-amount" className={cn('px-[26px] py-[10px] font-medium')}>
                      Amount
                    </div>,
                    <div key="bsc-status" className={cn('px-[26px] py-[10px] font-medium')}>
                      Status
                    </div>,
                    <div key="bsc-risk" className={cn('px-[26px] py-[10px] font-medium')}>
                      Risk Level
                    </div>,
                    <div key="bsc-impact" className={cn('px-[26px] py-[10px] font-medium')}>
                      Impact
                    </div>,
                  ]}
                  rows={
                    contingent.balanceSheetContingencies?.map((row, idx) => [
                      <div
                        className="py-[10px] text-sm text-muted-foreground"
                        key={`bsc-item-${idx}`}
                      >
                        {row.item}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`bsc-amount-${idx}`}>
                        {row.amount}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`bsc-status-${idx}`}>
                        {row.status}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`bsc-risk-${idx}`}>
                        {row.riskLevel}
                      </div>,
                      <div className={cn('py-[10px] font-medium')} key={`bsc-impact-${idx}`}>
                        {row.impact}
                      </div>,
                    ]) || []
                  }
                />

                <Description>
                  <strong>Net Contingent Position:</strong>{' '}
                  {contingent.netContingentPosition?.quantifiedAnnualLiabilities}{' '}
                  {contingent.netContingentPosition?.oneTimeCosts} —{' '}
                  {contingent.netContingentPosition?.valuationImpact}
                </Description>

                <SubHeading className="mt-8">Regulatory Environment</SubHeading>
                <List
                  items={
                    contingent.keyRegulatoryConsiderations?.map(
                      (row) =>
                        `<span style="font-weight: bold">${row.title}</span>: ${row.description}`,
                    ) || []
                  }
                />
              </>
            );
          })()}
        </SectionWrapper>

        <SectionWrapper
          heading="9. DCF VALUATION RECAP & PRICE TARGET"
          visible={
            Boolean(dcfValuationRecapAndPriceTarget) || dcfValuationRecapAndPriceTargetLoading
          }
          isLoading={
            dcfValuationRecapAndPriceTargetLoading ||
            isSectionEnhancing('dcfValuationRecapAndPriceTarget')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'dcfValuationRecapAndPriceTarget',
              improvementText,
            });
          }}
        >
          {(() => {
            const dcfRecap = dcfValuationRecapAndPriceTarget;
            if (!dcfRecap) return <div className="text-sm text-muted-foreground">No data</div>;

            return (
              <>
                <SubHeading>{dcfRecap.valuationSummaryTitle}</SubHeading>
                <Description>
                  <strong>Base Case DCF:</strong> {dcfRecap.baseCaseAssumption}
                </Description>

                <List
                  items={[
                    `<span style="font-weight: bold">PV of FCF</span>: ${dcfRecap.pvOfFcf}`,
                    `<span style="font-weight: bold">PV of Terminal Value</span>: ${dcfRecap.pvOfTerminalValue}`,
                    `<span style="font-weight: bold">Enterprise Value</span>: ${dcfRecap.enterpriseValue}`,
                    `<span style="font-weight: bold">Less: Net Debt</span>: ${dcfRecap.netDebt}`,
                    `<span style="font-weight: bold">Equity Value</span>: ${dcfRecap.equityValue}`,
                    `<span style="font-weight: bold">Shares Diluted</span>: ${dcfRecap.sharesDiluted}`,
                    `<span style="font-weight: bold">Fair Value per Share</span>: ${dcfRecap.fairValuePerShare}`,
                    `<span style="font-weight: bold">Current Price</span>: ${dcfRecap.currentPrice}`,
                    `<span style="font-weight: bold">Upside</span>: ${dcfRecap.upside}`,
                    `<span style="font-weight: bold">Recommendation</span>: ${dcfRecap.recommendation}`,
                  ]}
                />

                <SubHeading className="mt-6">Sensitivity Analysis Recap</SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={[
                    <div key="dcf-scenario" className={cn('px-[26px] py-[10px] font-medium')}>
                      Scenario
                    </div>,
                    <div key="dcf-assumption" className={cn('px-[26px] py-[10px] font-medium')}>
                      Assumption
                    </div>,
                    <div key="dcf-value" className={cn('px-[26px] py-[10px] font-medium')}>
                      Value
                    </div>,
                  ]}
                  rows={(dcfRecap.sensitivityAnalysisRecap || []).map((row, idx: number) => [
                    <div className="py-[10px] text-sm text-muted-foreground" key={`dcf-s-${idx}`}>
                      {row.scenario}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`dcf-a-${idx}`}>
                      {row.assumption}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`dcf-v-${idx}`}>
                      {row.value}
                    </div>,
                  ])}
                />

                <SubHeading className="mt-6">12-Month Price Target</SubHeading>
                <Description>{dcfRecap.twelveMonthPriceTarget}</Description>

                <SubHeading className="mt-6">Rationale for Price Target</SubHeading>
                <List items={dcfRecap.rationaleForPriceTarget || []} />
              </>
            );
          })()}
        </SectionWrapper>

        <SectionWrapper
          heading="10. FORWARD PROJECTIONS: P&L, BALANCE SHEET & VALUATION"
          visible={Boolean(forwardProjectionsAndValuation) || forwardProjectionsAndValuationLoading}
          isLoading={
            forwardProjectionsAndValuationLoading ||
            isSectionEnhancing('forwardProjectionsAndValuation')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'forwardProjectionsAndValuation',
              improvementText,
            });
          }}
        >
          {(() => {
            const forward = forwardProjectionsAndValuation;
            if (!forward) return <div className="text-sm text-muted-foreground">No data</div>;

            return (
              <>
                <SubHeading>Projected Income Statement (FY26-FY30E)</SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={['Metric', 'FY26E', 'FY27E', 'FY28E', 'FY29E', 'FY30E'].map(
                    (h, idx) => (
                      <div
                        key={`fwd-is-h-${idx}`}
                        className={cn('px-[26px] py-[10px] font-medium')}
                      >
                        {h}
                      </div>
                    ),
                  )}
                  rows={(forward.projectedIncomeStatementRows || []).map((row, idx) => [
                    <div
                      className="py-[10px] text-sm text-muted-foreground"
                      key={`fwd-is-m-${idx}`}
                    >
                      {row.metric}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-is-26-${idx}`}>
                      {row.fy26e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-is-27-${idx}`}>
                      {row.fy27e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-is-28-${idx}`}>
                      {row.fy28e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-is-29-${idx}`}>
                      {row.fy29e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-is-30-${idx}`}>
                      {row.fy30e}
                    </div>,
                  ])}
                />

                <SubHeading className="mt-6">Key Projection Drivers</SubHeading>
                <List items={forward.keyProjectionDrivers || []} />

                <SubHeading className="mt-6">
                  Projected Balance Sheet (Simplified, FY26-FY30E)
                </SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={['Item', 'FY25A', 'FY26E', 'FY27E', 'FY28E', 'FY29E', 'FY30E'].map(
                    (h, idx) => (
                      <div
                        key={`fwd-bs-h-${idx}`}
                        className={cn('px-[26px] py-[10px] font-medium')}
                      >
                        {h}
                      </div>
                    ),
                  )}
                  rows={(forward.projectedBalanceSheetRows || []).map((row, idx) => [
                    <div
                      className="py-[10px] text-sm text-muted-foreground"
                      key={`fwd-bs-i-${idx}`}
                    >
                      {row.item}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-bs-25-${idx}`}>
                      {row.fy25a}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-bs-26-${idx}`}>
                      {row.fy26e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-bs-27-${idx}`}>
                      {row.fy27e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-bs-28-${idx}`}>
                      {row.fy28e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-bs-29-${idx}`}>
                      {row.fy29e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-bs-30-${idx}`}>
                      {row.fy30e}
                    </div>,
                  ])}
                />

                <SubHeading className="mt-6">Balance Sheet Dynamics</SubHeading>
                <List items={forward.balanceSheetDynamics || []} />

                <SubHeading className="mt-6">Projected Cash Flow & FCF (FY26-FY30E)</SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={['Metric', 'FY26E', 'FY27E', 'FY28E', 'FY29E', 'FY30E'].map(
                    (h, idx) => (
                      <div
                        key={`fwd-cf-h-${idx}`}
                        className={cn('px-[26px] py-[10px] font-medium')}
                      >
                        {h}
                      </div>
                    ),
                  )}
                  rows={(forward.projectedCashFlowRows || []).map((row, idx) => [
                    <div
                      className="py-[10px] text-sm text-muted-foreground"
                      key={`fwd-cf-m-${idx}`}
                    >
                      {row.metric}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cf-26-${idx}`}>
                      {row.fy26e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cf-27-${idx}`}>
                      {row.fy27e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cf-28-${idx}`}>
                      {row.fy28e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cf-29-${idx}`}>
                      {row.fy29e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cf-30-${idx}`}>
                      {row.fy30e}
                    </div>,
                  ])}
                />

                <SubHeading className="mt-6">Key Observations</SubHeading>
                <List items={forward.keyObservations || []} />

                <SubHeading className="mt-6">Credit Metrics Projection (FY26-FY30E)</SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={['Metric', 'FY26E', 'FY27E', 'FY28E', 'FY29E', 'FY30E'].map(
                    (h, idx) => (
                      <div
                        key={`fwd-cr-h-${idx}`}
                        className={cn('px-[26px] py-[10px] font-medium')}
                      >
                        {h}
                      </div>
                    ),
                  )}
                  rows={(forward.creditMetricsRows || []).map((row, idx) => [
                    <div
                      className="py-[10px] text-sm text-muted-foreground"
                      key={`fwd-cr-m-${idx}`}
                    >
                      {row.metric}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cr-26-${idx}`}>
                      {row.fy26e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cr-27-${idx}`}>
                      {row.fy27e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cr-28-${idx}`}>
                      {row.fy28e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cr-29-${idx}`}>
                      {row.fy29e}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`fwd-cr-30-${idx}`}>
                      {row.fy30e}
                    </div>,
                  ])}
                />

                <SubHeading className="mt-6">Credit Outlook</SubHeading>
                <Description>{forward.creditOutlook}</Description>
              </>
            );
          })()}
        </SectionWrapper>

        <SectionWrapper
          heading="11. ANNUAL GENERAL MEETING & SHAREHOLDER MATTERS"
          visible={Boolean(agmAndShareholderMatters) || agmAndShareholderMattersLoading}
          isLoading={
            agmAndShareholderMattersLoading || isSectionEnhancing('agmAndShareholderMatters')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'agmAndShareholderMatters',
              improvementText,
            });
          }}
        >
          {(() => {
            const agm = agmAndShareholderMatters;
            if (!agm) return <div className="text-sm text-muted-foreground">No data</div>;

            return (
              <>
                <SubHeading>Next AGM Details</SubHeading>
                <List
                  items={[
                    `<span style="font-weight: bold">Announced Date</span>: ${agm.announcedDate}`,
                    `<span style="font-weight: bold">Location</span>: ${agm.location}`,
                    `<span style="font-weight: bold">Notice Filed</span>: ${agm.noticeFiled}`,
                  ]}
                />

                <SubHeading className="mt-6">Expected Voting Agenda</SubHeading>
                <TableWithoutPagination
                  noData="No data"
                  headings={[
                    <div key="agm-r" className={cn('px-[26px] py-[10px] font-medium')}>
                      Resolution #
                    </div>,
                    <div key="agm-t" className={cn('px-[26px] py-[10px] font-medium')}>
                      Title
                    </div>,
                    <div key="agm-ty" className={cn('px-[26px] py-[10px] font-medium')}>
                      Type
                    </div>,
                    <div key="agm-er" className={cn('px-[26px] py-[10px] font-medium')}>
                      Expected Result
                    </div>,
                  ]}
                  rows={(agm.expectedVotingAgenda || []).map((row, idx) => [
                    <div className="py-[10px] text-sm text-muted-foreground" key={`agm-r-${idx}`}>
                      {row.resolutionNumber}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`agm-t-${idx}`}>
                      {row.title}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`agm-ty-${idx}`}>
                      {row.type}
                    </div>,
                    <div className={cn('py-[10px] font-medium')} key={`agm-er-${idx}`}>
                      {row.expectedResult}
                    </div>,
                  ])}
                />

                <SubHeading className="mt-6">Special Resolutions Expected</SubHeading>
                <List items={agm.specialResolutionsExpected || []} />

                <SubHeading className="mt-6">Key Governance Notes</SubHeading>
                <List items={agm.keyGovernanceNotes || []} />
              </>
            );
          })()}
        </SectionWrapper>

        <SectionWrapper
          heading="12. CONCLUSION"
          visible={Boolean(conclusionAndRecommendation) || conclusionAndRecommendationLoading}
          isLoading={
            conclusionAndRecommendationLoading || isSectionEnhancing('conclusionAndRecommendation')
          }
          symbol={symbol}
          onEnhanceSection={async (_symbol: string, improvementText: string) => {
            await enhanceSectionMutation.mutateAsync({
              sectionKey: 'conclusionAndRecommendation',
              improvementText,
            });
          }}
        >
          {(() => {
            const conclusion = conclusionAndRecommendation;
            if (!conclusion) return <div className="text-sm text-muted-foreground">No data</div>;

            return (
              <>
                <Description>{conclusion.summary}</Description>
                <SubHeading className="mt-6">Key Strengths</SubHeading>
                <List items={conclusion.strengths || []} />

                <SubHeading className="mt-6">Valuation</SubHeading>
                <List
                  items={[
                    `<span style="font-weight: bold">Base Case</span>: ${conclusion.valuationSummary}`,
                    `<span style="font-weight: bold">Analyst Consensus</span>: ${conclusion.analystConsensus}`,
                  ]}
                />

                <SubHeading className="mt-6">For Investors</SubHeading>
                <List items={conclusion.investorFit || []} />

                <SubHeading className="mt-6">Entry Strategy</SubHeading>
                <List items={conclusion.entryStrategy || []} />

                <SubHeading className="mt-6">Key Catalysts for Upside</SubHeading>
                <List items={conclusion.upsideCatalysts || []} />

                <SubHeading className="mt-6">Key Catalysts for Downside</SubHeading>
                <List items={conclusion.downsideCatalysts || []} />

                <SubHeading className="mt-6">Recommendation</SubHeading>
                <List
                  items={[
                    `<span style="font-weight: bold">Recommendation</span>: ${conclusion.recommendation}`,
                    `<span style="font-weight: bold">Price Target (12-month)</span>: ${conclusion.priceTarget}`,
                    `<span style="font-weight: bold">Expected Return</span>: ${conclusion.expectedReturn}`,
                    `<span style="font-weight: bold">Time Horizon</span>: ${conclusion.timeHorizon}`,
                    `<span style="font-weight: bold">Risk Profile</span>: ${conclusion.riskProfile}`,
                  ]}
                />

                <div className="mt-8 border-t pt-6">
                  <Description>
                    <strong>Disclaimer:</strong> {conclusion.disclaimer}
                  </Description>
                </div>
              </>
            );
          })()}
        </SectionWrapper>
      </div>
    </div>
  );
}

export default Report;
