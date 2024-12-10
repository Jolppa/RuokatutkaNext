import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUser } from "./app/util/data";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // credentials contains the username and password submitted via the login form

        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        // query for the user with the username from the credentials
        const user = await getUser(username, password);
        return user;
      },
    }),
  ],
  debug: true,
});
