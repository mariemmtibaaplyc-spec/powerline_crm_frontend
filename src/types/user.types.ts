export type UserRole = "admin" | "supervisor" | "agent";

export type UserStatus = "active" | "inactive" | "suspended";

export interface TeamOption {
  id: string;
  name: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: UserRole;
  team: string;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  lastActivity: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  team: string;
  status: UserStatus;
  password?: string;
}
