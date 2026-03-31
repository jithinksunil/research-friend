'use client';

import { useRef, useState } from 'react';
import { Tooltip } from '@mui/material';
import { PrimaryButton } from '@/components/common';

interface DownloadPdfButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  companyName: string;
  symbol: string;
}

interface PrintableDocumentOptions {
  companyName: string;
  reportDate: string;
  reportMarkup: string;
}

function buildPrintableDocument({
  companyName,
  reportDate,
  reportMarkup,
}: PrintableDocumentOptions) {
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${companyName} Report</title>
      ${styles}
      <style>
        @page {
          size: A4;
          margin: 16mm 13mm 18mm;
        }

        :root {
          color-scheme: light;
        }

        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          box-sizing: border-box;
        }

        html,
        body {
          background: #ffffff;
          margin: 0;
          padding: 0;
        }

        body {
          color: #1f2937;
          font-family: "Georgia", "Times New Roman", serif;
          font-size: 11pt;
          line-height: 1.65;
          text-rendering: optimizeLegibility;
        }

        .print-shell {
          width: 100%;
        }

        .print-cover {
          min-height: calc(297mm - 34mm);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          page-break-after: always;
          break-after: page;
        }

        .print-cover::before {
          content: "";
          position: absolute;
          inset: 0;
          background: #ffffff;
          z-index: 0;
        }

        .print-cover > * {
          position: relative;
          z-index: 1;
        }

        .print-cover .print-cover-kicker {
          margin-bottom: 20px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #5f6f86;
        }

        .print-cover img {
          width: 190px;
          height: auto;
          margin-bottom: 34px;
        }

        .print-cover h1 {
          margin: 0 0 18px;
          max-width: 86%;
          font-size: 34px;
          font-weight: 700;
          line-height: 1.15;
          color: #172033;
          letter-spacing: -0.02em;
        }

        .print-cover p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
        }

        .print-cover .print-cover-subtitle {
          max-width: 70%;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 14px;
          color: #667085;
        }

        .print-cover .print-cover-date {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #7b8798;
          margin-bottom: 32px;
        }

        .print-cover .print-cover-divider {
          width: 72px;
          height: 2px;
          margin-bottom: 30px;
          background: linear-gradient(90deg, #1d3557, #aeb8c5);
        }

        .print-cover .print-cover-footer {
          border-top: 1px solid #d9dee5;
          margin-top: 34px;
          padding-top: 18px;
          max-width: 430px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.8;
          color: #6b7280;
        }

        .print-report {
          width: 100%;
        }

        .print-report::before {
          content: "";
          display: block;
          height: 8px;
          margin-bottom: 22px;
          border-top: 3px solid #203047;
          border-bottom: 1px solid #d9dee5;
        }

        .print-report .print-hide {
          display: none !important;
        }

        .print-report .report-print-section {
          break-inside: auto;
          page-break-inside: auto;
          margin-bottom: 30px;
        }

        .print-report .report-print-header {
          break-after: avoid-page;
          page-break-after: avoid;
          align-items: flex-end;
          margin-bottom: 14px !important;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .print-report .report-print-body {
          break-inside: auto;
          page-break-inside: auto;
        }

        .print-report .report-print-separator {
          break-before: avoid-page;
          page-break-before: avoid;
        }

        .print-report h1 {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15px !important;
          font-weight: 800;
          line-height: 1.35;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1d3557;
          margin: 0 0 10px !important;
        }

        .print-report h2 {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px !important;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #1d3557;
          margin: 18px 0 8px !important;
        }

        .print-report h3,
        .print-report h4 {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10.5px !important;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #475569;
          margin: 16px 0 6px !important;
        }

        .print-report p {
          margin: 0 0 12px !important;
          color: #273142;
          text-align: justify;
        }

        .print-report ul,
        .print-report ol {
          margin: 0 0 14px 0;
          padding-left: 18px;
        }

        .print-report li {
          margin-bottom: 6px;
          color: #273142;
        }

        .print-report strong,
        .print-report b {
          color: #172033;
        }

        .print-report table {
          width: 100%;
          min-width: 0 !important;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: 0;
          margin: 10px 0 18px;
          border-top: 1px solid #ece8df;
          border-left: 1px solid #ece8df;
          border-right: 1px solid #ece8df;
          border-bottom: 1px solid #e2dccf;
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9.5px;
        }

        .print-report thead {
          display: table-header-group;
        }

        .print-report .overflow-x-auto {
          overflow: visible !important;
        }

        .print-report tfoot {
          display: table-footer-group;
        }

        .print-report tr,
        .print-report td,
        .print-report th,
        .print-report img,
        .print-report svg {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .print-report img,
        .print-report svg {
          max-width: 100%;
        }

        .print-report th {
          padding: 0 !important;
          background: #f2efe9;
          color: #8c6b3f;
          font-size: 9px !important;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid #e0dbd0;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .print-report td {
          padding: 0 !important;
          vertical-align: top;
          color: #344054;
          border-bottom: 1px solid #f1ede6;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .print-report th > div,
        .print-report td > div {
          display: block;
          padding: 9px 16px !important;
          text-align: left;
        }

        .print-report tbody tr {
          background: #ffffff;
        }

        .print-report tbody tr:last-child td {
          border-bottom: 1px solid #e2dccf;
        }

        .print-report .border-b {
          border-color: #e5e7eb !important;
        }

        .print-report .text-muted-foreground {
          color: #6b7280 !important;
        }

        @media screen {
          body {
            background:
              radial-gradient(circle at top, rgba(223, 212, 192, 0.4), transparent 35%),
              linear-gradient(180deg, #f5f1ea 0%, #ebe5db 100%);
            padding: 32px 0;
          }

          .print-shell {
            width: 210mm;
            margin: 0 auto;
            background: #ffffff;
            box-shadow:
              0 24px 60px rgba(15, 23, 42, 0.14),
              0 2px 8px rgba(15, 23, 42, 0.08);
            padding: 16mm 13mm 18mm;
          }

          .print-cover {
            min-height: calc(297mm - 34mm);
          }
        }
      </style>
    </head>
    <body>
      <main class="print-shell">
        <section class="print-cover">
          <p class="print-cover-kicker">Equity Research Report</p>
          <img src="/assets/abcx_logo.svg" alt="ABCX logo" />
          <h1>${companyName}</h1>
          <p class="print-cover-subtitle">Comprehensive Investment Analysis & Valuation Report</p>
          <p class="print-cover-date">Report Date: ${reportDate}</p>
          <div class="print-cover-divider"></div>
          <p class="print-cover-footer">
            Powered by AI.Fred Research Assistant — ABCX<br />
            This report is generated for informational purposes only and does not constitute financial advice.
          </p>
        </section>
        <section class="print-report">${reportMarkup}</section>
      </main>
    </body>
  </html>`;
}

async function waitForPrintWindow(printWindow: Window) {
  const images = Array.from(printWindow.document.images);

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );

  if ('fonts' in printWindow.document) {
    await printWindow.document.fonts.ready;
  }
}

export function DownloadPdfButton({ targetRef, companyName, symbol }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(false);

  const handleDownload = async () => {
    if (!targetRef.current || isGenerating) return;

    setIsGenerating(true);
    abortRef.current = false;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (abortRef.current) return;

      printWindow.document.open();
      printWindow.document.write(
        buildPrintableDocument({
          companyName,
          reportDate,
          reportMarkup: targetRef.current.innerHTML,
        }),
      );
      printWindow.document.close();

      await waitForPrintWindow(printWindow);

      printWindow.document.title = `${companyName.replace(/\s+/g, '_')}_${symbol}_Report`;
      const closeWindow = () => {
        printWindow.close();
      };

      printWindow.addEventListener('afterprint', closeWindow, { once: true });
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Tooltip title={isGenerating ? 'Generating PDF...' : 'Download Report as PDF'}>
      <PrimaryButton type="button" onClick={handleDownload} isDisabled={isGenerating}>
        <span className="hidden sm:inline">
          {isGenerating ? 'Generating...' : 'Download Report'}
        </span>
      </PrimaryButton>
    </Tooltip>
  );
}
