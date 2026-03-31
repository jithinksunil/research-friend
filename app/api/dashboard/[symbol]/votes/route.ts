import { NextResponse } from 'next/server';
import { registerVote } from '@/app/actions/user/dashboard.actions';
import prisma from '@/prisma';
import { getSession } from '@/server';

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { symbol } = await context.params;
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    return NextResponse.json({ message: 'Symbol is required' }, { status: 400 });
  }

  try {
    const votes = await prisma.vote.findMany({
      where: { company: { symbol: normalizedSymbol } },
      select: { positive: true },
    });

    return NextResponse.json(
      {
        upVotes: votes.filter((vote) => vote.positive).length,
        downVotes: votes.filter((vote) => !vote.positive).length,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to fetch votes',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;
  const body = (await request.json().catch(() => null)) as { vote?: boolean } | null;

  try {
    const result = await registerVote({
      symbol,
      vote: Boolean(body?.vote),
    });

    if (!result.okay) {
      return NextResponse.json(
        {
          message: result.error?.message ?? 'Failed to register vote',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to register vote',
      },
      { status: 500 },
    );
  }
}
