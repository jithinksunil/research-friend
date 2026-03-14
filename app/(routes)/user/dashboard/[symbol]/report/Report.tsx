'use client';
import { Heading } from './Heading';
import { SubHeading } from './SubHeading';
import { TertiaryHeading } from './TertiaryHeading';
import { SectionWrapper } from './SectionWrapper';
import { Description } from './Description';
import { List } from './List';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
import { cn, formatDate } from '@/lib';
import {
  enhanceCompanyOverviewAndStockMetricsSection,
  enhanceExecutiveSection,
  enhanceShareholderStructureSection,
  enhanceAnalystRecommendationSection,
  enhanceEquityValuationAndDcfAnalysisSection,
  enhanceFinancialStatementAnalysisSection,
  enhanceBusinessSegmentDataSection,
  enhanceInterimResultsAndQuarterlyPerformanceSection,
  enhanceContingentLiabilitiesAndRegulatoryRiskSection,
  enhanceConclusionAndRecommendationSection,
} from '@/app/actions/user/enhancement.actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { produce } from 'immer';
import { getReportDetails } from '@/lib/server-only/repot';
const FY_ORDER = [
  'FY20',
  'FY21',
  'FY22',
  'FY23',
  'FY24',
  'FY25',
  'FY25_EST',
] as const;
const FY_LABEL: Record<(typeof FY_ORDER)[number], string> = {
  FY20: 'FY20',
  FY21: 'FY21',
  FY22: 'FY22',
  FY23: 'FY23',
  FY24: 'FY24',
  FY25: 'FY25',
  FY25_EST: 'FY25 (est)',
};
type ReportDetailsResponse = {
  data: Awaited<ReturnType<typeof getReportDetails>>;
};
type ReportData = ReportDetailsResponse['data'];
type ReportModel = NonNullable<ReportData['report']>;
type EquityValuationAndDcfAnalysis = NonNullable<
  ReportModel['equityValuationAndDcfAnalysis']
>;
type ProjectedFinancialYearRow =
  EquityValuationAndDcfAnalysis['projectedFinancialYears'][number];
type ProjectionMetricRow = ProjectedFinancialYearRow['projections'][number];
type FinancialStatementAnalysis = NonNullable<
  ReportModel['financialStatementAnalyasis']
>;
type IncomeStatementTrendRow =
  FinancialStatementAnalysis['incomeStatementTrendRows'][number];
type BalanceSheetStrengthRow =
  FinancialStatementAnalysis['balanceSheetStrengthRows'][number];
type CashFlowAnalysisRow =
  FinancialStatementAnalysis['cashFlowAnalysisRows'][number];
