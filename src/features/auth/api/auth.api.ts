import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { AuthSession, LoginPayload, SessionUser, UserRole } from "@/types/auth.types";

/**
 * Extrait l'identifiant numérique d'une réponse Backend, en essayant tous les
 * noms de champs courants : sub (JWT), id, userId, user_id, numericId.
 * Retourne null si aucun n'est trouvé ou si la valeur n'est pas un entier > 0.
 */
function extractNumericId(data: Record<string, any>): number | null {
  const raw =
    data.sub ??
    data.id ??
    data.userId ??
    data.user_id ??
    data.numericId ??
    data.user?.sub ??
    data.user?.id ??
    data.user?.userId ??
    data.user?.user_id ??
    null;

  if (raw == null) return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
  return !isNaN(n) && n > 0 ? n : null;
}

type BackendLoginResponse = {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: Partial<SessionUser> & {
    username?: string;
    fullName?: string;
    name?: string;
    role?: string;
    first_name?: string;
    last_name?: string;
    active_campaign_id?: number | null;
    active_campaign_name?: string | null;
    current_campaign?: {
      id?: number;
      name?: string;
    } | null;
  };
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  fullName?: string;
  name?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  active_campaign_id?: number | null;
  active_campaign_name?: string | null;
  current_campaign?: {
    id?: number;
    name?: string;
  } | null;
};

function normalizeRole(role: unknown): UserRole {
  if (typeof role !== "string") {
    throw new Error("Role utilisateur non supporte dans la reponse backend.");
  }

  const normalizedRole = role.trim().toLowerCase();

  if (
    normalizedRole === "admin" ||
    normalizedRole === "supervisor" ||
    normalizedRole === "agent"
  ) {
    return normalizedRole;
  }

  throw new Error("Role utilisateur non supporte dans la reponse backend.");
}

function splitFullName(fullName: string | undefined) {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);

  return {
    firstName: firstName ?? "",
    lastName: lastNameParts.join(" "),
  };
}

function mapBackendSession(
  payload: LoginPayload,
  response: BackendLoginResponse,
): AuthSession {
  const accessToken = response.accessToken ?? response.access_token;

  if (!accessToken) {
    throw new Error("Le backend n'a pas retourne d'accessToken.");
  }

  const refreshToken = response.refreshToken ?? response.refresh_token;
  const user = response.user ?? {};
  const fullName = user.fullName ?? user.name ?? response.fullName ?? response.name;
  const namesFromFullName = splitFullName(fullName);
  const email = user.email ?? user.username ?? response.email ?? response.username ?? payload.email;
  const role = normalizeRole(user.role ?? response.role);

  // Cherche l'ID dans user d'abord, puis à la racine de la réponse
  const numericId =
    extractNumericId(user as Record<string, any>) ??
    extractNumericId(response as Record<string, any>) ??
    0;

  if (numericId === 0) {
    console.warn("[mapBackendSession] numericId=0 — champ ID non trouvé dans la réponse backend.", { user, response });
  }

  const rawId = (user as any).id ?? (response as any).id ?? String(numericId || email);
  const sip_extension =
    (user as any).sip_extension ?? (response as any).sip_extension ?? null;
  const activeCampaignId =
    (user as any).active_campaign_id ??
    (response as any).active_campaign_id ??
    (user as any).current_campaign?.id ??
    (response as any).current_campaign?.id ??
    null;
  const activeCampaignName =
    (user as any).active_campaign_name ??
    (response as any).active_campaign_name ??
    (user as any).current_campaign?.name ??
    (response as any).current_campaign?.name ??
    null;

return {
  accessToken,
  refreshToken,
  user: {
    id: String(rawId),
    numericId,
    firstName:
      user.firstName ?? user.first_name ?? response.firstName ?? response.first_name ?? namesFromFullName.firstName,
    lastName:
      user.lastName ?? user.last_name ?? response.lastName ?? response.last_name ?? namesFromFullName.lastName,
    email,
    role,
    sip_extension,
    activeCampaignId,
    activeCampaignName,
  },
};
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<BackendLoginResponse>("/auth/login", {
        username: payload.email.trim(),
        password: payload.password,
      });

      return mapBackendSession(payload, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage =
          typeof error.response?.data === "object" &&
          error.response?.data !== null &&
          "message" in error.response.data
            ? error.response.data.message
            : null;

        if (typeof apiMessage === "string" && apiMessage.trim()) {
          throw new Error(apiMessage);
        }

        if (Array.isArray(apiMessage) && typeof apiMessage[0] === "string") {
          throw new Error(apiMessage[0]);
        }

        if (error.response?.status === 401) {
          throw new Error("Identifiants invalides");
        }
      }

      throw new Error("Impossible de se connecter pour le moment.");
    }
  },
  async getMe(): Promise<Partial<SessionUser>> {
  try {
    const { data } = await apiClient.get<any>("/auth/me");
    const numericId = extractNumericId(data) ?? 0;

    if (numericId === 0) {
      console.warn("[getMe] numericId=0 — réponse /auth/me:", data);
    }

    const rawId = data.sub ?? data.id ?? data.userId ?? data.user_id ?? String(numericId);

    return {
      id: String(rawId),
      numericId,
      firstName: data.firstName ?? data.first_name ?? data.user?.firstName ?? data.user?.first_name ?? "",
      lastName: data.lastName ?? data.last_name ?? data.user?.lastName ?? data.user?.last_name ?? "",
      email: data.email ?? data.user?.email ?? "",
      role: data.role ?? data.user?.role,
      sip_extension: data.sip_extension ?? data.user?.sip_extension ?? null,
      activeCampaignId:
        data.active_campaign_id ??
        data.user?.active_campaign_id ??
        data.current_campaign?.id ??
        data.user?.current_campaign?.id ??
        null,
      activeCampaignName:
        data.active_campaign_name ??
        data.user?.active_campaign_name ??
        data.current_campaign?.name ??
        data.user?.current_campaign?.name ??
        null,
    };
  } catch {
    return {};
  }
},
  async forgotPassword(email: string) {
    return { email, sent: true };
  },
  /**
   * Libère la présence agent (active_session_id/session_last_seen) côté backend.
   * Doit être appelé AVANT de supprimer le token local, sinon l'intercepteur
   * axios n'a plus rien à envoyer dans l'Authorization header et le backend ne
   * peut pas savoir quelle session libérer — l'agent resterait bloqué en cas
   * de reconnexion immédiate ("compte déjà utilisé sur un autre poste").
   *
   * `token` est passé explicitement (capturé par l'appelant AVANT tout clear
   * de store/localStorage) et injecté directement dans le header — on ne
   * dépend plus uniquement de l'intercepteur axios, qui lit son token depuis
   * les stores/localStorage au moment de l'envoi et peut donc rater la
   * fenêtre si un autre appelant a déjà commencé à nettoyer l'état.
   *
   * Échec silencieux (token déjà expiré/absent) : le logout front continue —
   * mais on logge la cause pour diagnostiquer un éventuel 401 inattendu.
   */
  async logout(token?: string | null): Promise<void> {
    try {
      await apiClient.post(
        "/auth/logout",
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
    } catch (err: any) {
      const status = err?.response?.status;
      console.warn(
        `[logout] backend logout failed status=${status ?? "n/a"} tokenPresent=${Boolean(token)}`,
      );
      // Non-bloquant — voir clearSessionPresenceIfMatches côté backend :
      // une session déjà stale/expirée n'empêche de toute façon pas le futur login.
    }
  },
};
