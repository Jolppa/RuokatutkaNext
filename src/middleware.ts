import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { DEFAULT_REDIRECT } from "@/app/util/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  // console.log("Next URL: " + nextUrl.pathname);

  const isAuthenticated = !!req.auth;
  // const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  if (!isAuthenticated && nextUrl.pathname === "/dashboard") {
    return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
