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
      <Description>{report.data.executiveSummaries?.summary}</Description>
      <SubHeading>Investment Thesis</SubHeading>
      <List
        items={[
          `<span style='font-weight: bold' >Positives</span>: ${report.data.executiveSummaries?.positive}`,
          `<span style='font-weight: bold' >Risks</span>: ${report.data.executiveSummaries?.risk}`,
          `<span style='font-weight: bold' >Current Price: ${report.data.executiveSummaries?.currentPrice} | DCF Fair Value: ${report.data.executiveSummaries?.dcfFairValue} | Analyst Consensus: ${report.data.executiveSummaries?.analystConsensus} | Upside: ${report.data.executiveSummaries?.upside}</span>`,
        ]}
      />
      <SectionSeparator />
      <Heading>1. COMPANY OVERVIEW & STOCK METRICS</Heading>
      <SubHeading >Key Statistics</SubHeading>

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
        rows={report.data.overviewAndStockMetrics?.stockMetrics.map(
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
        {report.data.overviewAndStockMetrics?.fiftyTwoWeekPerformance}
      </Description>
      <SectionSeparator />
    </div>
  );
}

export default page;
