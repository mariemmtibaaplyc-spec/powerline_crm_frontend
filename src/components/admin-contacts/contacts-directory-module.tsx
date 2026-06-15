"use client";

import { ContactRound, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAdminContacts } from "@/features/admin-contacts/hooks/use-admin-contacts";
import { ContactsTable } from "@/components/admin-contacts/contacts-table";
import { ContactStatusBadge } from "@/components/admin-contacts/contact-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";

const UNKNOWN_STATUS_FILTER = "UNKNOWN";

function isUnknownContactStatus(status: string | null | undefined) {
  if (typeof status !== "string") {
    return true;
  }

  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus.length === 0 || normalizedStatus === "unknown";
}

export function ContactsDirectoryModule() {
  const {
    contacts,
    contactsMeta,
    isLoadingContacts,
    contactsError,
    loadContacts,
  } = useAdminContacts();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const statusQueryParam =
    statusFilter !== "all" && statusFilter !== UNKNOWN_STATUS_FILTER ? statusFilter : undefined;

  useEffect(() => {
    setPage(1);
  }, [search, sourceFilter, statusFilter, cityFilter]);

  useEffect(() => {
    void loadContacts({
      q: search.trim() || undefined,
      status: statusQueryParam,
      source: sourceFilter === "all" ? undefined : sourceFilter,
      city: cityFilter === "all" ? undefined : cityFilter,
      page,
      limit: 10,
      sortBy: "created_at",
      order: "desc",
    });
  }, [cityFilter, loadContacts, page, search, sourceFilter, statusQueryParam]);

  const uniqueStatuses = useMemo(
    () =>
      Array.from(
        new Set(
          contacts
            .map((contact) => contact.backendStatus)
            .filter((status): status is string => typeof status === "string" && status.length > 0),
        ),
      ).sort(),
    [contacts],
  );
  const filteredContacts = useMemo(() => {
    if (statusFilter !== UNKNOWN_STATUS_FILTER) {
      return contacts;
    }

    return contacts.filter(
      (contact) =>
        isUnknownContactStatus(contact.backendStatus) || isUnknownContactStatus(contact.status),
    );
  }, [contacts, statusFilter]);
  const uniqueSources = useMemo(
    () =>
      Array.from(
        new Set(
          contacts
            .map((contact) => contact.source)
            .filter((source): source is string => typeof source === "string" && source.length > 0),
        ),
      ).sort(),
    [contacts],
  );
  const uniqueCities = useMemo(
    () =>
      Array.from(
        new Set(
          contacts
            .map((contact) => contact.city)
            .filter((city): city is string => typeof city === "string" && city.length > 0),
        ),
      ).sort(),
    [contacts],
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Repertoire de contacts"
        description="Répertoire des contacts synchronisés depuis le backend avec filtres et pagination réels."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <ContactRound className="h-4 w-4 text-[#295086]" />
              {contactsMeta.total} contacts
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              Page {contactsMeta.page}/{contactsMeta.totalPages}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              {uniqueSources.length} sources visibles
            </span>
          </>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.3fr_220px_220px_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher un contact..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={statusFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value={UNKNOWN_STATUS_FILTER}>{UNKNOWN_STATUS_FILTER}</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Select
              value={sourceFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">Toutes les sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </Select>
            <Select
              value={cityFilter}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => setCityFilter(event.target.value)}
            >
              <option value="all">Toutes les villes</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[#607287]">
            <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
              {filteredContacts.length} contacts affichés
            </span>
            {statusFilter !== "all" ? <ContactStatusBadge status={statusFilter} /> : null}
            {sourceFilter !== "all" ? (
              <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                {sourceFilter}
              </span>
            ) : null}
            {cityFilter !== "all" ? (
              <span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#607287]">
                {cityFilter}
              </span>
            ) : null}
          </div>

          {contactsError ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#f0d8de] bg-[#fff8fa] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Impossible de charger les contacts.</p>
              <p className="mt-2 text-sm text-[#8a5a67]">{contactsError}</p>
            </div>
          ) : isLoadingContacts ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Chargement des contacts en cours...</p>
              <p className="mt-2 text-sm text-[#607287]">Les contacts sont récupérés depuis le backend.</p>
            </div>
          ) : filteredContacts.length > 0 ? (
            <>
              <ContactsTable contacts={filteredContacts} />
              <Pagination
                currentPage={contactsMeta.page}
                totalPages={contactsMeta.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucun contact ne correspond à la requête actuelle.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche ou les filtres pour retrouver une fiche du répertoire backend.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
