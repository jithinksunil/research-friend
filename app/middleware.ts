// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  console.log({refreshToken,accessToken});
  return NextResponse.next();

}

export const config = {
  matcher: ['/:path*', '/profile/:path*'], // Protect specific routes
};