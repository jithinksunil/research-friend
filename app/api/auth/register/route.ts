import { ROLES } from '@/app/generated/prisma/enums';
import { convertToErrorInstance } from '@/lib/helper';
import prisma from '@/prisma';
import { issueTokensForUser, setAccessTokenCookie } from '@/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { message: 'First name, email and password are required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || undefined,
        email,
        password,
        role: ROLES.USER,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    const { accessToken, refreshToken, expires_at } = await issueTokensForUser({
      userId: user.id,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        data: {
          user,
          refreshToken,
          expires_at,
        },
      },
      { status: 201 },
    );

    setAccessTokenCookie({ response, accessToken });
    return response;
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    const parsed = convertToErrorInstance(error);
    return NextResponse.json({ message: parsed.message }, { status: 500 });
  }
}
