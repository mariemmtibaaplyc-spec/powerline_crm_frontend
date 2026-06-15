"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUsersStore } from "@/features/users/store/users.store";

export function useUsers() {
  const router = useRouter();
  const users = useUsersStore((state) => state.users);
  const roles = useUsersStore((state) => state.roles);
  const teams = useUsersStore((state) => state.teams);
  const hasLoadedUsers = useUsersStore((state) => state.hasLoadedUsers);
  const hasLoadedRoles = useUsersStore((state) => state.hasLoadedRoles);
  const hasLoadedTeams = useUsersStore((state) => state.hasLoadedTeams);
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const loadRoles = useUsersStore((state) => state.loadRoles);
  const loadTeams = useUsersStore((state) => state.loadTeams);
  const createUser = useUsersStore((state) => state.createUser);
  const updateUser = useUsersStore((state) => state.updateUser);
  const toggleUserStatus = useUsersStore((state) => state.toggleUserStatus);
  const deleteUser = useUsersStore((state) => state.deleteUser);
  const getUserById = useUsersStore((state) => state.getUserById);

  useEffect(() => {
    const accessToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("accessToken")
        : null;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (!hasLoadedUsers && accessToken) {
      void loadUsers();
    }

    if (!hasLoadedRoles && accessToken) {
      void loadRoles();
    }

    if (!hasLoadedTeams && accessToken) {
      void loadTeams();
    }
  }, [hasLoadedRoles, hasLoadedTeams, hasLoadedUsers, loadRoles, loadTeams, loadUsers, router]);

  return {
    users,
    roles,
    teams,
    hasLoadedUsers,
    hasLoadedRoles,
    hasLoadedTeams,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getUserById,
  };
}
