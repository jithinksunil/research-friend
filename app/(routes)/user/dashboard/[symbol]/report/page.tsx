import { Heading } from './Heading';
import { Description } from './Description';
import { SubHeading } from './SubHeading';
import { TertiaryHeading } from './TertiaryHeading';
import { List } from './List';
import { SectionSeparator } from './SectionSeparator';
import { cn, formatDate } from '@/lib';
import { getReport } from '@/app/actions/user';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
interface PageProps {
  params: Promise<{
    symbol: string;
  }>;
}
async function page({ params }: PageProps) {
  const { symbol } = await params;
  const report = await getReport(symbol);
  if (!report.okay) {
    throw new Error(report.error.message);
  }
  return (
    <div className='py-8'>
      <Heading className='!text-3xl'>{report.data.companyName}</Heading>
      <SubHeading className='!mb-1'>
        Comprehensive Investment Analysis & Valuation Report
      </SubHeading>
      <TertiaryHeading className='!mb-8'>
        Date: {formatDate(new Date().toISOString(), 'January 1, 2000')}
      </TertiaryHeading>

      <Heading>EXECUTIVE SUMMARY</Heading>
      <Description>{report.data.report?.executiveSummary?.summary}</Description>
      <SubHeading>Investment Thesis</SubHeading>
      <List
        items={[
          `<span style='font-weight: bold' >Positives</span>: ${report.data.report?.executiveSummary?.positive}`,
          `<span style='font-weight: bold' >Risks</span>: ${report.data.report?.executiveSummary?.risk}`,
          `<span style='font-weight: bold' >Current Price: ${report.data.report?.executiveSummary?.currentPrice} | DCF Fair Value: ${report.data.report?.executiveSummary?.dcfFairValue} | Analyst Consensus: ${report.data.report?.executiveSummary?.analystConsensus} | Upside: ${report.data.report?.executiveSummary?.upside}</span>`,
        ]}
      />
      <SectionSeparator />
      <Heading>1. COMPANY OVERVIEW & STOCK METRICS</Heading>
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

            <div key={`col2-${index}`} className={cn('py-[10px] font-medium')}>
              {metric.value}
            </div>,
            <div key={`col3-${index}`} className={cn('py-[10px] font-medium')}>
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
      <SectionSeparator />
      <Heading>2. SHAREHOLDER STRUCTURE & INSIDER ACTIVITY</Heading>
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

            <div key={`col2-${index}`} className={cn('py-[10px] font-medium')}>
              {shareHolder.ownership}
            </div>,
            <div key={`col3-${index}`} className={cn('py-[10px] font-medium')}>
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
          report.data.report?.shareHolderStructure?.keyInsiderObservations || []
        }
      />
      <SectionSeparator />
      <Heading>3. ANALYST RECOMMENDATIONS & PRICE TARGETS</Heading>
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
            <div key={`h3`} className={cn('px-[26px] py-[10px] font-medium')}>
              Trend
            </div>,
          ]}
          rows={[
            ...(
              report.data.report?.analystRecommendation?.currentConsensus || []
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
                key={`col3-${index}`}
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
      {report.data.report?.analystRecommendation?.recentAnalystViews.length ? (
        <>
          <SubHeading>Recent Analyst Views</SubHeading>
          <List
            items={report.data.report?.analystRecommendation.recentAnalystViews}
          />
        </>
      ) : null}

      <SectionSeparator />
      <Heading>4. EQUITY VALUATION & DCF ANALYSIS</Heading>
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
            byYear[y.financialYear] = (y.projections || []).map((p: any) => ({
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
      <SectionSeparator />
      <Heading>5. FINANCIAL STATEMENTS ANALYSIS</Heading>

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
          const order = [
            'FY20',
            'FY21',
            'FY22',
            'FY23',
            'FY24',
            'FY25',
            'FY25_EST',
          ];
          const label: Record<string, string> = {
            FY20: 'FY20',
            FY21: 'FY21',
            FY22: 'FY22',
            FY23: 'FY23',
            FY24: 'FY24',
            FY25: 'FY25',
            FY25_EST: 'FY25 (est)',
          };
          return order
            .map((fy) => rows.find((r: any) => r.fiscalYear === fy))
            .filter(Boolean)
            .slice(0, 6)
            .map((r: any, idx: number) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`ist-fy-${idx}`}
              >
                {label[r.fiscalYear]}
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
          report.data.report?.financialStatementAnalyasis?.keyObservations || []
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
          const order = [
            'FY20',
            'FY21',
            'FY22',
            'FY23',
            'FY24',
            'FY25',
            'FY25_EST',
          ];
          const label: Record<string, string> = {
            FY20: 'FY20',
            FY21: 'FY21',
            FY22: 'FY22',
            FY23: 'FY23',
            FY24: 'FY24',
            FY25: 'FY25',
            FY25_EST: 'FY25 (est)',
          };
          return order
            .map((fy) => rows.find((r: any) => r.fiscalYear === fy))
            .filter(Boolean)
            .slice(0, 6)
            .map((r: any, idx: number) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`bss-fy-${idx}`}
              >
                {label[r.fiscalYear]}
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
          const order = [
            'FY20',
            'FY21',
            'FY22',
            'FY23',
            'FY24',
            'FY25',
            'FY25_EST',
          ];
          const label: Record<string, string> = {
            FY20: 'FY20',
            FY21: 'FY21',
            FY22: 'FY22',
            FY23: 'FY23',
            FY24: 'FY24',
            FY25: 'FY25',
            FY25_EST: 'FY25 (est)',
          };
          return order
            .map((fy) => rows.find((r: any) => r.fiscalYear === fy))
            .filter(Boolean)
            .slice(0, 6)
            .map((r: any, idx: number) => [
              <div
                className='py-[10px] text-sm text-muted-foreground'
                key={`cfa-fy-${idx}`}
              >
                {label[r.fiscalYear]}
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
          report.data.report?.financialStatementAnalyasis?.fcfQualityAnalysis ||
          []
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
              const row = ratioRows.find((r: any) => r.metric === key);
              const vByYear: Record<string, string> = {};
              (row?.values || []).forEach(
                (v: any) => (vByYear[v.year] = v.value),
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
      <SectionSeparator />
    </div>
  );
}

export default page;
