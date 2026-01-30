'use client';

import { useState } from 'react';
import { PrimaryButton } from '../common';
import { toastMessage } from '@/lib';

export const DownloadReportButton = ({
  companyName,
  symbol,
  isDummy,
}: {
  companyName: string;
  symbol: string;
  isDummy?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  async function handleDownloadReport(companyName: string, symbol: string,isDummy?: boolean) {
    setLoading(true);
    fetch(`/api/report?companyName=${companyName}&symbol=${symbol}&isDummy=${isDummy}`, {
      method: 'GET',
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to download report');
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${companyName}_report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        toastMessage.error(err?.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return (
    <PrimaryButton
      onClick={() => handleDownloadReport(companyName, symbol,isDummy)}
      type='button'
      isLoading={loading}
    >
      Download
    </PrimaryButton>
  );
};
