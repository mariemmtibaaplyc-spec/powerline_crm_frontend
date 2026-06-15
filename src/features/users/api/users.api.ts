import axios from "axios";
import { apiClient } from "@/lib/axios";
import type {
  RoleOption,
  TeamOption,
  UserRecord,
  UserRole,
  UserStatus,
} from "@/types/user.types";

type BackendUser = {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  role_id?: number;
  team_id?: number | null;
  role?: {
    id: number;
    name: string;
  } | null;
  team?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  deletedAt?: string | null;
};

type GetUsersResponse = {
  data: BackendUser[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

type CreateUserPayload = {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
  team_id?: number;
  email?: string;
};

type UpdateUserPayload = {
  username?: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  team_id?: number;
  email?: string;
};

type UpdateUserStatusPayload = {
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

type UserFormError = Error & {
  fieldErrors?: Record<string, string>;
};

type BackendTeam = {
  id: string | number;
  name: string;
};

type BackendRole = {
  id: string | number;
  name: string;
};

type GetTeamsResponse =
  | {
      data: BackendTeam[];
    }
  | BackendTeam[];

type GetRolesResponse =
  | {
      data: BackendRole[];
    }
  | BackendRole[];

function normalizeUserStatus(status: string): UserStatus {
  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "inactive" ||
    normalizedStatus === "suspended"
  ) {
    return normalizedStatus;
  }

  return "inactive";
}

function normalizeUserRole(role: string | undefined): UserRole {
  const normalizedRole = role?.trim().toLowerCase();

  if (
    normalizedRole === "admin" ||
    normalizedRole === "supervisor" ||
    normalizedRole === "agent"
  ) {
    return normalizedRole;
  }

  return "agent";
}

function mapBackendUser(user: BackendUser): UserRecord {
  return {
    id: String(user.id),
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    username: user.username,
    role: normalizeUserRole(user.role?.name),
    team: user.team?.name ?? "Non assigne",
    status: normalizeUserStatus(user.status),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at ?? user.deletedAt ?? undefined,
    lastActivity: user.updated_at ?? user.created_at,
  };
}

function toBackendUserStatus(status: UserStatus): UpdateUserStatusPayload["status"] {
  if (status === "active") return "ACTIVE";
  if (status === "inactive") return "INACTIVE";
  return "SUSPENDED";
}

function toUserFormError(error: unknown, fallbackMessage: string): UserFormError {
  if (!axios.isAxiosError(error)) {
    return new Error(fallbackMessage) as UserFormError;
  }

  const responseData = error.response?.data;
  const apiMessage =
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData
      ? responseData.message
      : null;
  const formError = new Error(
    typeof apiMessage === "string" && apiMessage.trim()
      ? apiMessage
      : Array.isArray(apiMessage) && typeof apiMessage[0] === "string"
        ? apiMessage[0]
        : fallbackMessage,
  ) as UserFormError;
  const loweredMessage = formError.message.toLowerCase();

  if (loweredMessage.includes("username")) {
    formError.fieldErrors = { username: formError.message };
  } else if (loweredMessage.includes("email")) {
    formError.fieldErrors = { email: formError.message };
  } else if (loweredMessage.includes("role")) {
    formError.fieldErrors = { role: formError.message };
  } else if (loweredMessage.includes("equipe") || loweredMessage.includes("team")) {
    formError.fieldErrors = { team: formError.message };
  }

  return formError;
}

export const usersApi = {
  async getUsers(): Promise<UserRecord[]> {
    try {
      const { data } = await apiClient.get<GetUsersResponse>("/users");
      return data.data.map(mapBackendUser);
    } catch (error) {
      throw toUserFormError(error, "Impossible de charger les utilisateurs pour le moment.");
    }
  },
  async getTeams(): Promise<TeamOption[]> {
    const { data } = await apiClient.get<GetTeamsResponse>("/teams");
    const teams = Array.isArray(data) ? data : data.data;

    return teams.map((team) => ({
      id: String(team.id),
      name: team.name,
    }));
  },
  async getRoles(): Promise<RoleOption[]> {
    const { data } = await apiClient.get<GetRolesResponse>("/roles");
    const roles = Array.isArray(data) ? data : data.data;

    return roles.map((role) => ({
      id: String(role.id),
      name: role.name,
    }));
  },
  async createUser(values: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: string;
    teamId?: string;
    email?: string;
  }): Promise<void> {
    const payload: CreateUserPayload = {
      username: values.username.trim(),
      password: values.password.trim(),
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      role_id: Number(values.roleId),
    };

    const email = values.email?.trim();
    const teamId = values.teamId?.trim();

    if (teamId) {
      payload.team_id = Number(teamId);
    }

    if (email) {
      payload.email = email;
    }

    try {
      await apiClient.post("/users", payload);
    } catch (error) {
      throw toUserFormError(error, "Impossible de creer l utilisateur pour le moment.");
    }
  },
  async updateUser(id: string, values: {
    username?: string;
    firstName?: string;
    lastName?: string;
    roleId?: string;
    teamId?: string;
    email?: string;
  }): Promise<void> {
    const payload: UpdateUserPayload = {};
    const username = values.username?.trim();
    const firstName = values.firstName?.trim();
    const lastName = values.lastName?.trim();
    const roleId = values.roleId?.trim();
    const teamId = values.teamId?.trim();
    const email = values.email?.trim();

    if (username) payload.username = username;
    if (firstName) payload.first_name = firstName;
    if (lastName) payload.last_name = lastName;
    if (roleId) payload.role_id = Number(roleId);
    if (teamId) payload.team_id = Number(teamId);
    if (email) payload.email = email;

    try {
      await apiClient.patch(`/users/${id}`, payload);
    } catch (error) {
      throw toUserFormError(error, "Impossible de modifier l utilisateur pour le moment.");
    }
  },
  async updateUserStatus(id: string, status: UserStatus): Promise<void> {
    const payload: UpdateUserStatusPayload = {
      // Inference from the backend contract described for this task.
      status: toBackendUserStatus(status),
    };

    try {
      await apiClient.patch(`/users/${id}/status`, payload);
    } catch (error) {
      throw toUserFormError(error, "Impossible de modifier le statut pour le moment.");
    }
  },
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      throw toUserFormError(error, "Impossible de supprimer l utilisateur pour le moment.");
    }
  },
};
