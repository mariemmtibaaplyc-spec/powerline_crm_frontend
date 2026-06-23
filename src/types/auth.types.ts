export type UserRole = "admin" | "supervisor" | "agent";

export interface SessionUser {
  id: string;
  numericId: number; 
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  sip_extension: string | null;
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
