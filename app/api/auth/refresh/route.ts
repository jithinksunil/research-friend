import { unauthorizedMessage } from '@/lib/constant';
import { convertToErrorInstance } from '@/lib/helper';
import { refresh, setAccessTokenCookie } from '@/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const refreshToken = typeof body?.refreshToken === 'string' ? body.refreshToken : '';

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token is required' }, { status: 400 });
    }

    const {
      accessToken,
      refreshToken: rotatedRefreshToken,
      expires_at,
    } = await refresh({ token: refreshToken });
    const response = NextResponse.json(
      {
        data: {
          refreshToken: rotatedRefreshToken,
          expires_at,
        },
      },
      { status: 200 },
    );
    setAccessTokenCookie({ response, accessToken });
    return response;
  } catch (error) {
    const parsed = convertToErrorInstance(error);
    const isUnauthorized = parsed.message === unauthorizedMessage;
    return NextResponse.json(
      { message: isUnauthorized ? unauthorizedMessage : parsed.message },
      { status: isUnauthorized ? 401 : 500 },
    );
  }
}
