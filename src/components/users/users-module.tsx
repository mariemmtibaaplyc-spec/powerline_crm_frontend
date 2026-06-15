"use client";

import { Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "@/features/users/mocks/users.mock";
import { useUsers } from "@/features/users/hooks/use-users";
import type { UserRole, UserStatus } from "@/types/user.types";
import { PageHeader } from "@/components/layout/page-header";
import { UsersTable } from "@/components/users/users-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function UsersModule() {
  const { users, toggleUserStatus, deleteUser } = useUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const nextUsers = users
      .filter((user) => {
        const matchesSearch =
          query.length === 0 ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query);

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const normalizedStatus = user.status === "suspended" ? "inactive" : user.status;
        const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();

        return sortOrder === "newest" ? rightTime - leftTime : leftTime - rightTime;
      });

    return nextUsers;
  }, [roleFilter, search, sortOrder, statusFilter, users]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Utilisateurs"
        description="Gestion simple des comptes admin, superviseurs et agents avec table utilisateur, filtres directs et CRUD front mocke."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <Users className="h-4 w-4 text-[#295086]" />
              {users.length} comptes
            </span>
            <Link
              href="/admin/users/create"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Creer un utilisateur
            </Link>
          </>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_200px_200px_200px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher par nom, prenom ou login..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={roleFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)}
            >
              <option value="all">Tous les roles</option>
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
            >
              <option value="all">Tous les statuts</option>
              {USER_STATUS_OPTIONS.filter((option) => option.value !== "suspended").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={sortOrder}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
            >
              <option value="newest">Plus recents</option>
              <option value="oldest">Plus anciens</option>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[#607287]">
            <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
              {filteredUsers.length} utilisateurs affiches
            </span>
          </div>

          {filteredUsers.length > 0 ? (
            <UsersTable
              users={filteredUsers}
              onToggleStatus={toggleUserStatus}
              onDeleteUser={deleteUser}
            />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucun utilisateur ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou les filtres pour retrouver un compte du CRM.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
