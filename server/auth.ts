import 'server-only';
import { SessionPayload } from '@/interfaces';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import prisma from '@/prisma';
import {
  ACCESS_TOKEN_EXPIRATION_S,
  createJWTToken,
  REFRESH_TOKEN_EXPIRATION_S,
  unauthorizedMessage,
  verifyJWTToken,
} from '@/lib';

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
  return {
    accessToken,
    refreshToken,
    expires_at: Date.now() + ACCESS_TOKEN_EXPIRATION_S * 1000,
  };
}

export const signinUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, password: true },
  });
  if (!user) throw new Error('Not found');
  if (user.password !== password) throw new Error('Invalid credentials');
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
    id: user.id,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
    expires_at: Date.now() + ACCESS_TOKEN_EXPIRATION_S * 1000,
  };
};
