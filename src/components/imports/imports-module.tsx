"use client";

import { FileUp, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IMPORT_STATUS_OPTIONS } from "@/features/imports/mocks/imports.mock";
import { useImports } from "@/features/imports/hooks/use-imports";
import type { ImportStatus } from "@/types/import.types";
import { ImportsTable } from "@/components/imports/imports-table";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ImportsModule() {
  const { imports, importsError } = useImports();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ImportStatus>("all");

  const filteredImports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return imports.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.sourceFile.toLowerCase().includes(query) ||
        item.campaign.toLowerCase().includes(query) ||
        item.listName.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [imports, search, statusFilter]);

  const completedCount = imports.filter((item) => item.status === "completed").length;
  const totalImported = imports.reduce((sum, item) => sum + item.totalImported, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Dernieres importations"
        description="Suivi V1 des imports CRM avec parcours dedoublonnage, rattachement campagne et statistiques de fin d importation."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <FileUp className="h-4 w-4 text-[#295086]" />
              {imports.length} imports
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9eee9] bg-[#f3fbf8] px-3 py-2 text-sm font-medium text-[#0f6a66] shadow-[0_10px_22px_rgba(15,106,102,0.08)]">
              {completedCount} termines
            </span>
            <Link
              href="/admin/imports/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Nouvel import
            </Link>
          </>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher par nom import, source, campagne ou liste..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value as "all" | ImportStatus)}
            >
              <option value="all">Tous les statuts</option>
              {IMPORT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="Imports filtres" value={String(filteredImports.length)} detail="Vue active de l historique d importation" />
            <SummaryCard label="Total importe" value={totalImported.toLocaleString("fr-FR")} detail="Contacts valides issus des imports backend" />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Filtre courant</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {statusFilter !== "all" ? <ImportStatusBadge status={statusFilter} /> : <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">Tous statuts</span>}
              </div>
            </div>
          </div>

          {importsError ? (
            <div className="rounded-[1.25rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
              {importsError}
            </div>
          ) : null}

          {filteredImports.length > 0 ? (
            <ImportsTable imports={filteredImports} />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucun import ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou le filtre de statut pour retrouver un lot recent.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#102033]">{value}</p>
      <p className="mt-1 text-sm text-[#607287]">{detail}</p>
    </div>
  );
}
