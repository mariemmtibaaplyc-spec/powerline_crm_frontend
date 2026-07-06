import { NextResponse, type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Role-based access control (RBAC)
// ---------------------------------------------------------------------------
// This proxy runs on the Edge Runtime before any page component renders.
// It enforces which roles are allowed on each URL prefix.
// ---------------------------------------------------------------------------

type Role = "admin" | "supervisor" | "agent";

// better-auth sets "powerline_session" (configured in better-auth.server.ts).
// The fallback covers better-auth's default name in case the override isn't active.
const AUTH_COOKIES = ["powerline_session", "better-auth.session_token"];

/** Routes that only unauthenticated users should reach. */
const AUTH_ROUTES = ["/login", "/forgot-password"];

/**
 * Protected route prefixes with the roles that are allowed to access them.
 * Order matters: more specific prefixes should come first if needed.
 */
const PROTECTED: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admin",      roles: ["admin"] },
  { prefix: "/supervisor", roles: ["supervisor", "admin"] },
  { prefix: "/agent",      roles: ["agent"] },
  { prefix: "/crm",        roles: ["admin", "supervisor"] },
];

/** Default dashboard path for each role after a successful login. */
const ROLE_HOME: Record<Role, string> = {
  admin:      "/admin",
  supervisor: "/supervisor",
  agent:      "/agent",
};

// The internal better-auth endpoint that returns the current session as JSON.
// Using the absolute URL because the Edge Runtime fetch requires it.
const AUTH_API_BASE =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

// ---------------------------------------------------------------------------
// Helper: fetch the verified session (role included) from better-auth
// ---------------------------------------------------------------------------
interface SessionUser {
  id: string;
  role?: string;
}
interface BetterAuthSession {
  user: SessionUser;
  session: { id: string };
}

async function getVerifiedSession(
  req: NextRequest,
): Promise<BetterAuthSession | null> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/api/auth/get-session`, {      headers: {
        // Forward the original cookie header so better-auth can read the token.
        cookie: req.headers.get("cookie") ?? "",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.user) return null;
    return data as BetterAuthSession;
  } catch {
    // Network error, timeout, or JSON parse failure → treat as unauthenticated.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Proxy (replaces middleware in Next.js 16+)
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Never interfere with auth API, health check, or static assets.
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isAuthRoute  = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isPreviewMode = searchParams.get("preview") === "ui";

  // Fast-path cookie check – avoid the network round-trip when no session exists.
  const hasCookie = AUTH_COOKIES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );

  // ── Rule 1: No cookie → redirect unauthenticated users away from protected routes ──
  if (!hasCookie) {
    const isProtected = PROTECTED.some((p) => pathname.startsWith(p.prefix));
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Fetch verified session (includes role) ─────────────────────────────────
  const session = await getVerifiedSession(request);
  const userRole = (session?.user?.role ?? null) as Role | null;

  // Cookie exists but session is invalid / expired.
  if (!session || !userRole) {
    const isProtected = PROTECTED.some((p) => pathname.startsWith(p.prefix));
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Rule 2: Authenticated user visits a login / auth page ─────────────────
  if (isAuthRoute && !isPreviewMode) {
    const home = ROLE_HOME[userRole] ?? "/agent";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // ── Rule 3: Authenticated user visits a route forbidden for their role ──────
  const matchedRoute = PROTECTED.find((p) => pathname.startsWith(p.prefix));
  if (matchedRoute && !matchedRoute.roles.includes(userRole)) {
    const home = ROLE_HOME[userRole] ?? "/agent";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico).*)"],
};