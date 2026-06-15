"use client";

import { FileCog, FileSpreadsheet, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EXPORT_TEMPLATE_STATUS_OPTIONS } from "@/features/admin-export-templates/mocks/admin-export-templates.mock";
import { useAdminExportTemplates } from "@/features/admin-export-templates/hooks/use-admin-export-templates";
import type { ExportTemplateStatus } from "@/types/export-template.types";
import { ExportTemplateStatusBadge } from "@/components/admin-export-templates/export-template-status-badge";
import { ExportTemplatesTable } from "@/components/admin-export-templates/export-templates-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ExportTemplatesModule() {
  const { templates, toggleTemplateStatus } = useAdminExportTemplates();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ExportTemplateStatus>("all");

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        query.length === 0 ||
        template.name.toLowerCase().includes(query) ||
        template.fields.join(", ").toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || template.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, templates]);

  const activeCount = templates.filter((template) => template.status === "active").length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modeles d exportation"
        description="Bibliotheque V1 de modeles simples pour structurer les exports CRM sans builder complexe."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <Sparkles className="h-4 w-4 text-[#295086]" />
              {activeCount} actifs
            </span>
            <Link
              href="/admin/contacts/export-templates/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Creer un modele
            </Link>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <SummaryCard
          icon={FileCog}
          label="Modeles disponibles"
          value={String(templates.length)}
          detail="Bibliotheque admin reutilisable"
          tone="from-[#eef7ff] to-[#edf3ff]"
          iconTone="bg-[#2d6fcb]/12 text-[#2d6fcb]"
        />
        <SummaryCard
          icon={FileSpreadsheet}
          label="Modeles actifs"
          value={String(activeCount)}
          detail="Prets a etre relies aux exportations"
          tone="from-[#effbf7] to-[#eefaf7]"
          iconTone="bg-[#0f6a66]/12 text-[#0f6a66]"
        />
      </div>

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher par nom ou champs inclus..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value as "all" | ExportTemplateStatus)}
            >
              <option value="all">Tous les statuts</option>
              {EXPORT_TEMPLATE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[#607287]">
            <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
              {filteredTemplates.length} modeles affiches
            </span>
            {statusFilter !== "all" ? <ExportTemplateStatusBadge status={statusFilter} /> : null}
          </div>

          {filteredTemplates.length > 0 ? (
            <ExportTemplatesTable templates={filteredTemplates} onToggleStatus={toggleTemplateStatus} />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucun modele ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou le filtre de statut pour retrouver un modele d exportation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  iconTone,
}: {
  icon: typeof FileCog;
  label: string;
  value: string;
  detail: string;
  tone: string;
  iconTone: string;
}) {
  return (
    <div className={`rounded-[1.35rem] border border-[#e6edf6] bg-gradient-to-br ${tone} px-4 py-4 shadow-[0_14px_30px_rgba(20,32,53,0.06)]`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7e92]">
          Modele
        </span>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#102033]">{value}</p>
      <p className="mt-1 text-sm text-[#607287]">{detail}</p>
    </div>
  );
}
