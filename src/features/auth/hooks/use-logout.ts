"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/better-auth.client";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";

export function useLogout() {
  const router = useRouter();
  const setAuthSession = useAuthStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);

  return async function logout() {
    // 1. Capturer le vrai accessToken backend AVANT toute suppression — on ne
    //    dépend pas seulement de l'intercepteur axios (qui relit ces mêmes
    //    sources au moment de l'envoi et peut rater la fenêtre si un autre
    //    flux de logout a déjà commencé à nettoyer l'état entre-temps).
    const accessToken =
      useSessionStore.getState().session?.accessToken ??
      useAuthStore.getState().session?.accessToken ??
      (typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null);

    // 2. Appeler explicitement le backend POST /auth/logout avec ce token,
    //    PENDANT qu'il est encore valide. Doit impérativement précéder toute
    //    suppression de token, sinon le backend ne peut pas identifier quelle
    //    session (sid) libérer et active_session_id reste posé → la prochaine
    //    tentative de login échoue avec "compte déjà utilisé sur un autre poste".
    //    Échec silencieux si le token est déjà expiré (voir authApi.logout).
    await authApi.logout(accessToken);

    // 3. Invalidate the better-auth session and clear its cookie
    await authClient.signOut();

    // 4. Clear Zustand stores
    setAuthSession(null);
    clearSession();

    // Le workspace store garde userId/historyEntries en mémoire même après
    // logout (pas de reset automatique) — sans ça, un fetch encore en vol ou
    // un re-render tardif de la page Historique retente l'appel API avec un
    // userId valide mais plus aucun token → 401 en console après logout.
    useWorkspaceStore.setState({ userId: null, historyEntries: [] });

    // 5. Clear localStorage tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // 6. Redirect to login
    router.push("/login");
  };
}
