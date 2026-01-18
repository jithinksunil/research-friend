'use server';
import prisma from '@/lib/prisma';
import { ServerActionResult } from '@/interfaces';
import {
  ACCESS_TOKEN_EXPIRATION_S,
  convertToErrorInstance,
  createJWTToken,
  forbiddenMessage,
  getSession,
  REFRESH_TOKEN_EXPIRATION_S,
  unauthorizedMessage,
} from '@/lib';
import { ROLES } from '@/app/generated/prisma/enums';
import { redirect } from 'next/navigation';
import { signIn } from 'next-auth/react';

export const signup = async ({
  email,
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string | undefined;
  email: string;
}): Promise<
  ServerActionResult<{
    user: { role: ROLES; userId: string; email: string };
    tokens: { refreshToken: string; accessToken: string };
  }>
> => {
  try {
    const user = await prisma.user.create({
      data: { email, firstName, lastName, role: ROLES.USER },
      select: { email: true, id: true, role: true },
    });
    const accessToken = await createJWTToken({
      userId: user.id,
      role: user.role,
      secret: process.env.ACCESS_TOKEN_SECRET!,
      expirationTime: ACCESS_TOKEN_EXPIRATION_S,
    });
    const refreshToken = await createJWTToken({
      userId: user.id,
      role: user.role,
      secret: process.env.REFRESH_TOKEN_SECRET!,
      expirationTime: REFRESH_TOKEN_EXPIRATION_S, // 30 days
    });
    return {
      okay: true,
      data: {
        user: { role: user.role, userId: user.id, email: user.email },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    };
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return {
        okay: false,
        error: new Error('Email already exists'),
      };
    }
    return {
      okay: false,
      error: convertToErrorInstance(error),
    };
  }
};
