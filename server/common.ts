import 'server-only';
import { ROLES } from '@/app/generated/prisma/enums';
import { ServerActionResult } from '@/interfaces';
import { redirect } from 'next/navigation';
import { getSession } from './auth';
import { forbiddenMessage, unauthorizedMessage } from '@/lib';

export function requireRBAC(role: ROLES) {
  return function <T>(
    action: (...args: any) => Promise<ServerActionResult<T>>,
  ) {
    return async (...args: any): Promise<ServerActionResult<T>> => {
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
  const user = await getSession();
  if (!user) {
    return redirect(`/?message=${unauthorizedMessage}`);
  }
  if (user?.role !== role) {
    return redirect(`/?message=${forbiddenMessage}`);
  }
}
