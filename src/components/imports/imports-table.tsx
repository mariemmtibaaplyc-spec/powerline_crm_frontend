"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import type { ImportRecord } from "@/types/import.types";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function ImportsTable({ imports }: { imports: ImportRecord[] }) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Nom import</TableHeadCell>
            <TableHeadCell>Fichier / source</TableHeadCell>
            <TableHeadCell>Campagne</TableHeadCell>
            <TableHeadCell>Liste</TableHeadCell>
            <TableHeadCell>Date</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell>Total importe</TableHeadCell>
            <TableHeadCell>Doublons</TableHeadCell>
            <TableHeadCell>Faux num.</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {imports.map((item) => (
            <tr key={item.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-[#102033]">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                    Dedoublonnage {item.deduplicationMode.replaceAll("_", " ")}
                  </p>
                </div>
              </TableCell>
              <TableCell>{item.sourceFile}</TableCell>
              <TableCell>{item.campaign}</TableCell>
              <TableCell>{item.listName}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <ImportStatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.totalImported.toLocaleString("fr-FR")}</TableCell>
              <TableCell>{item.duplicates.toLocaleString("fr-FR")}</TableCell>
              <TableCell>{item.invalidPhones.toLocaleString("fr-FR")}</TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/imports/${item.id}`}
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
