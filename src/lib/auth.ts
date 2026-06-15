import type { AuthSession, UserRole } from "@/types/auth.types";

export const SESSION_COOKIE = "powerline_session";
export const PREVIEW_ROLE_STORAGE_KEY = "powerline_preview_role";

export const previewRoleRoutes = {
  login: "/login?preview=ui",
  supervisor: "/supervisor",
  agent: "/agent",
  admin: "/admin",
} as const;

export type PreviewRole = keyof typeof previewRoleRoutes;

export const previewRoleOptions: Array<{
  value: PreviewRole;
  label: string;
}> = [
  { value: "login", label: "Login" },
  { value: "supervisor", label: "Superviseur" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
];

export function isAuthenticated(session: AuthSession | null) {
  return Boolean(session?.accessToken);
}

export function getDefaultDashboard(role: UserRole) {
  if (role === "admin") return "/admin";
  if (role === "supervisor") return "/supervisor";
  return "/agent";
}

export function getPreviewRolePath(role: PreviewRole) {
  return previewRoleRoutes[role];
}

export function getPreviewRoleByLocation(
  pathname: string,
): PreviewRole {
  if (pathname.startsWith("/login")) return "login";

  if (pathname.startsWith("/supervisor")) return "supervisor";
  if (pathname.startsWith("/agent")) return "agent";
  if (pathname.startsWith("/admin") || pathname.startsWith("/crm")) {
    return "admin";
  }

  return "login";
}
