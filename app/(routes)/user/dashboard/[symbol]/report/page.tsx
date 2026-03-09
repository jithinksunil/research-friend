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
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <Report symbol={symbol}/>  
    </Suspense>
  );
}

export default Page;
