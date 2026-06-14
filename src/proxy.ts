import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { IUser } from "./app/types";

interface ITokenPayload extends jwt.JwtPayload {
  user: IUser;
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  let user = null;


  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as ITokenPayload;

      user = decoded.user;
    } catch (err) {
      console.log(" Invalid or expired token", err);
      user = null;
    }
  }


  //  Auth pages
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  //  Public APIs / assets
  const isPublic =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico");

  //  Case 1: Already logged in → block login/signup
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  //  Case 2: Not logged in → block protected routes
  if (!token && !isAuthPage && !isPublic && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/partner") && user?.role !== "partner") {
    if (pathname.startsWith("/partner/onboarding")) {
      // Allow onboarding pages for non-partners
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  //  Allow
  return NextResponse.next();
}

// jaha middleware nahi chalana h
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js)$).*)",
  ],
};
