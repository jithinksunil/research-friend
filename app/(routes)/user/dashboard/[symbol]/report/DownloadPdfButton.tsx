'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PictureAsPdf } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

interface DownloadPdfButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  companyName: string;
  symbol: string;
}

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const MARGIN_PT = 40;
const FOOTER_HEIGHT_PT = 20;
const CONTENT_WIDTH_PT = A4_WIDTH_PT - MARGIN_PT * 2;
const CONTENT_HEIGHT_PT = A4_HEIGHT_PT - MARGIN_PT * 2 - FOOTER_HEIGHT_PT;

async function loadLogoAsPngDataUrl(): Promise<string> {
  const resp = await fetch('/assets/abcx_logo.svg');
  const svgText = await resp.text();
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cvs = document.createElement('canvas');
      const scale = 3;
      cvs.width = img.width * scale;
      cvs.height = img.height * scale;
      const ctx = cvs.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      resolve(cvs.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load logo'));
    img.src = svgDataUrl;
  });
}

function addFooter(pdf: jsPDF, pageNum: number, totalPages: number) {
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  const footerText = `ABCX — AI.Fred Research Assistant | Page ${pageNum} of ${totalPages}`;
  pdf.text(footerText, A4_WIDTH_PT / 2, A4_HEIGHT_PT - 20, { align: 'center' });
}

async function addCoverPage(pdf: jsPDF, companyName: string, logoPngDataUrl: string) {
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Draw logo
  const logoWidth = 140;
  const logoHeight = 40;
  pdf.addImage(logoPngDataUrl, 'PNG', (A4_WIDTH_PT - logoWidth) / 2, 120, logoWidth, logoHeight);

  // Company name
  pdf.setFontSize(28);
  pdf.setTextColor(30, 30, 30);
  pdf.text(companyName, A4_WIDTH_PT / 2, 240, { align: 'center' });

  // Report title
  pdf.setFontSize(16);
  pdf.setTextColor(80, 80, 80);
  pdf.text('Comprehensive Investment Analysis & Valuation Report', A4_WIDTH_PT / 2, 275, {
    align: 'center',
  });

  // Date
  pdf.setFontSize(12);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Report Date: ${reportDate}`, A4_WIDTH_PT / 2, 310, {
    align: 'center',
  });

  // Horizontal rule
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN_PT, 340, A4_WIDTH_PT - MARGIN_PT, 340);

  // Powered by line
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Powered by AI.Fred Research Assistant — ABCX', A4_WIDTH_PT / 2, A4_HEIGHT_PT - 80, {
    align: 'center',
  });

  // Disclaimer
  pdf.setFontSize(7);
  pdf.setTextColor(170, 170, 170);
  pdf.text(
    'This report is generated for informational purposes only and does not constitute financial advice.',
    A4_WIDTH_PT / 2,
    A4_HEIGHT_PT - 60,
    { align: 'center' },
  );
}

export function DownloadPdfButton({ targetRef, companyName, symbol }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(false);

  const handleDownload = async () => {
    if (!targetRef.current || isGenerating) return;

    setIsGenerating(true);
    abortRef.current = false;

    try {
      const logoDataUrl = await loadLogoAsPngDataUrl();

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      if (abortRef.current) return;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // Cover page
      await addCoverPage(pdf, companyName, logoDataUrl);

      // Calculate content pages
      const imgWidth = CONTENT_WIDTH_PT;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageContentHeight = CONTENT_HEIGHT_PT;
      const totalContentPages = Math.ceil(imgHeight / pageContentHeight);
      const totalPages = totalContentPages + 1; // +1 for cover

      // Footer on cover page
      addFooter(pdf, 1, totalPages);

      // Content pages
      for (let i = 0; i < totalContentPages; i++) {
        pdf.addPage();

        const srcY = i * ((canvas.height * pageContentHeight) / imgHeight);
        const srcH = (canvas.height * pageContentHeight) / imgHeight;
        const actualSrcH = Math.min(srcH, canvas.height - srcY);
        const drawHeight = (actualSrcH / srcH) * pageContentHeight;

        // Create a sub-canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = actualSrcH;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, canvas.width, actualSrcH, 0, 0, canvas.width, actualSrcH);
        }

        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          MARGIN_PT,
          MARGIN_PT,
          imgWidth,
          drawHeight,
        );

        addFooter(pdf, i + 2, totalPages);
      }

      pdf.save(`${companyName.replace(/\s+/g, '_')}_${symbol}_Report.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Tooltip title={isGenerating ? 'Generating PDF...' : 'Download Report as PDF'}>
      <button
        id="download-pdf-button"
        onClick={handleDownload}
        disabled={isGenerating}
        className={`
          outline-none bg-[#F2F2F2] hover:cursor-pointer rounded-md px-3 py-1.5
          active:scale-95 flex items-center justify-center gap-1.5
          text-sm font-medium text-gray-700 hover:bg-gray-200
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
        `}
      >
        <PictureAsPdf
          className={`text-[18px]! ${isGenerating ? 'text-gray-400 animate-pulse' : 'text-[#d32f2f]'}`}
        />
        <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download PDF'}</span>
      </button>
    </Tooltip>
  );
}
