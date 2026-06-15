"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getDefaultDashboard, isAuthenticated } from "@/lib/auth";

export function useAuth() {
  const session = useAuthStore((state) => state.session);

  return useMemo(
    () => ({
      session,
      isAuthenticated: isAuthenticated(session),
      defaultDashboard: session
        ? getDefaultDashboard(session.user.role)
        : "/login",
    }),
    [session],
  );
}
