import { getReportDetails } from '@/lib/server-only/repot';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { message: 'Symbol is required' },
      { status: 400 },
    );
  }

  try {
    const company = await getReportDetails(symbol);
    return NextResponse.json({data:company}, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 },
    );
  }
}
