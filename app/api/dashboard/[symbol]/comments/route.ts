import { NextResponse } from 'next/server';
import { createCompanyComment, listCompanyComments } from '@/server/comments';

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;

  try {
    const comments = await listCompanyComments(symbol);
    return NextResponse.json({ data: comments }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments';
    return NextResponse.json({ message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;

  try {
    const body = (await request.json().catch(() => null)) as { text?: string } | null;
    const comment = await createCompanyComment(symbol, body?.text ?? '');
    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    return NextResponse.json({ message }, { status: message === 'Unauthorized' ? 401 : 400 });
  }
}
