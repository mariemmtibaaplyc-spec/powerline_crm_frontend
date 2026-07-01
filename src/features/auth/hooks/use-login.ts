"use client";

import { useState } from "react";
import { authClient } from "@/lib/better-auth.client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";
import type { LoginPayload, UserRole } from "@/types/auth.types";

export function useLogin() {
  const setAuthSession = useAuthStore((state) => state.setSession);
  const setSession = useSessionStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    async submit(payload: LoginPayload) {
      setIsLoading(true);

      try {
        const { data, error } = await authClient.signIn.username({
          username: payload.email.trim(),
          password: payload.password,
        });

        if (error) {
          throw new Error(
            error.message ?? "Impossible de se connecter pour le moment.",
          );
        }

        if (!data) {
          throw new Error("Impossible de se connecter pour le moment.");
        }

        // better-auth stores the backend JWT in user.backendAccessToken (see better-auth.server.ts)
        const user = data.user as any;
        const accessToken = (user.backendAccessToken ?? "") as string;
        const refreshToken = (user.backendRefreshToken ?? undefined) as
          | string
          | undefined;

        const session = {
          accessToken,
          refreshToken,
          user: {
            id: String(user.id),
            numericId: (user.numericId as number) ?? 0,
            firstName: (user.firstName as string) ?? "",
            lastName: (user.lastName as string) ?? "",
            email: user.email ?? payload.email,
            role: ((user.role as string) ?? "agent") as UserRole,
            sip_extension: (user.sipExtension as string | null) ?? null,
            activeCampaignId: null,
            activeCampaignName: null,
          },
        };

        // Keep Zustand stores in sync — the axios interceptor reads from them
        setAuthSession(session);
        setSession(session);

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        } else {
          localStorage.removeItem("refreshToken");
        }

        // The session cookie is now set server-side by better-auth (powerline_session)
        return session;
      } finally {
        setIsLoading(false);
      }
    },
  };
}
