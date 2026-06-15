"use client";

import { Eye, Phone } from "lucide-react";
import Link from "next/link";
import { SalesStatusBadge } from "@/components/admin-sales/sales-status-badge";
import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";
import type { SalesAppointmentRecord } from "@/types/appointment.types";

export function SalesTable({
  items,
}: {
  items: SalesAppointmentRecord[];
}) {
  return (
    <TableWrapper className="border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <div className="overflow-x-auto">
        <Table className="min-w-[1220px]">
          <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
            <tr>
              <TableHeadCell>Date RDV</TableHeadCell>
              <TableHeadCell>Heure</TableHeadCell>
              <TableHeadCell>Client</TableHeadCell>
              <TableHeadCell>Telephone</TableHeadCell>
              <TableHeadCell>Agent</TableHeadCell>
              <TableHeadCell>Campagne</TableHeadCell>
              <TableHeadCell>Equipe / Groupe</TableHeadCell>
              <TableHeadCell>Statut</TableHeadCell>
              <TableHeadCell>Note courte</TableHeadCell>
              <TableHeadCell className="text-right">Actions</TableHeadCell>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {items.map((item) => (
              <tr
                key={item.id}
                className="transition hover:bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbff_100%)]"
              >
                <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-[#102033]">
                  {item.time}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-[#102033]">{item.clientName}</p>
                    <p className="text-sm text-[#607287]">{item.sourceList}</p>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dce6f0] bg-[#f8fbff] px-3 py-2 text-sm font-medium text-[#24415d]">
                    <Phone className="h-4 w-4 text-[#6082a8]" />
                    {item.phone}
                  </div>
                </TableCell>
                <TableCell>{item.agentName}</TableCell>
                <TableCell>{item.campaign}</TableCell>
                <TableCell>{item.team}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <SalesStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="max-w-[320px] text-sm leading-6 text-[#607287]">
                  {item.note}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/sales/${item.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Voir le RDV ${item.clientName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </TableWrapper>
  );
}
