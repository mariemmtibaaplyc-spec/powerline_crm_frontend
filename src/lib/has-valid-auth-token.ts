import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";

// Même logique que le garde utilisé dans workspace.store.ts — évite d'envoyer
// une requête authentifiée alors qu'aucun token n'est plus disponible
// (ex: déconnexion, remount déclenché par Fast Refresh après logout).
export function hasValidAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  const sessionToken = useSessionStore.getState().session?.accessToken ?? null;
  const authToken = useAuthStore.getState().session?.accessToken ?? null;
  const storageToken = window.localStorage.getItem("accessToken");
  return Boolean(sessionToken ?? authToken ?? storageToken);
}
