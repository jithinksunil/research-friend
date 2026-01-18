import { ROLES } from '@/app/generated/prisma/enums';
import { SessionPayload } from '@/interfaces';
import { jwtVerify, SignJWT } from 'jose';

export function convertToErrorInstance(
  unknownError: unknown,
  fallbackMessage = 'Unknown error'
): Error {
  try {
    if (unknownError instanceof Error) return unknownError;
    if (typeof unknownError === 'string') return new Error(unknownError);
    if (typeof unknownError === 'object' && unknownError !== null)
      return new Error(JSON.stringify(unknownError));
    return new Error(fallbackMessage);
  } catch (error) {
    return new Error(fallbackMessage);
  }
}

export async function createJWTToken(
  payload: SessionPayload & {
    secret: string;
    expirationTime?: number; //seconds
  }
) {
  const encodedSecret = new TextEncoder().encode(payload.secret);
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(now + (payload.expirationTime || 60 * 15)) //in seconds
    .sign(encodedSecret);
}

export async function verifyJWTToken(
  token: string,
  secret: string
): Promise<SessionPayload> {
  const encodedSecret = new TextEncoder().encode(secret);

  const { payload } = await jwtVerify(token, encodedSecret, {
    algorithms: ['HS256'], // 🔐 prevent alg attacks
  });

  return {
    userId: payload.userId as string,
    role: payload.role as ROLES,
  };
}
