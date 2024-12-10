import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/",
    signIn: "/login",
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
    // async redirect({ url, baseUrl }) {
    //   return `${baseUrl}/dashboard`;
    // },
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
