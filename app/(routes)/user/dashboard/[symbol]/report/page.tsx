import { getReport } from '@/app/actions/user';
import { Suspense } from 'react';
import Report from './Report';

interface PageProps {
  params: Promise<{
    symbol: string;
  }>;
}

async function Page({ params }: PageProps) {
  const { symbol } = await params;
  const report = await getReport(symbol);
  if (!report.okay) {
    throw new Error(report.error.message);
  }
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <Report symbol={symbol} report={report} />  
    </Suspense>
  );
}

export default Page;
