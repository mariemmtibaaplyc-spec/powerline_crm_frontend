"use client";

import { Ban, CalendarDays, Search, ShieldAlert, Siren, UserX2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BlacklistRecord } from "@/types/blacklist.types";
import { useAdminBlacklist } from "@/features/admin-blacklist/hooks/use-admin-blacklist";
import { BlacklistTable } from "@/components/admin-blacklist/blacklist-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BlacklistModule() {
  const { entries, blacklistError, isLoadingBlacklist, isDeactivatingEntry, loadBlacklist, deactivateEntry } =
    useAdminBlacklist();
  const [search, setSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingEntry, setPendingEntry] = useState<BlacklistRecord | null>(null);

  useEffect(() => {
    const phone = search.trim();
    void loadBlacklist(phone ? { phone } : {});
  }, [loadBlacklist, search]);

  const activeCount = entries.filter((entry) => entry.status === "active").length;
  const inactiveCount = entries.filter((entry) => entry.status === "inactive").length;
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCount = useMemo(
    () => entries.filter((entry) => entry.addedAt.slice(0, 10) === todayIso).length,
    [entries, todayIso],
  );

  const handleConfirmDeactivate = async () => {
    if (!pendingEntry) {
      return;
    }

    setSubmitError(null);

    try {
      await deactivateEntry(pendingEntry.id);
      setPendingEntry(null);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Impossible d annuler cette entree blacklist.";
      setSubmitError(message);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Listes rouges"
        description="Pilotage V1 des numeros exclus des diffusions CRM pour opposition contact, conformite et hygiene de base."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d5db] bg-[#fff7f9] px-3 py-2 text-sm font-medium text-[#b54f67] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
              <Siren className="h-4 w-4 text-[#d95a78]" />
              Controle blacklist
            </span>
            <Link
              href="/admin/blacklist/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Ajouter un numero
            </Link>
          </>
        }
      />
      {submitError ? (
        <Card className="border border-[#f2d5db] bg-[#fff7f9] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
          <CardContent className="py-4 text-sm text-[#b54f67]">{submitError}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          icon={Ban}
          label="Total blacklistes"
          value={String(entries.length)}
          detail="Entrees historisees dans le CRM"
          tone="from-[#fff7f9] to-[#fff1f5]"
          iconTone="bg-[#d95a78]/14 text-[#b54f67]"
        />
        <SummaryCard
          icon={ShieldAlert}
          label="Actifs"
          value={String(activeCount)}
          detail="Blocages actuellement appliques"
          tone="from-[#fff8ec] to-[#fff3e7]"
          iconTone="bg-[#f09c43]/14 text-[#b96b1f]"
        />
        <SummaryCard
          icon={UserX2}
          label="Inactifs"
          value={String(inactiveCount)}
          detail="Entrees conservees hors blocage actif"
          tone="from-[#eef5fb] to-[#eef2fb]"
          iconTone="bg-[#6b7e92]/14 text-[#5f738a]"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Ajoutes aujourd hui"
          value={String(todayCount)}
          detail="Ajouts admin du jour"
          tone="from-[#effbf7] to-[#eefaf7]"
          iconTone="bg-[#0f6a66]/12 text-[#0f6a66]"
        />
      </div>

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher par numero..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-[#607287]">
            <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
              {entries.length} numeros affiches
            </span>
          </div>

          {blacklistError ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">{blacklistError}</p>
            </div>
          ) : isLoadingBlacklist ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Chargement de la blacklist...</p>
            </div>
          ) : entries.length > 0 ? (
            <BlacklistTable
              entries={entries}
              onDeactivate={(entry) => {
                setSubmitError(null);
                setPendingEntry(entry);
              }}
              deactivatingEntryId={isDeactivatingEntry && pendingEntry ? pendingEntry.id : null}
            />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#102033]">Aucune entree blacklist ne correspond aux filtres actuels.</p>
              <p className="mt-2 text-sm text-[#607287]">
                Ajuste la recherche par numero pour retrouver une entree backend.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {pendingEntry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06101fcc]/70 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] border border-[#243b57] bg-white p-6 shadow-[0_28px_80px_rgba(6,16,31,0.28)]">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff1ec_0%,#ffe5da_100%)] text-[#d46f4d] shadow-[0_12px_24px_rgba(212,111,77,0.18)]">
              <Ban className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#142035]">Annuler le blacklistage ?</h2>
              <p className="text-sm leading-6 text-[#5f7693]">Ce numero pourra de nouveau etre contacté.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-[#dce6f0] bg-[#f8fbff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8fa8]">Numero concerne</p>
              <p className="mt-2 text-base font-semibold text-[#142035]">{pendingEntry.phone}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full border border-[#dce6f0] bg-white text-[#24415d] hover:bg-[#f8fbff]"
                disabled={isDeactivatingEntry}
                onClick={() => setPendingEntry(null)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[linear-gradient(135deg,#1d2f46_0%,#2a4b73_100%)] px-5 text-white shadow-[0_14px_30px_rgba(29,47,70,0.22)] hover:opacity-95"
                disabled={isDeactivatingEntry}
                onClick={handleConfirmDeactivate}
              >
                {isDeactivatingEntry ? "Annulation..." : "Confirmer l annulation"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
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
  icon: typeof Ban;
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
          Blacklist
        </span>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#102033]">{value}</p>
      <p className="mt-1 text-sm text-[#607287]">{detail}</p>
    </div>
  );
}
