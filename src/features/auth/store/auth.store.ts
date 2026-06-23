import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession } from "@/types/auth.types";

interface AuthState {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: "powerline_auth",  // clé localStorage
    }
  )
);