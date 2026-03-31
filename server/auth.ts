import 'server-only';
import { ROLES } from '@/app/generated/prisma/enums';
import { TOKEN_NAMES } from '@/lib/enum';
import { SessionPayload } from '@/interfaces';
import prisma from '@/prisma';
import {
  ACCESS_TOKEN_EXPIRATION_S,
  createJWTToken,
  REFRESH_TOKEN_EXPIRATION_S,
  unauthorizedMessage,
  verifyJWTToken,
} from '@/lib';
import { cookies, headers } from 'next/headers';

const isClosedConnectionError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const maybeCode = (error as { code?: string }).code;
  if (maybeCode === 'P1017') return true;
  return /server has closed the connection|connection closed/i.test(error.message);
};

const withPrismaReconnectRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const shouldRetry = isClosedConnectionError(error) && attempt < maxAttempts;
      if (!shouldRetry) throw error;

      await prisma.$disconnect();
      await prisma.$connect();

      await new Promise((resolve) => {
        setTimeout(resolve, 100 * attempt);
      });
    }
  }

  throw new Error('Prisma reconnection retries exhausted');
};

export async function getSession(): Promise<SessionPayload | null> {
  const requestHeaders = await headers();
  const userIdHeader = requestHeaders.get('x-user-id');
  const roleHeader = requestHeaders.get('x-user-role');
  if (userIdHeader && roleHeader) {
    return {
      userId: userIdHeader,
      role: roleHeader as ROLES,
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(TOKEN_NAMES.ACCESS_TOKEN)?.value;
  if (!accessToken) return null;

  try {
    return await verifyJWTToken({
      token: accessToken,
      secret: process.env.ACCESS_TOKEN_SECRET!,
    });
  } catch {
    return null;
  }
}

export async function issueTokensForUser({
  userId,
  role,
}: {
  userId: string;
  role: ROLES;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  expires_at: number;
}> {
  const accessToken = await createJWTToken({
    userId,
    role,
    secret: process.env.ACCESS_TOKEN_SECRET!,
    expirationTime: ACCESS_TOKEN_EXPIRATION_S,
  });
  const refreshToken = await createJWTToken({
    userId,
    role,
    secret: process.env.REFRESH_TOKEN_SECRET!,
    expirationTime: REFRESH_TOKEN_EXPIRATION_S,
  });
  return {
    accessToken,
    refreshToken,
    expires_at: Date.now() + ACCESS_TOKEN_EXPIRATION_S * 1000,
  };
}

export async function refresh({ token }: { token: string }): Promise<{
  accessToken: string;
  refreshToken: string;
  expires_at: number;
}> {
  const payload = await verifyJWTToken({
    token,
    secret: process.env.REFRESH_TOKEN_SECRET!,
  });
  const user = await withPrismaReconnectRetry(() =>
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    }),
  );
  if (!user) throw new Error(unauthorizedMessage);
  return await issueTokensForUser({ userId: user.id, role: user.role });
}

export const signinUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{
  id: string;
  email: string;
  role: ROLES;
  accessToken: string;
  refreshToken: string;
  expires_at: number;
}> => {
  const user = await withPrismaReconnectRetry(() =>
    prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, password: true },
    }),
  );
  if (!user) throw new Error('Not found');
  if (user.password !== password) throw new Error('Invalid credentials');
  const { accessToken, refreshToken, expires_at } = await issueTokensForUser({
    userId: user.id,
    role: user.role,
  });
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
    expires_at,
  };
};
