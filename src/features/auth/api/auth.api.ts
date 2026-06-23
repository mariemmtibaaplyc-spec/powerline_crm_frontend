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
  };
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  fullName?: string;
  name?: string;
  role?: string;
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

return {
  accessToken,
  refreshToken,
  user: {
    id: String(rawId),
    numericId,
    firstName: user.firstName ?? response.firstName ?? namesFromFullName.firstName,
    lastName: user.lastName ?? response.lastName ?? namesFromFullName.lastName,
    email,
    role,
    sip_extension,
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
      firstName: data.firstName ?? data.first_name ?? data.user?.firstName ?? "",
      lastName: data.lastName ?? data.last_name ?? data.user?.lastName ?? "",
      email: data.email ?? data.user?.email ?? "",
      role: data.role ?? data.user?.role,
      sip_extension: data.sip_extension ?? data.user?.sip_extension ?? null,
    };
  } catch {
    return {};
  }
},
  async forgotPassword(email: string) {
    return { email, sent: true };
  },
};
