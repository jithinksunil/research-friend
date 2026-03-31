import 'server-only';
import { ACCESS_TOKEN_EXPIRATION_S } from '@/lib';
import { TOKEN_NAMES } from '@/lib/enum';
import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

export function setAccessTokenCookie({
  response,
  accessToken,
}: {
  response: NextResponse;
  accessToken: string;
}): void {
  response.cookies.set(TOKEN_NAMES.ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_EXPIRATION_S,
  });
}

export function clearAccessTokenCookie({ response }: { response: NextResponse }): void {
  response.cookies.set(TOKEN_NAMES.ACCESS_TOKEN, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
