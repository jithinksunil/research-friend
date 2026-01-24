'use server';
import { ServerActionResult } from '@/interfaces';
import {
  ACCESS_TOKEN_EXPIRATION_S,
  convertToErrorInstance,
  createJWTToken,
  REFRESH_TOKEN_EXPIRATION_S,
} from '@/lib';
import { ROLES } from '@/app/generated/prisma/enums';
import prisma from '@/prisma';
import { signIn } from '@/auth';

export const signup = async ({
  email,
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string | undefined;
  email: string;
}): Promise<
  ServerActionResult<null>
> => {
  try {
    const user = await prisma.user.create({
      data: { email, firstName, lastName, role: ROLES.USER,password:'123456' },
      select: { email: true, id: true, role: true },
    });
    const res = await signIn('credentials', { email:user.email, password:'123456', redirect: false });
    if (res.error) throw new Error(res.error);
    
    return {
      okay: true,
      data: null,
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