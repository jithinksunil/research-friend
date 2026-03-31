import { NextRequest, NextResponse } from 'next/server';
import { searchForCompanies } from '@/app/actions/user/search.actions';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.get('query') ?? '';

  try {
    const result = await searchForCompanies(query);

    if (!result.okay) {
      return NextResponse.json(
        {
          message: result.error?.message ?? 'Failed to search companies',
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
        message: error instanceof Error ? error.message : 'Failed to search companies',
      },
      { status: 500 },
    );
  }
}
