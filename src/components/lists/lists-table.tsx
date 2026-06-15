"use client";

import { Eye, PenSquare, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { getListTypeLabel } from "@/features/lists/mocks/lists.mock";
import type { ListRecord } from "@/types/list.types";
import { ListStatusBadge } from "@/components/lists/list-status-badge";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function ListsTable({
  lists,
  isUpdatingStatus,
  onUpdateStatus,
}: {
  lists: ListRecord[];
  isUpdatingStatus?: boolean;
  onUpdateStatus: (id: string, status: ListRecord["status"]) => void;
}) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Nom de la liste</TableHeadCell>
            <TableHeadCell>Type / source</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell>Campagne</TableHeadCell>
            <TableHeadCell>Contacts</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {lists.map((list) => (
            <tr key={list.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-[#102033]">{list.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                    {list.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <span className="inline-flex rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                    {getListTypeLabel(list.type)}
                  </span>
                  <p className="text-sm text-[#6c7f93]">{list.source}</p>
                </div>
              </TableCell>
              <TableCell>
                <ListStatusBadge status={list.status} />
              </TableCell>
              <TableCell>{list.campaign}</TableCell>
              <TableCell>{list.contactsCount.toLocaleString("fr-FR")}</TableCell>
              <TableCell>{list.importedAt}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/lists/${list.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Voir ${list.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/lists/${list.id}/edit`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Modifier ${list.name}`}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(list.id, list.status === "archived" ? "attached" : "archived")}
                    disabled={isUpdatingStatus}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#24415d] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    {isUpdatingStatus ? "Mise a jour..." : "Changer statut"}
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
