import { NextResponse, type NextRequest } from "next/server";

// better-auth sets "powerline_session" (configured in better-auth.server.ts).
// The fallback covers better-auth's default name in case the override isn't active.
const AUTH_COOKIES = ["powerline_session", "better-auth.session_token"];
const authRoutes = ["/login", "/forgot-password"];
const protectedPrefixes = ["/admin", "/supervisor", "/agent", "/crm"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = AUTH_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );
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
