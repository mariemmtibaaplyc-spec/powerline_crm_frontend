import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { AuthSession, LoginPayload, SessionUser, UserRole } from "@/types/auth.types";

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

  return {
    accessToken,
    refreshToken,
    user: {
      id: String(user.id ?? response.id ?? email),
      firstName: user.firstName ?? response.firstName ?? namesFromFullName.firstName,
      lastName: user.lastName ?? response.lastName ?? namesFromFullName.lastName,
      email,
      role,
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
  async forgotPassword(email: string) {
    return { email, sent: true };
  },
};
