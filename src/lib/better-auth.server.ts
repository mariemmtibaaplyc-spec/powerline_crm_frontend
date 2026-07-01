import Database from "better-sqlite3";
import { betterAuth, APIError } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { username as usernamePlugin } from "better-auth/plugins";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1"
).replace(/\/$/, "");

// In-memory SQLite — sessions are cleared on server restart.
// For production, replace with a file path or a remote DB adapter.
const db = new Database(":memory:");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "powerline-dev-secret-change-in-production",
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  database: db,

  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "agent" },
      numericId: { type: "number", required: false, defaultValue: 0 },
      sipExtension: { type: "string", required: false },
      firstName: { type: "string", required: false, defaultValue: "" },
      lastName: { type: "string", required: false, defaultValue: "" },
      backendAccessToken: { type: "string", required: false },
      backendRefreshToken: { type: "string", required: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
      session_token: { name: "powerline_session" },
    },
  },

  // emailAndPassword is kept only to register the global password context used
  // by the username plugin. The /sign-in/email endpoint is blocked by a hook below.
  emailAndPassword: {
    enabled: true,
    password: {
      async hash() {
        return "EXTERNAL_VERIFIED";
      },
      async verify() {
        // Real verification happens in the before hook for /sign-in/username
        return true;
      },
    },
  },

  plugins: [
    // Username plugin: adds `username` field and exposes /sign-in/username
    usernamePlugin({
      // Disable the default password logic — we verify externally in the before hook
      minUsernameLength: 1,
      maxUsernameLength: 255,
      // Allow any character (backend controls the format)
      usernameValidator: () => true,
      // Keep the username as-is (no lowercase normalization)
      usernameNormalization: false,
    }),

    // Custom hook: validates credentials against the real backend, upserts user
    {
      id: "powerline-external-auth",
      hooks: {
        before: [
          {
            // Block the email sign-in endpoint — only username is supported
            matcher: (ctx: any) => ctx.path === "/sign-in/email",
            handler: createAuthMiddleware(async () => {
              throw new APIError("FORBIDDEN", {
                message: "Connexion par email desactivee. Utilisez votre identifiant.",
              });
            }),
          },
          {
            matcher: (ctx: any) => ctx.path === "/sign-in/username",
            handler: createAuthMiddleware(async (ctx) => {
              const body = ctx.body as { username?: string; password?: string };
              const usernameValue = body?.username?.trim();
              const password = body?.password;

              if (!usernameValue || !password) {
                throw new APIError("BAD_REQUEST", {
                  message: "Identifiant et mot de passe requis",
                });
              }

              // 1. Validate credentials against the real backend
              let backendData: any;
              try {
                const res = await fetch(`${BACKEND_URL}/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username: usernameValue, password }),
                });

                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  const msg = err?.message;
                  throw new APIError("UNAUTHORIZED", {
                    message: Array.isArray(msg)
                      ? msg[0]
                      : typeof msg === "string" && msg
                        ? msg
                        : "Identifiants invalides",
                  });
                }

                backendData = await res.json();
              } catch (error) {
                if (error instanceof APIError) throw error;
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "Connexion impossible",
                });
              }

              const accessToken =
                backendData.accessToken ?? backendData.access_token;
              if (!accessToken) {
                throw new APIError("INTERNAL_SERVER_ERROR", {
                  message: "Token manquant dans la reponse backend",
                });
              }

              // 2. Enrich with /auth/me
              let meData: any = {};
              try {
                const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (meRes.ok) meData = await meRes.json();
              } catch {}

              const backendUser = backendData.user ?? {};
              const numericId =
                Number(
                  meData?.id ?? meData?.sub ?? backendUser?.id ?? backendUser?.sub ?? 0,
                ) || 0;
              const role = String(
                meData?.role ?? backendUser?.role ?? "agent",
              ).toLowerCase();
              const firstName =
                meData?.firstName ?? meData?.first_name ??
                backendUser?.firstName ?? backendUser?.first_name ?? "";
              const lastName =
                meData?.lastName ?? meData?.last_name ??
                backendUser?.lastName ?? backendUser?.last_name ?? "";
              const sipExtension =
                meData?.sip_extension ?? backendUser?.sip_extension ?? null;
              const refreshToken =
                backendData.refreshToken ?? backendData.refresh_token ?? null;

              // Email is optional in the backend schema — fall back to a synthetic one
              const realEmail =
                meData?.email ?? backendUser?.email ?? null;
              const email = realEmail ?? `${usernameValue}@internal.local`;

              // 3. Upsert user + credential account in better-auth's SQLite.
              // NOTE: do NOT pass `id` — better-auth generates its own IDs.
              const adapter = ctx.context.adapter;
              const existingUser = await adapter.findOne({
                model: "user",
                where: [{ field: "username", value: usernameValue }],
              }) as { id: string } | null;

              if (!existingUser) {
                const createdUser = await adapter.create({
                  model: "user",
                  data: {
                    username: usernameValue,
                    email,
                    name: `${firstName} ${lastName}`.trim() || usernameValue,
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    role,
                    numericId,
                    sipExtension,
                    firstName,
                    lastName,
                    backendAccessToken: accessToken,
                    backendRefreshToken: refreshToken,
                  },
                }) as { id: string };

                await adapter.create({
                  model: "account",
                  data: {
                    userId: createdUser.id,
                    accountId: usernameValue,
                    providerId: "credential",
                    password: "EXTERNAL_VERIFIED",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                });
              } else {
                await adapter.update({
                  model: "user",
                  where: [{ field: "id", value: existingUser.id }],
                  update: {
                    name: `${firstName} ${lastName}`.trim() || usernameValue,
                    role,
                    numericId,
                    sipExtension,
                    firstName,
                    lastName,
                    backendAccessToken: accessToken,
                    backendRefreshToken: refreshToken,
                    updatedAt: new Date(),
                  },
                });
              }

              // better-auth continues: looks up user by username → verifies password (→ true) → creates session
            }),
          },
        ],
      },
    },
  ],
});

// Run SQLite migrations immediately so tables exist before the first request.
export const dbReady: Promise<void> = auth.$context.then((ctx) =>
  (ctx as any).runMigrations?.(),
);

export type Auth = typeof auth;
