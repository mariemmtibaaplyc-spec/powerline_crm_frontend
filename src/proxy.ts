import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "powerline_session";
const authRoutes = ["/login", "/forgot-password"];
const protectedPrefixes = ["/admin", "/supervisor", "/agent", "/crm"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedPrefixes.some((route) =>
    pathname.startsWith(route),
  );
  const isPreviewMode = searchParams.get("preview") === "ui";

  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && isAuthRoute && !isPreviewMode) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico).*)"],
};
