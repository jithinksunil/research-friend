import { ReportSectionKey } from '@/types';
import { REPORT_SECTION_KEYS, getOrGenerateReportSection } from '@/lib/server-only/report';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ symbol: string; sectionKey: string }> },
) {
  const { symbol, sectionKey } = await context.params;

  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    return NextResponse.json({ message: 'Symbol is required' }, { status: 400 });
  }

  if (!(REPORT_SECTION_KEYS as readonly string[]).includes(sectionKey)) {
    return NextResponse.json({ message: `Invalid section key: ${sectionKey}` }, { status: 400 });
  }

  try {
    const data = await getOrGenerateReportSection(normalizedSymbol, sectionKey as ReportSectionKey);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to load section',
      },
      { status: 500 },
    );
  }
}
