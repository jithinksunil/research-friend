import { Suspense } from 'react';
import Report from './Report';

interface SymbolPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

async function Page({ params }: SymbolPageProps) {
  const { symbol } = await params;

  return (
    <Suspense fallback={<div>Loading....</div>}>
      <Report symbol={symbol} />
    </Suspense>
  );
}

export default Page;
