import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, ROLE_COOKIE } from "@/lib/auth/constants";

const teacherPrefixes = [
  "/dashboard",
  "/classes",
  "/students",
  "/assignments",
  "/settings",
];

const principalPrefixes = ["/principal"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isTeacherArea(pathname: string) {
  return matchesPrefix(pathname, teacherPrefixes);
}

function isPrincipalArea(pathname: string) {
  return matchesPrefix(pathname, principalPrefixes);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = request.cookies.get(AUTH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  const isAuthenticated = !!auth && auth !== "1";
  const isPrincipal = role === "principal";
  const isTeacher = role === "teacher";

  // --- Auth gates ---
  if (isTeacherArea(pathname)) {
    if (!isAuthenticated || (!isPrincipal && !isTeacher)) {
      const login = new URL("/", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    if (isPrincipal) {
      return NextResponse.redirect(
        new URL("/principal/dashboard", request.url),
      );
    }
  }

  if (isPrincipalArea(pathname)) {
    if (!isAuthenticated || (!isPrincipal && !isTeacher)) {
      const login = new URL("/", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
    if (isTeacher) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Logged-in users hitting login page → default home for their role
  if (pathname === "/" && isAuthenticated) {
    if (isPrincipal) {
      return NextResponse.redirect(
        new URL("/principal/dashboard", request.url),
      );
    }
    if (isTeacher) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/classes/:path*",
    "/students/:path*",
    "/assignments/:path*",
    "/settings/:path*",
    "/principal/:path*",
  ],
};
