"use client";

import { Eye, PenSquare, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { getRoleLabel, getUserFullName } from "@/features/users/mocks/users.mock";
import type { UserRecord } from "@/types/user.types";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { UserStatusBadge } from "@/components/users/user-status-badge";

export function UsersTable({
  users,
  onToggleStatus,
  onDeleteUser,
}: {
  users: UserRecord[];
  onToggleStatus: (id: string) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Login</TableHeadCell>
            <TableHeadCell>Nom</TableHeadCell>
            <TableHeadCell>Prenom</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell>Date creation</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <TableCell>
                <p className="font-medium text-[#24415d]">{user.username}</p>
              </TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                  {getRoleLabel(user.role)}
                </span>
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.status} />
              </TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Voir ${user.username}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Modifier ${user.username}`}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await onToggleStatus(user.id);
                      } catch (error) {
                        window.alert(
                          error instanceof Error
                            ? error.message
                            : "Impossible de modifier le statut pour le moment.",
                        );
                      }
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#24415d] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {user.status === "active" ? "Desactiver" : "Activer"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Confirmer la suppression ?")) {
                        return;
                      }

                      try {
                        await onDeleteUser(user.id);
                      } catch (error) {
                        window.alert(
                          error instanceof Error
                            ? error.message
                            : "Impossible de supprimer l utilisateur pour le moment.",
                        );
                      }
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f0d9de] bg-white text-[#9a4a5e] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#fff7f9]"
                    aria-label={`Supprimer ${user.username}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
