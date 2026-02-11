import { Heading } from './Heading';
import { Description } from './Description';
import { SubHeading } from './SubHeading';
import { TertiaryHeading } from './TertiaryHeading';
import { List } from './List';
import { SectionSeparator } from './SectionSeparator';
import { formatDate } from '@/lib';
import { getReport } from '@/app/actions/user';
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
      <SubHeading>
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
          `Positive: ${report.data.executiveSummaries?.positive}`,
          `Risks: ${report.data.executiveSummaries?.risk}`,
          `Current Price: ${report.data.executiveSummaries?.currentPrice} | DCF Fair Value: ${report.data.executiveSummaries?.dcfFairValue} | Analyst Consensus: ${report.data.executiveSummaries?.analystConsensus} | Upside: ${report.data.executiveSummaries?.upside}`,
        ]}
      />
      <SectionSeparator />
    </div>
  );
}

export default page;
