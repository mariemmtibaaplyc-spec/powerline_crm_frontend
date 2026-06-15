"use client";

import { Power } from "lucide-react";
import type { BlacklistRecord } from "@/types/blacklist.types";
import { BlacklistStatusBadge } from "@/components/admin-blacklist/blacklist-status-badge";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function BlacklistTable({
  entries,
  onDeactivate,
  deactivatingEntryId,
}: {
  entries: BlacklistRecord[];
  onDeactivate: (entry: BlacklistRecord) => void;
  deactivatingEntryId?: string | null;
}) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Numero</TableHeadCell>
            <TableHeadCell>Motif</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell>Date d ajout</TableHeadCell>
            <TableHeadCell>Ajoute par</TableHeadCell>
            <TableHeadCell>Contact lie</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <TableCell className="font-semibold text-[#102033]">{entry.phone}</TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b96b1f]">
                  {entry.reason}
                </span>
              </TableCell>
              <TableCell>
                <BlacklistStatusBadge status={entry.status} />
              </TableCell>
              <TableCell>{entry.addedAt}</TableCell>
              <TableCell>{entry.addedBy}</TableCell>
              <TableCell>{entry.contactId ?? "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {entry.status === "active" ? (
                    <button
                      type="button"
                      disabled={deactivatingEntryId === entry.id}
                      onClick={() => onDeactivate(entry)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#f2d5db] bg-[#fff7f9] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#b54f67] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#fff2f5] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Power className="h-3.5 w-3.5" />
                      {deactivatingEntryId === entry.id ? "Annulation..." : "Annuler blacklist"}
                    </button>
                  ) : (
                    <span className="inline-flex h-10 items-center rounded-full border border-[#dbeee5] bg-[#f4fbf7] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#16735f]">
                      Deja annule
                    </span>
                  )}
                </div>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
