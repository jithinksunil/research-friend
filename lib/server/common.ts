import 'server-only';
import { ROLES } from '@/app/generated/prisma/enums';
import { ServerActionResult  } from '@/interfaces';
import { forbiddenMessage, unauthorizedMessage } from '../constant';
import { redirect } from 'next/navigation';
import { getSession } from './auth';

export function requireRBAC(role: ROLES) {
  return function <Args extends any[], T>(
    action: (...args: Args) => Promise<ServerActionResult<T>>,
  ) {
    return async (...args: Args): Promise<ServerActionResult<T>> => {
      const user = await getSession();
      if (!user) {
        throw new Error(unauthorizedMessage);
      }
      if (user.role !== role) {
        throw new Error(forbiddenMessage);
      }
      return await action(...args);
    };
  };
}

export async function requirePageLevelRBAC(role: ROLES) {
  let user = await getSession();
  if (!user) {
    return redirect(`/auth/signup?message=${unauthorizedMessage}`);
  }
  if (user?.role !== role) {
    return redirect(`/auth/signup?message=${forbiddenMessage}`);
  }
}
