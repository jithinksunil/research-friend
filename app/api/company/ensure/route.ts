import { NextRequest, NextResponse } from 'next/server';
import { ensureCompanyFromSearch } from '@/app/actions/user/search.actions';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as { symbol?: string } | null;

  try {
    const result = await ensureCompanyFromSearch(body?.symbol ?? '');

    if (!result.okay) {
      return NextResponse.json(
        {
          message: result.error?.message ?? 'Failed to ensure company',
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to ensure company',
      },
      { status: 500 },
    );
  }
}
