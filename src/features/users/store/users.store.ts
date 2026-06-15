"use client";

import { create } from "zustand";
import { usersApi } from "@/features/users/api/users.api";
import type {
  RoleOption,
  TeamOption,
  UserFormValues,
  UserRecord,
  UserStatus,
} from "@/types/user.types";

interface UsersStoreState {
  users: UserRecord[];
  roles: RoleOption[];
  teams: TeamOption[];
  hasLoadedUsers: boolean;
  hasLoadedRoles: boolean;
  hasLoadedTeams: boolean;
  loadUsers: (force?: boolean) => Promise<void>;
  loadRoles: (force?: boolean) => Promise<void>;
  loadTeams: (force?: boolean) => Promise<void>;
  createUser: (values: UserFormValues) => Promise<void>;
  updateUser: (id: string, values: UserFormValues) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => UserRecord | undefined;
}

export const useUsersStore = create<UsersStoreState>((set, get) => ({
  users: [],
  roles: [],
  teams: [],
  hasLoadedUsers: false,
  hasLoadedRoles: false,
  hasLoadedTeams: false,
  loadUsers: async (force = false) => {
    if (get().hasLoadedUsers && !force) {
      return;
    }

    try {
      const users = await usersApi.getUsers();

      set({
        users,
        hasLoadedUsers: true,
      });
    } catch {
      set({
        users: [],
        hasLoadedUsers: true,
      });
    }
  },
  loadRoles: async (force = false) => {
    if (get().hasLoadedRoles && !force) {
      return;
    }

    try {
      const roles = await usersApi.getRoles();

      set({
        roles,
        hasLoadedRoles: true,
      });
    } catch {
      set({
        roles: [],
        hasLoadedRoles: true,
      });
    }
  },
  loadTeams: async (force = false) => {
    if (get().hasLoadedTeams && !force) {
      return;
    }

    try {
      const teams = await usersApi.getTeams();

      set({
        teams,
        hasLoadedTeams: true,
      });
    } catch {
      set({
        teams: [],
        hasLoadedTeams: true,
      });
    }
  },
  createUser: async (values) => {
    await usersApi.createUser({
      username: values.username,
      password: values.password ?? "",
      firstName: values.firstName,
      lastName: values.lastName,
      roleId: values.role,
      teamId: values.team || undefined,
      email: values.email,
    });

    await get().loadUsers(true);
  },
  updateUser: async (id, values) => {
    await usersApi.updateUser(id, {
      username: values.username,
      firstName: values.firstName,
      lastName: values.lastName,
      roleId: values.role,
      teamId: values.team || undefined,
      email: values.email,
    });

    await get().loadUsers(true);
  },
  toggleUserStatus: async (id) => {
    const user = get().getUserById(id);

    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    const nextStatus: UserStatus =
      user.status === "active" ? "inactive" : "active";

    await usersApi.updateUserStatus(id, nextStatus);
    await get().loadUsers(true);
  },
  deleteUser: async (id) => {
    await usersApi.deleteUser(id);
    await get().loadUsers(true);
  },
  getUserById: (id) => get().users.find((user) => user.id === id),
}));
