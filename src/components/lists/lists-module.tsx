"use client";

import { Database, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getListTypeLabel, LIST_STATUS_OPTIONS, LIST_TYPE_OPTIONS } from "@/features/lists/mocks/lists.mock";
import { useLists } from "@/features/lists/hooks/use-lists";
import type { ListStatus, ListType } from "@/types/list.types";
import { ListStatusBadge } from "@/components/lists/list-status-badge";
import { ListsTable } from "@/components/lists/lists-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";

export function ListsModule() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ListType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ListStatus>("all");
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      q: search.trim() || undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [page, search, statusFilter, typeFilter],
  );
  const {
    lists,
    listsError,
    listsMeta,
    isLoadingLists,
    isUpdatingListStatus,
    listStatusUpdateError,
    updateListStatusAction,
  } = useLists(queryParams);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const readyCount = lists.filter((list) => list.status === "ready").length;
  const totalContacts = lists.reduce((sum, list) => sum + list.contactsCount, 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Listes"
        description="Gestion admin V1 des listes CRM, imports, segments de relance et bases attachees aux campagnes."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <Database className="h-4 w-4 text-[#295086]" />
              {lists.length} listes
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9eee9] bg-[#f3fbf8] px-3 py-2 text-sm font-medium text-[#0f6a66] shadow-[0_10px_22px_rgba(15,106,102,0.08)]">
              {readyCount} pretes
            </span>
            <Link
              href="/admin/lists/create"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Creer une liste
            </Link>
          </>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.2fr_220px_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher par nom, source, campagne ou description..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={typeFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setTypeFilter(event.target.value as "all" | ListType)}
            >
              <option value="all">Tous les types</option>
              {LIST_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value as "all" | ListStatus)}
            >
              <option value="all">Tous les statuts</option>
              {LIST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="Listes filtrees" value={String(lists.length)} detail="Vue active du catalogue admin" />
            <SummaryCard label="Contacts cumules" value={totalContacts.toLocaleString("fr-FR")} detail="Volumetrie de la page courante" />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Filtre courant</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                  {typeFilter === "all" ? "Tous types" : getListTypeLabel(typeFilter)}
                </span>
                {statusFilter !== "all" ? <ListStatusBadge status={statusFilter} /> : null}
              </div>
            </div>
          </div>

          {listsError ? (
            <div className="rounded-[1.25rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
              {listsError}
            </div>
          ) : null}

          {listStatusUpdateError ? (
            <div className="rounded-[1.25rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
              {listStatusUpdateError}
            </div>
          ) : null}

          {isLoadingLists ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Chargement des listes...</p>
            </div>
          ) : lists.length > 0 ? (
            <>
              <ListsTable
                lists={lists}
                isUpdatingStatus={isUpdatingListStatus}
                onUpdateStatus={(id, status) => void updateListStatusAction(id, status)}
              />
              <Pagination
                currentPage={listsMeta.page}
                totalPages={listsMeta.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucune liste ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou les filtres pour retrouver une liste du catalogue CRM.
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
