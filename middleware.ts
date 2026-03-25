import { forbiddenMessage, unauthorizedMessage } from '@/lib/constant';
import { verifyJWTToken } from '@/lib/helper';
import { TOKEN_NAMES } from '@/lib/enum';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedPath = (pathname: string) =>
  pathname.startsWith('/user') || pathname.startsWith('/admin');

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const accessToken = request.cookies.get(TOKEN_NAMES.ACCESS_TOKEN)?.value;
  let session: { userId: string; role: string } | null = null;

  if (accessToken) {
    try {
      const payload = await verifyJWTToken(accessToken, process.env.ACCESS_TOKEN_SECRET!);
      session = {
        userId: payload.userId,
        role: payload.role,
      };
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
    } catch {
      session = null;
    }
  }

  const pathname = request.nextUrl.pathname;
  if (isProtectedPath(pathname) && !session) {
    const loginUrl = new URL(`/?message=${encodeURIComponent(unauthorizedMessage)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/admin') && session?.role !== 'ADMIN') {
    const forbiddenUrl = new URL(`/?message=${encodeURIComponent(forbiddenMessage)}`, request.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
