import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/",
    signIn: "/kirjaudu",
  },
  callbacks: {
    async authorized({ auth }) {
      // console.log(auth);
      const isLoggedIn = auth?.user;
      if (!isLoggedIn) {
        return false;
      }
      return true;
    },
    async session({ session, token }) {
      session.user.id = <string>token.id;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
