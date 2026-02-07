'use client';

import { PrimaryButton } from '../common';
import { useRouter } from 'next/navigation';

export const ViewDetailedReport = ({ symbol }: { symbol: string }) => {
  const { push } = useRouter();

  return (
    <PrimaryButton
      onClick={() => push(`/user/dashboard/${symbol}/report`)}
      type='button'
    >
      View Detailed Report
    </PrimaryButton>
  );
};
