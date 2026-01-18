import 'server-only';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  ACCESS_TOKEN_EXPIRATION_S,
  createJWTToken,
  prisma,
  refresh,
  REFRESH_TOKEN_EXPIRATION_S,
} from './lib';
import { JWT } from 'next-auth/jwt';
import { ROLES } from './app/generated/prisma/enums';
export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        firstName: { label: 'FirstName', type: 'text' },
        lastName: { label: 'LastName', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.create({
          data: {
            email: credentials.email as string,
            firstName: credentials.firstName as string,
            lastName: credentials.lastName as string,
            role: ROLES.USER,
          },
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
          id: user.id,
          email: user.email,
          role: user.role,
          accessToken,
          refreshToken,
          expires_at: Date.now() + ACCESS_TOKEN_EXPIRATION_S * 1000,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expires_at: user.expires_at,
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
      if (Date.now() < (token.expires_at as number)) return { ...token };
      return await refreshAccessToken(token);
    },

    async session({ token, session }: any) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user = { id: token.id, email: token.email, role: token.role };
      }
      return session;
    },
  },
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const { accessToken, refreshToken } = await refresh(
    token.refreshToken as string,
  );
  return {
    ...token,
    accessToken,
    refreshToken,
    expires_at: Date.now() + ACCESS_TOKEN_EXPIRATION_S * 1000,
  };
}
