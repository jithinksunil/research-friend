import 'server-only';
import { SessionPayload } from '@/interfaces';
import {
  ACCESS_TOKEN_EXPIRATION_S,
  REFRESH_TOKEN_EXPIRATION_S,
  unauthorizedMessage,
} from '../constant';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import { createJWTToken, verifyJWTToken } from '../helper';
import { prisma } from '../prisma';

export async function getSession(): Promise<SessionPayload | null> {
  const session = (await auth()) as unknown as
    | (Session & { accessToken: string })
    | null;
  if (!session || !session?.user) return null;
  return {
    role: (session.user as any).role,
    userId: (session.user as any).id,
  };
}

export async function refresh(token: string) {
  const payload = await verifyJWTToken(
    token,
    process.env.REFRESH_TOKEN_SECRET!,
  );
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });
  if (!user) throw new Error(unauthorizedMessage);
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
    expirationTime: REFRESH_TOKEN_EXPIRATION_S,
  });
  return { accessToken, refreshToken };
}
