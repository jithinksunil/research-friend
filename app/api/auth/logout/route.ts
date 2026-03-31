import { clearAccessTokenCookie } from '@/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ data: { okay: true } }, { status: 200 });
  clearAccessTokenCookie({ response });
  return response;
}
