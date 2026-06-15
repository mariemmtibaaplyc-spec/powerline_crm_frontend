"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { getExportSourceTypeLabel } from "@/features/admin-exports/mocks/admin-exports.mock";
import type { ExportRecord } from "@/types/export.types";
import { ExportStatusBadge } from "@/components/admin-exports/export-status-badge";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function ExportsTable({ exports }: { exports: ExportRecord[] }) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Nom export</TableHeadCell>
            <TableHeadCell>Source</TableHeadCell>
            <TableHeadCell>Modele utilise</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell>Volume</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {exports.map((item) => (
            <tr key={item.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-[#102033]">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                    {item.format === "csv" ? "CSV" : "Excel"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{item.sourceName}</p>
                  <p className="text-xs text-[#607287]">
                    {getExportSourceTypeLabel(item.sourceType)}
                  </p>
                </div>
              </TableCell>
              <TableCell>{item.modelName}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <ExportStatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.volume.toLocaleString("fr-FR")}</TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/contacts/exports/${item.id}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                  aria-label={`Voir ${item.name}`}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
