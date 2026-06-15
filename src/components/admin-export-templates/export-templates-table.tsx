"use client";

import { Eye, PenSquare, Power } from "lucide-react";
import Link from "next/link";
import { getExportTemplateSourceLabel } from "@/features/admin-export-templates/mocks/admin-export-templates.mock";
import type { ExportTemplateRecord } from "@/types/export-template.types";
import { ExportTemplateStatusBadge } from "@/components/admin-export-templates/export-template-status-badge";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function ExportTemplatesTable({
  templates,
  onToggleStatus,
}: {
  templates: ExportTemplateRecord[];
  onToggleStatus: (id: string) => void;
}) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Nom du modele</TableHeadCell>
            <TableHeadCell>Source</TableHeadCell>
            <TableHeadCell>Format</TableHeadCell>
            <TableHeadCell>Champs inclus</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell className="text-right">Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-[#102033]">{template.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                    Cree le {template.createdAt}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                  {getExportTemplateSourceLabel(template.source)}
                </span>
              </TableCell>
              <TableCell>{template.format === "csv" ? "CSV" : "Excel"}</TableCell>
              <TableCell>
                <p className="max-w-[300px] truncate text-sm text-[#24415d]">
                  {template.fields.join(", ")}
                </p>
              </TableCell>
              <TableCell>
                <ExportTemplateStatusBadge status={template.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/contacts/export-templates/${template.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Voir ${template.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/contacts/export-templates/${template.id}/edit`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                    aria-label={`Modifier ${template.name}`}
                  >
                    <PenSquare className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(template.id)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#24415d] shadow-[0_10px_20px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:bg-[#f7fbff]"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {template.status === "active" ? "Desactiver" : "Activer"}
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
