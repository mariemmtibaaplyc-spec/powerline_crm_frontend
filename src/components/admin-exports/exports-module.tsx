"use client";

import { Download, FileSpreadsheet, Search, Sparkles, TimerReset } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EXPORT_STATUS_OPTIONS } from "@/features/admin-exports/mocks/admin-exports.mock";
import { useAdminExports } from "@/features/admin-exports/hooks/use-admin-exports";
import type { ExportStatus } from "@/types/export.types";
import { ExportsTable } from "@/components/admin-exports/exports-table";
import { ExportStatusBadge } from "@/components/admin-exports/export-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ExportsModule() {
  const { exports } = useAdminExports();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ExportStatus>("all");

  const filteredExports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exports.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.sourceName.toLowerCase().includes(query) ||
        item.modelName.toLowerCase().includes(query) ||
        item.generatedFile.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [exports, search, statusFilter]);

  const completedCount = exports.filter((item) => item.status === "completed").length;
  const totalVolume = exports.reduce((sum, item) => sum + item.volume, 0);
  const scheduledCount = exports.filter((item) => item.status === "scheduled").length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Exportations"
        description="Suivi admin V1 des exports CRM depuis les campagnes, listes, contacts et lots deja prepares dans Powerline."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f7d9b5] bg-[#fff7ed] px-3 py-2 text-sm font-medium text-[#8a5425] shadow-[0_10px_22px_rgba(138,84,37,0.08)]">
              <Sparkles className="h-4 w-4 text-[#f09c43]" />
              Vue export admin
            </span>
            <Link
              href="/admin/contacts/exports/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Nouvelle exportation
            </Link>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard
          icon={Download}
          label="Exports terminees"
          value={String(completedCount)}
          detail="Lots deja generes pour les equipes CRM"
          tone="from-[#eef7ff] to-[#edf3ff]"
          iconTone="bg-[#2d6fcb]/12 text-[#2d6fcb]"
        />
        <SummaryCard
          icon={FileSpreadsheet}
          label="Volume total"
          value={totalVolume.toLocaleString("fr-FR")}
          detail="Lignes mockees preparees sur l historique"
          tone="from-[#effbf7] to-[#eefaf7]"
          iconTone="bg-[#0f6a66]/12 text-[#0f6a66]"
        />
        <SummaryCard
          icon={TimerReset}
          label="Exports programmees"
          value={String(scheduledCount)}
          detail="Lots en attente de declenchement ou de relecture"
          tone="from-[#fff8ec] to-[#fff3e7]"
          iconTone="bg-[#f09c43]/14 text-[#b96b1f]"
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
                placeholder="Rechercher par nom export, source, modele ou fichier..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value as "all" | ExportStatus)}
            >
              <option value="all">Tous les statuts</option>
              {EXPORT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[#607287]">
            <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
              {filteredExports.length} exportations affichees
            </span>
            {statusFilter !== "all" ? <ExportStatusBadge status={statusFilter} /> : null}
          </div>

          {filteredExports.length > 0 ? (
            <ExportsTable exports={filteredExports} />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucune exportation ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou le filtre de statut pour retrouver un lot d export CRM.
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
  icon: typeof Download;
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
          Export
        </span>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#102033]">{value}</p>
      <p className="mt-1 text-sm text-[#607287]">{detail}</p>
    </div>
  );
}
