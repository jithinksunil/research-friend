import 'server-only';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { refresh, signinUser } from './server';
export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { accessToken, refreshToken, expires_at, email, id, role } =
          await signinUser({
            email: credentials.email as string,
            password: credentials.password as string,
          });
        return {
          id,
          email,
          role,
          accessToken,
          refreshToken,
          expires_at,
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
      const { accessToken, refreshToken, expires_at } = await refresh(
        token.refreshToken as string,
      );
      return {
        ...token,
        accessToken,
        refreshToken,
        expires_at,
      };
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
