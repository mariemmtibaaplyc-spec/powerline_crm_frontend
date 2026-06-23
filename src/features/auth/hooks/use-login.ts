"use client";

import { useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";
import type { LoginPayload } from "@/types/auth.types";

export function useLogin() {
  const setAuthSession = useAuthStore((state) => state.setSession);
  const setSession = useSessionStore((state) => state.setSession);
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    async submit(payload: LoginPayload) {
      setIsLoading(true);

      try {
        const session = await authApi.login(payload);
        const meData = await authApi.getMe();
        const enrichedSession = {
          ...session,
          user: {
            ...session.user,
            ...meData,
            // Garder les champs login si getMe échoue
            id: meData.id ?? session.user.id,
            numericId: meData.numericId ?? session.user.numericId,
            sip_extension: meData.sip_extension ?? session.user.sip_extension ?? null,
          },
        };

        setAuthSession(enrichedSession);
        setSession(enrichedSession);
        localStorage.setItem("accessToken", session.accessToken);

        if (session.refreshToken) {
          localStorage.setItem("refreshToken", session.refreshToken);
        } else {
          localStorage.removeItem("refreshToken");
        }

        document.cookie = `powerline_session=${session.accessToken}; path=/`;
        return session;
      } finally {
        setIsLoading(false);
      }
    },
  };
}
