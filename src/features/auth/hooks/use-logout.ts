"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/better-auth.client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";

export function useLogout() {
  const router = useRouter();
  const setAuthSession = useAuthStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);

  return async function logout() {
    // 1. Invalidate the better-auth session and clear its cookie
    await authClient.signOut();

    // 2. Clear Zustand stores
    setAuthSession(null);
    clearSession();

    // 3. Clear localStorage tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 4. Redirect to login
    router.push("/login");
  };
}
