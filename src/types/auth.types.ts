export type UserRole = "admin" | "supervisor" | "agent";

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: SessionUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}