function Report({ symbol }: { symbol: string }) {
  const { data: report, isLoading } = useQuery({
    queryKey: ['report', symbol],
    queryFn: async () => {
      const res = await axios.get<ReportDetailsResponse>(
        `/api/report?symbol=${symbol}`,
      );
      return res.data;
    },
  });
  const queryClient = useQueryClient();

  if (isLoading) return <div>Loading...</div>;
  if (!report) return <div>Report not found</div>;

  return (
    <div className='py-8'>
      <Heading className='!text-3xl'>{report.data.companyName}</Heading>
      <SubHeading className='!mb-1'>
        Comprehensive Investment Analysis & Valuation Report
      </SubHeading>
      <TertiaryHeading className='!mb-8'>
        Date: {formatDate(new Date().toISOString(), 'January 1, 2000')}
      </TertiaryHeading>

      <SectionWrapper
        heading='EXECUTIVE SUMMARY'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceExecutiveSection(symbol, improvementText);
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.executiveSummary = result.data;
              }),
          );
        }}
      >
        <Description>
          {report.data.report?.executiveSummary?.summary}
        </Description>
        <SubHeading>Investment Thesis</SubHeading>
        <List
          items={[
            `<span style='font-weight: bold' >Positives</span>: ${report.data.report?.executiveSummary?.positive}`,
            `<span style='font-weight: bold' >Risks</span>: ${report.data.report?.executiveSummary?.risk}`,
            `<span style='font-weight: bold' >Current Price: ${report.data.report?.executiveSummary?.currentPrice} | DCF Fair Value: ${report.data.report?.executiveSummary?.dcfFairValue} | Analyst Consensus: ${report.data.report?.executiveSummary?.analystConsensus} | Upside: ${report.data.report?.executiveSummary?.upside}</span>`,
          ]}
        />
      </SectionWrapper>
      <SectionWrapper
        heading='1. COMPANY OVERVIEW & STOCK METRICS'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceCompanyOverviewAndStockMetricsSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.overviewAndStockMetrics = result.data;
              }),
          );
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
          rows={report.data.report?.overviewAndStockMetrics?.stockMetrics.map(
            (metric, index) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`col1-${index}`}
              >
                {metric.name}
              </div>,

              <div
                key={`col2-${index}`}
                className={cn('py-[10px] font-medium')}
              >
                {metric.value}
              </div>,
              <div
                key={`col3-${index}`}
                className={cn('py-[10px] font-medium')}
              >
                {metric.note}
              </div>,
            ],
          )}
          noData='No fundamentals available'
        />
        <SubHeading className='mt-8'>52-Week Performance</SubHeading>
        <Description>
          {report.data.report?.overviewAndStockMetrics?.fiftyTwoWeekPerformance}
        </Description>
      </SectionWrapper>
      <SectionWrapper
        heading='2. SHAREHOLDER STRUCTURE & INSIDER ACTIVITY'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceShareholderStructureSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.shareHolderStructure = result.data;
              }),
          );
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
            ...(
              report.data.report?.shareHolderStructure?.majorShareholders || []
            ).map((shareHolder, index) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`col1-${index}`}
              >
                {shareHolder.shareHolderType}
              </div>,

              <div
                key={`col2-${index}`}
                className={cn('py-[10px] font-medium')}
              >
                {shareHolder.ownership}
              </div>,
              <div
                key={`col3-${index}`}
                className={cn('py-[10px] font-medium')}
              >
                {shareHolder.notes}
              </div>,
            ]),
            [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`col1-Share Capital Structure`}
              >
                Share Capital Structure
              </div>,

              <div
                key={`col2-Share Capital Structure`}
                className={cn('py-[10px] font-medium')}
              >
                {report.data.report?.shareHolderStructure?.totalShares}
              </div>,
              <div
                key={`col3-Share Capital Structure`}
                className={cn('py-[10px] font-medium')}
              >
                {report.data.report?.shareHolderStructure?.shareCapitalNotes}
              </div>,
            ],
          ]}
          noData='No fundamentals available'
        />
        <SubHeading className='mt-8'>Key Insider Observations:</SubHeading>
        <List
          items={
            report.data.report?.shareHolderStructure?.keyInsiderObservations ||
            []
          }
        />
      </SectionWrapper>
      <SectionWrapper
        heading='3. ANALYST RECOMMENDATIONS & PRICE TARGETS'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceAnalystRecommendationSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.analystRecommendation = result.data;
              }),
          );
        }}
      >
        <SubHeading>Current Consensus (Last 3 Months: Oct-Dec 2025)</SubHeading>
        <div className='mx-auto max-w-[900px]'>
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
              ...(
                report.data.report?.analystRecommendation?.currentConsensus ||
                []
              ).map((consensus, index) => [
                <div
                  className='py-[10px] text-sm text-muted-foreground'
                  key={`col1-${index}`}
                >
                  {consensus.rating}
                </div>,

                <div
                  key={`col2-${index}`}
                  className={cn('py-[10px] font-medium')}
                >
                  {consensus.count}
                </div>,
                <div
                  key={`col3-${index}`}
                  className={cn('py-[10px] font-medium')}
                >
                  {consensus.percentageOfTotal}
                </div>,
                <div
                  key={`col4-${index}`}
                  className={cn('py-[10px] font-medium')}
                >
                  {consensus.trend}
                </div>,
              ]),
            ]}
            noData='No fundamentals available'
          />
        </div>
        <SubHeading>Consensus Details:</SubHeading>
        <List
          items={(
            report.data.report?.analystRecommendation?.consensusDetails || []
          ).map(
            (item) =>
              `<span style="font-weight: bold">${item.name}</span>: ${item.value}`,
          )}
        />
        {report.data.report?.analystRecommendation?.recentAnalystViews
          .length ? (
          <>
            <SubHeading>Recent Analyst Views</SubHeading>
            <List
              items={
                report.data.report?.analystRecommendation.recentAnalystViews
              }
            />
          </>
        ) : null}
      </SectionWrapper>
      <SectionWrapper
        heading='4. EQUITY VALUATION & DCF ANALYSIS'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceEquityValuationAndDcfAnalysisSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.equityValuationAndDcfAnalysis = result.data;
              }),
          );
        }}
      >
        <SubHeading>DCF Valuation Model</SubHeading>
        <TertiaryHeading>Key Assumptions</TertiaryHeading>
        <List
          items={(
            report.data.report?.equityValuationAndDcfAnalysis?.keyAssumptions ||
            []
          ).map(
            (a) =>
              `<span style='font-weight: bold'>${a.modelName}</span>: ${a.assumption}`,
          )}
        />
        <TertiaryHeading>Projected Financials (FY26-FY30E):</TertiaryHeading>
        <TableWithoutPagination
          noData='No data'
          headings={(() => {
            const fyOrder = [
              'FY_2026',
              'FY_2027',
              'FY_2028',
              'FY_2029',
              'FY_2030',
            ] as const;
            const label: Record<string, string> = {
              FY_2026: 'FY26E',
              FY_2027: 'FY27E',
              FY_2028: 'FY28E',
              FY_2029: 'FY29E',
              FY_2030: 'FY30E',
            };
            return [
              <div
                key={`h-metric`}
                className={cn('px-[26px] py-[10px] font-medium')}
              >
                Metric
              </div>,
              ...fyOrder.map((fy) => (
                <div
                  key={`h-${fy}`}
                  className={cn('px-[26px] py-[10px] font-medium')}
                >
                  {label[fy]}
                </div>
              )),
            ];
          })()}
          rows={(() => {
            const pfy =
              report.data.report?.equityValuationAndDcfAnalysis
                ?.projectedFinancialYears || [];
            const byYear: Record<string, { metric: string; value: string }[]> =
              {};
            pfy.forEach((y) => {
              byYear[y.financialYear] = (y.projections || []).map((p: ProjectionMetricRow) => ({
                metric: p.metric,
                value: p.value,
              }));
            });

            const fyOrder = [
              'FY_2026',
              'FY_2027',
              'FY_2028',
              'FY_2029',
              'FY_2030',
            ];
            const metricOrder: { key: string; label: string }[] = [
              { key: 'REVENUE_GBP_M', label: 'Revenue (£m)' },
              { key: 'REVENUE_GROWTH', label: 'Revenue Growth' },
              { key: 'PBT_MARGIN_PERCENT', label: 'PBT Margin %' },
              { key: 'PBT_GBP_M', label: 'PBT (£m)' },
              { key: 'TAX_RATE', label: 'Tax Rate' },
              { key: 'NET_INCOME_GBP_M', label: 'Net Income (£m)' },
              { key: 'DILUTED_SHARES_M', label: 'Diluted Shares (m)' },
              { key: 'DILUTED_EPS_P', label: 'Diluted EPS (p)' },
            ];

            return metricOrder.map((m, mi) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`met-name-${mi}`}
              >
                {m.label}
              </div>,
              ...fyOrder.map((fy, yi) => {
                const list = byYear[fy] || [];
                const found = list.find((it) => it.metric === m.key);
                return (
                  <div
                    className={cn('py-[10px] font-medium')}
                    key={`met-val-${mi}-${yi}`}
                  >
                    {found?.value ?? '-'}
                  </div>
                );
              }),
            ]);
          })()}
        />
        <TertiaryHeading>DCF Valuation Build-up:</TertiaryHeading>
        {(() => {
          const b =
            report.data.report?.equityValuationAndDcfAnalysis
              ?.dcfValuationBuildup;
          if (!b)
            return <div className='text-sm text-muted-foreground'>No data</div>;
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
                <p className='-mt-4 pt-0 text-xs text-muted-foreground'>
                  *Note: {b.note}
                </p>
              ) : null}
            </>
          );
        })()}
        <SubHeading>Valuation Sensitivity Analysis</SubHeading>
        <TableWithoutPagination
          noData='No data'
          headings={(() => {
            const tg = ['2.5%', '3.0%', '3.5%', '4.0%', '4.5%'];
            return [
              <div
                key={`h-wacc`}
                className={cn('px-[26px] py-[10px] font-medium')}
              >
                WACC \\ Growth
              </div>,
              ...tg.map((t, i) => (
                <div
                  key={`h-tg-${i}`}
                  className={cn('px-[26px] py-[10px] font-medium')}
                >
                  {t}
                </div>
              )),
            ];
          })()}
          rows={(() => {
            const rows =
              report.data.report?.equityValuationAndDcfAnalysis
                ?.valuationSensitivities || [];
            const tgOrder = ['2.5%', '3.0%', '3.5%', '4.0%', '4.5%'];
            return rows.map((r, idx) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`sen-w-${idx}`}
              >
                {r.wacc}
              </div>,
              ...tgOrder.map((tg, j) => {
                const found = (r.values || []).find(
                  (v) => v.terminalGrowth === tg,
                );
                return (
                  <div
                    className={cn('py-[10px] font-medium')}
                    key={`sen-v-${idx}-${j}`}
                  >
                    {found?.value ?? '-'}
                  </div>
                );
              }),
            ]);
          })()}
        />
        <p>
          Key Takeaway:{' '}
          {report.data.report?.equityValuationAndDcfAnalysis?.keyTakeAway || ''}
        </p>
      </SectionWrapper>
      <SectionWrapper
        heading='5. FINANCIAL STATEMENTS ANALYSIS'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceFinancialStatementAnalysisSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.financialStatementAnalyasis = result.data;
              }),
          );
        }}
      >
        {/* Income Statement Trend */}
        <SubHeading>Income Statement Trend (FY20–FY25)</SubHeading>
        <TableWithoutPagination
          noData='No data'
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
              <div
                key={`ist-h-${i}`}
                className={cn('px-[26px] py-[10px] font-medium')}
              >
                {c}
              </div>
            ));
          })()}
          rows={(() => {
            const rows =
              report.data.report?.financialStatementAnalyasis
                ?.incomeStatementTrendRows || [];
            return FY_ORDER.map((fy) =>
              rows.find((r) => r.fiscalYear === fy),
            )
              .filter((r): r is IncomeStatementTrendRow => Boolean(r))
              .slice(0, 6)
              .map((r, idx: number) => [
                <div
                  className='py-[10px] text-sm text-muted-foreground'
                  key={`ist-fy-${idx}`}
                >
                  {FY_LABEL[r.fiscalYear as keyof typeof FY_LABEL]}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`ist-rev-${idx}`}
                >
                  {r.revenue}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`ist-yoy-${idx}`}
                >
                  {r.yoyGrowth}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`ist-oi-${idx}`}
                >
                  {r.operatingIncome}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`ist-ni-${idx}`}
                >
                  {r.netIncome}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`ist-eps-${idx}`}
                >
                  {r.eps}
                </div>,
              ]);
          })()}
        />
        <TertiaryHeading>Key Observations:</TertiaryHeading>
        <List
          items={
            report.data.report?.financialStatementAnalyasis?.keyObservations ||
            []
          }
        />

        {/* Balance Sheet Strength */}
        <SubHeading>Balance Sheet Strength (FY20–FY25)</SubHeading>
        <TableWithoutPagination
          noData='No data'
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
              <div
                key={`bss-h-${i}`}
                className={cn('px-[26px] py-[10px] font-medium')}
              >
                {c}
              </div>
            ));
          })()}
          rows={(() => {
            const rows =
              report.data.report?.financialStatementAnalyasis
                ?.balanceSheetStrengthRows || [];
            return FY_ORDER.map((fy) =>
              rows.find((r) => r.fiscalYear === fy),
            )
              .filter((r): r is BalanceSheetStrengthRow => Boolean(r))
              .slice(0, 6)
              .map((r, idx: number) => [
                <div
                  className='py-[10px] text-sm text-muted-foreground'
                  key={`bss-fy-${idx}`}
                >
                  {FY_LABEL[r.fiscalYear as keyof typeof FY_LABEL]}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`bss-cash-${idx}`}
                >
                  {r.cash}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`bss-ta-${idx}`}
                >
                  {r.totalAssets}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`bss-td-${idx}`}
                >
                  {r.totalDebt}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`bss-se-${idx}`}
                >
                  {r.shareholdersEquity}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`bss-de-${idx}`}
                >
                  {r.debtToEquity}
                </div>,
              ]);
          })()}
        />
        <TertiaryHeading>Capital Position Analysis:</TertiaryHeading>
        <List
          items={
            report.data.report?.financialStatementAnalyasis
              ?.capitalPositionAnalysis || []
          }
        />

        {/* Cash Flow Analysis */}
        <SubHeading>Cash Flow Analysis</SubHeading>
        <TableWithoutPagination
          noData='No data'
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
              <div
                key={`cfa-h-${i}`}
                className={cn('px-[26px] py-[10px] font-medium')}
              >
                {c}
              </div>
            ));
          })()}
          rows={(() => {
            const rows =
              report.data.report?.financialStatementAnalyasis
                ?.cashFlowAnalysisRows || [];
            return FY_ORDER.map((fy) =>
              rows.find((r) => r.fiscalYear === fy),
            )
              .filter((r): r is CashFlowAnalysisRow => Boolean(r))
              .slice(0, 6)
              .map((r, idx: number) => [
                <div
                  className='py-[10px] text-sm text-muted-foreground'
                  key={`cfa-fy-${idx}`}
                >
                  {FY_LABEL[r.fiscalYear as keyof typeof FY_LABEL]}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`cfa-ocf-${idx}`}
                >
                  {r.operatingCF}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`cfa-capex-${idx}`}
                >
                  {r.capex}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`cfa-fcf-${idx}`}
                >
                  {r.freeCF}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`cfa-margin-${idx}`}
                >
                  {r.fcfMargin}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`cfa-div-${idx}`}
                >
                  {r.dividendsPaid}
                </div>,
                <div
                  className={cn('py-[10px] font-medium')}
                  key={`cfa-buy-${idx}`}
                >
                  {r.shareBuyback}
                </div>,
              ]);
          })()}
        />
        <TertiaryHeading>FCF Quality Analysis:</TertiaryHeading>
        <List
          items={
            report.data.report?.financialStatementAnalyasis
              ?.fcfQualityAnalysis || []
          }
        />

        {/* Financial Ratios & Credit Metrics */}
        <SubHeading>Financial Ratios & Credit Metrics</SubHeading>
        {(() => {
          const ratioRows =
            report.data.report?.financialStatementAnalyasis
              ?.financialRatioMetrics || [];
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
              noData='No data'
              headings={[
                <div
                  key={`frcm-h-m`}
                  className={cn('px-[26px] py-[10px] font-medium')}
                >
                  Metric
                </div>,
                ...yearOrder.map((y) => (
                  <div
                    key={`frcm-h-${y}`}
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    {yearLabel[y]}
                  </div>
                )),
              ]}
              rows={metricKeys.map((key, mi) => {
                const row = ratioRows.find((r) => r.metric === key);
                const vByYear: Record<string, string> = {};
                (row?.values || []).forEach(
                  (v) => (vByYear[v.year] = v.value),
                );
                return [
                  <div
                    className='py-[10px] text-sm text-muted-foreground'
                    key={`frcm-name-${mi}`}
                  >
                    {labelMap[key] || key}
                  </div>,
                  ...yearOrder.map((y, yi) => (
                    <div
                      key={`frcm-v-${mi}-${yi}`}
                      className={cn('py-[10px] font-medium')}
                    >
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
        <List
          items={
            report.data.report?.financialStatementAnalyasis
              ?.valuationObservations || []
          }
        />
      </SectionWrapper>
      {/* BUSINESS SEGMENTS & COMPETITIVE POSITION */}
      <SectionWrapper
        heading='6. BUSINESS SEGMENTS & COMPETITIVE POSITION'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceBusinessSegmentDataSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.businessSegmentData = result.data;
              }),
          );
        }}
      >
        {(() => {
          const bs = report.data.report?.businessSegmentData;
          if (!bs)
            return <div className='text-sm text-muted-foreground'>No data</div>;

          // Revenue Model Breakdown
          const rmb = bs.revenueModelBreakdown || [];
          const rmbRows = rmb.map((row, i) => [
            <div
              className='py-[10px] text-sm text-muted-foreground'
              key={`rmb-rs-${i}`}
            >
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
          const psp = bs.platformSegmentPerformance || [];
          const pspRows = psp.map((row, i) => [
            <div
              className='py-[10px] text-sm text-muted-foreground'
              key={`psp-sg-${i}`}
            >
              {row.segment}
            </div>,
            <div className={cn('py-[10px] font-medium')} key={`psp-cus-${i}`}>
              {row.customers}
            </div>,
            <div className={cn('py-[10px] font-medium')} key={`psp-aua-${i}`}>
              {row.aua}
            </div>,
            <div className={cn('py-[10px] font-medium')} key={`psp-gr-${i}`}>
              {row.growth}
            </div>,
            <div className={cn('py-[10px] font-medium')} key={`psp-ni-${i}`}>
              {row.netInflows}
            </div>,
            <div className={cn('py-[10px] font-medium')} key={`psp-cm-${i}`}>
              {row.comments}
            </div>,
          ]);

          const comp = bs.competitivePosition;
          const competitors = comp?.keyCompetitors || [];
          const advantages = comp?.competitiveAdvantage || [];

          return (
            <>
              <TertiaryHeading>Revenue Model Breakdown</TertiaryHeading>
              <TableWithoutPagination
                noData='No data'
                headings={[
                  <div
                    key='rmb-h-rs'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Revenue Stream
                  </div>,
                  <div
                    key='rmb-h-am'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Amount
                  </div>,
                  <div
                    key='rmb-h-pt'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    % of Total
                  </div>,
                  <div
                    key='rmb-h-gr'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Growth
                  </div>,
                  <div
                    key='rmb-h-dr'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Driver
                  </div>,
                ]}
                rows={rmbRows}
              />

              <TertiaryHeading className='mt-8'>
                Platform Segments Performance
              </TertiaryHeading>
              <TableWithoutPagination
                noData='No data'
                headings={[
                  <div
                    key='psp-h-sg'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Segment
                  </div>,
                  <div
                    key='psp-h-cu'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Customers (FY)
                  </div>,
                  <div
                    key='psp-h-au'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    AUA (Ebn)
                  </div>,
                  <div
                    key='psp-h-gr'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Growth
                  </div>,
                  <div
                    key='psp-h-ni'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Net Inflows (Ebn)
                  </div>,
                  <div
                    key='psp-h-co'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Comments
                  </div>,
                ]}
                rows={pspRows}
              />

              <SubHeading className='mt-8'>Business Model Dynamics</SubHeading>
              <List items={bs.businessModelDynamics || []} />

              <SubHeading className='mt-8'>Competitive Position</SubHeading>
              {competitors.length ? (
                <>
                  <TertiaryHeading>
                    Key Competitors &amp; Market Share
                  </TertiaryHeading>
                  <List
                    items={competitors.map(
                      (c) =>
                        `<span class='font-semibold'>${c.name}</span> — ${c.description}`,
                    )}
                  />
                </>
              ) : null}
              {advantages.length ? (
                <>
                  <TertiaryHeading>Competitive Advantages</TertiaryHeading>
                  <List
                    items={advantages.map(
                      (a) =>
                        `<span class='font-semibold'>${a.title}</span>: ${a.description}`,
                    )}
                  />
                </>
              ) : null}
            </>
          );
        })()}
      </SectionWrapper>
      <SectionWrapper
        heading='7. INTERIM RESULTS & QUARTERLY PERFORMANCE'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceInterimResultsAndQuarterlyPerformanceSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.interimResultsAndQuarterlyPerformance =
                  result.data;
              }),
          );
        }}
      >
        {(() => {
          const interim =
            report.data.report?.interimResultsAndQuarterlyPerformance;
          if (!interim) return <div className='text-sm text-muted-foreground'>No data</div>;

          return (
            <>
              <TertiaryHeading>{interim.title}</TertiaryHeading>

              <TertiaryHeading>Record Financial Performance</TertiaryHeading>
              <TableWithoutPagination
                noData='No data'
                headings={[
                  <div
                    key='irfp-metric'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Metric
                  </div>,
                  <div
                    key='irfp-curr'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Current Year
                  </div>,
                  <div
                    key='irfp-prev'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Previous Year
                  </div>,
                  <div
                    key='irfp-change'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Change
                  </div>,
                  <div
                    key='irfp-margin'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Margin
                  </div>,
                ]}
                rows={
                  interim.recordFinancialPerformance?.map((row, idx) => [
                    <div
                      className='py-[10px] text-sm text-muted-foreground'
                      key={`irfp-metric-${idx}`}
                    >
                      {row.metric}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`irfp-curr-${idx}`}
                    >
                      {row.currentYearValue}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`irfp-prev-${idx}`}
                    >
                      {row.previousYearValue}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`irfp-change-${idx}`}
                    >
                      {row.change}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`irfp-margin-${idx}`}
                    >
                      {row.margin}
                    </div>,
                  ]) || []
                }
              />

              <TertiaryHeading className='mt-8'>Key Positives</TertiaryHeading>
              <List items={interim.keyPositives || []} />

              <TertiaryHeading className='mt-8'>Key Negatives</TertiaryHeading>
              <List items={interim.keyNegatives || []} />

              <TertiaryHeading className='mt-8'>Forward Guidance & Assumptions</TertiaryHeading>
              <SubHeading>
                Management Commentary ({interim.forwardGuidance?.managementCommentary?.ceoName})
              </SubHeading>
              <List
                items={
                  interim.forwardGuidance?.managementCommentary?.quotes || []
                }
              />

              <SubHeading className='mt-4'>Analyst Consensus FY1</SubHeading>
              <List
                items={
                  interim.forwardGuidance?.analystConsensusFY1?.map((row) =>
                    `<span style="font-weight: bold">${row.metric}</span>: ${row.forecastValue} (${row.growth}) — ${row.commentary}`,
                  ) || []
                }
              />
            </>
          );
        })()}
      </SectionWrapper>

      <SectionWrapper
        heading='8. CONTINGENT LIABILITIES & REGULATORY RISKS'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceContingentLiabilitiesAndRegulatoryRiskSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.contingentLiabilitiesAndRegulatoryRisk =
                  result.data;
              }),
          );
        }}
      >
        {(() => {
          const contingent =
            report.data.report?.contingentLiabilitiesAndRegulatoryRisk;
          if (!contingent)
            return <div className='text-sm text-muted-foreground'>No data</div>;

          return (
            <>
              <SubHeading>Balance Sheet Contingencies</SubHeading>
              <TableWithoutPagination
                noData='No data'
                headings={[
                  <div
                    key='bsc-item'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Item
                  </div>,
                  <div
                    key='bsc-amount'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Amount
                  </div>,
                  <div
                    key='bsc-status'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Status
                  </div>,
                  <div
                    key='bsc-risk'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Risk Level
                  </div>,
                  <div
                    key='bsc-impact'
                    className={cn('px-[26px] py-[10px] font-medium')}
                  >
                    Impact
                  </div>,
                ]}
                rows={
                  contingent.balanceSheetContingencies?.map((row, idx) => [
                    <div
                      className='py-[10px] text-sm text-muted-foreground'
                      key={`bsc-item-${idx}`}
                    >
                      {row.item}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`bsc-amount-${idx}`}
                    >
                      {row.amount}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`bsc-status-${idx}`}
                    >
                      {row.status}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`bsc-risk-${idx}`}
                    >
                      {row.riskLevel}
                    </div>,
                    <div
                      className={cn('py-[10px] font-medium')}
                      key={`bsc-impact-${idx}`}
                    >
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

              <SubHeading className='mt-8'>Regulatory Environment</SubHeading>
              <List
                items={
                  contingent.keyRegulatoryConsiderations?.map((row) =>
                    `<span style="font-weight: bold">${row.title}</span>: ${row.description}`,
                  ) || []
                }
              />
            </>
          );
        })()}
      </SectionWrapper>

      <SectionWrapper
        heading='9. CONCLUSION'
        symbol={symbol}
        onEnhanceSection={async (symbol: string, improvementText: string) => {
          const result = await enhanceConclusionAndRecommendationSection(
            symbol,
            improvementText,
          );
          if (!result.okay) throw new Error(result.error.message);
          await queryClient.setQueryData(
            ['report', symbol],
            (oldData: ReportDetailsResponse) =>
              produce(oldData, (draft) => {
                draft.data.report!.conclusionAndRecommendation = result.data;
              }),
          );
        }}
      >
        {(() => {
          const conclusion = report.data.report?.conclusionAndRecommendation;
          if (!conclusion)
            return <div className='text-sm text-muted-foreground'>No data</div>;

          return (
            <>
              <Description>{conclusion.summary}</Description>
              <SubHeading className='mt-6'>Key Strengths</SubHeading>
              <List items={conclusion.strengths || []} />

              <SubHeading className='mt-6'>Valuation</SubHeading>
              <List
                items={[
                  `<span style="font-weight: bold">Base Case</span>: ${conclusion.valuationSummary}`,
                  `<span style="font-weight: bold">Analyst Consensus</span>: ${conclusion.analystConsensus}`,
                ]}
              />

              <SubHeading className='mt-6'>For Investors</SubHeading>
              <List items={conclusion.investorFit || []} />

              <SubHeading className='mt-6'>Entry Strategy</SubHeading>
              <List items={conclusion.entryStrategy || []} />

              <SubHeading className='mt-6'>Key Catalysts for Upside</SubHeading>
              <List items={conclusion.upsideCatalysts || []} />

              <SubHeading className='mt-6'>Key Catalysts for Downside</SubHeading>
              <List items={conclusion.downsideCatalysts || []} />

              <SubHeading className='mt-6'>Recommendation</SubHeading>
              <List
                items={[
                  `<span style="font-weight: bold">Recommendation</span>: ${conclusion.recommendation}`,
                  `<span style="font-weight: bold">Price Target (12-month)</span>: ${conclusion.priceTarget}`,
                  `<span style="font-weight: bold">Expected Return</span>: ${conclusion.expectedReturn}`,
                  `<span style="font-weight: bold">Time Horizon</span>: ${conclusion.timeHorizon}`,
                  `<span style="font-weight: bold">Risk Profile</span>: ${conclusion.riskProfile}`,
                ]}
              />

              <div className='mt-8 border-t pt-6'>
                <Description>
                  <strong>Disclaimer:</strong> {conclusion.disclaimer}
                </Description>
              </div>
            </>
          );
        })()}
      </SectionWrapper>
    </div>
  );
}

export default Report;
