import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { getDashboardData } from '@/server';

export async function GET(_request: NextRequest, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    return NextResponse.json({ message: 'Symbol is required' }, { status: 400 });
  }

  try {
    await prisma.company.upsert({
      where: { symbol: normalizedSymbol },
      update: {},
      create: { symbol: normalizedSymbol },
      select: { id: true },
    });
    const dashboardData = await getDashboardData(normalizedSymbol);

    return NextResponse.json(dashboardData, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      },
      { status: 500 },
    );
  }
}
