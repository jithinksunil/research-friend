import { NextRequest, NextResponse } from 'next/server';
import { convertToErrorInstance } from '@/lib/helper';
import { setAccessTokenCookie, signinUser } from '@/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const {
      id,
      role,
      email: userEmail,
      accessToken,
      refreshToken,
      expires_at,
    } = await signinUser({
      email,
      password,
    });

    const response = NextResponse.json(
      {
        data: {
          user: { id, role, email: userEmail },
          refreshToken,
          expires_at,
        },
      },
      { status: 200 },
    );

    setAccessTokenCookie({ response, accessToken });
    return response;
  } catch (error) {
    const parsed = convertToErrorInstance(error);
    const isAuthError = parsed.message === 'Invalid credentials' || parsed.message === 'Not found';
    return NextResponse.json(
      { message: isAuthError ? 'Invalid credentials' : parsed.message },
      { status: isAuthError ? 401 : 500 },
    );
  }
}
