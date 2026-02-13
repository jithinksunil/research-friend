'use client';

import { getReport } from '@/app/actions/user';
import { useEffect, useState } from 'react';

export const ExecutiveSection = () => {
  const [data, setData] = useState('');
  useEffect(() => {
    const handleFetch = async () => {
      const report = await getReport('AAPL');
      setData(JSON.stringify(report));
    };
    handleFetch();
  }, []);
  return <div>{data ? JSON.stringify(data) : 'loading...'}</div>;
};
