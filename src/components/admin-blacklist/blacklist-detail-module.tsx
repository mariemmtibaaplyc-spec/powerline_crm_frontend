"use client";

import { ArrowLeft, Ban, CalendarClock, Hash, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminBlacklist } from "@/features/admin-blacklist/hooks/use-admin-blacklist";
import { BlacklistStatusBadge } from "@/components/admin-blacklist/blacklist-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BlacklistDetailModule() {
  const params = useParams<{ id: string }>();
  const {
    selectedEntry,
    selectedEntryError,
    isLoadingSelectedEntry,
    isDeactivatingEntry,
    loadEntryById,
    deactivateEntry,
  } = useAdminBlacklist();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!params.id) {
      return;
    }

    void loadEntryById(params.id, true);
  }, [loadEntryById, params.id]);

  if (isLoadingSelectedEntry) {
    return (
      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="py-10">
          <p className="text-sm text-[#5f7693]">Chargement de l entree blacklist...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedEntryError) {
    return (
      <Card className="border border-[#f2d5db] bg-[#fff7f9] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
        <CardContent className="py-10">
          <p className="text-sm text-[#b54f67]">{selectedEntryError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedEntry) {
    return (
      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="py-10">
          <p className="text-sm text-[#5f7693]">Entree blacklist introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  const handleConfirmDeactivate = async () => {
    setSubmitError(null);

    try {
      await deactivateEntry(selectedEntry.id);
      setIsConfirmOpen(false);
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
        title={selectedEntry.phone}
        description="Lecture backend simple d une entree blacklist CRM."
        actions={
          <>
            <Link
              href="/admin/blacklist"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            {selectedEntry.status === "active" ? (
              <button
                type="button"
                onClick={() => {
                  setSubmitError(null);
                  setIsConfirmOpen(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#f2d5db] bg-[#fff7f9] px-4 text-sm font-medium text-[#b54f67] shadow-[0_10px_22px_rgba(181,79,103,0.08)] transition hover:-translate-y-0.5 hover:bg-[#fff2f5]"
              >
                <Ban className="h-4 w-4" />
                Annuler blacklist
              </button>
            ) : null}
          </>
        }
      />
      {submitError ? (
        <Card className="border border-[#f2d5db] bg-[#fff7f9] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
          <CardContent className="py-4 text-sm text-[#b54f67]">{submitError}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume blacklist</CardTitle>
            <CardDescription>Statut backend, motif et traçabilite de l ajout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-[#f2d5db] bg-[linear-gradient(180deg,#fff8fa_0%,#fff3f6_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a6573]">Statut</p>
              <div className="mt-2">
                <BlacklistStatusBadge status={selectedEntry.status} />
              </div>
            </div>
            <Metric icon={Ban} label="Motif" value={selectedEntry.reason} />
            <Metric icon={CalendarClock} label="Date d ajout" value={selectedEntry.addedAt || "-"} />
            <Metric icon={Shield} label="Ajoute par" value={selectedEntry.addedBy || "-"} />
            {selectedEntry.removedAt ? (
              <Metric icon={CalendarClock} label="Annule le" value={selectedEntry.removedAt} />
            ) : null}
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Informations backend</CardTitle>
            <CardDescription>Champs reels exposes par l API blacklist.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoField label="Numero" value={selectedEntry.phone} />
            <InfoField label="Contact ID" value={selectedEntry.contactId ?? "-"} />
            <InfoField label="Annulation" value={selectedEntry.removedAt || "-"} />
            <InfoField label="Etat" value={selectedEntry.status === "active" ? "Blackliste" : "Non blackliste"} />
            <div className="md:col-span-2">
              <Metric icon={Hash} label="Identifiant backend" value={selectedEntry.id} />
            </div>
          </CardContent>
        </Card>
      </div>
      {isConfirmOpen ? (
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
              <p className="mt-2 text-base font-semibold text-[#142035]">{selectedEntry.phone}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full border border-[#dce6f0] bg-white text-[#24415d] hover:bg-[#f8fbff]"
                disabled={isDeactivatingEntry}
                onClick={() => setIsConfirmOpen(false)}
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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ban;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0f3] text-[#b54f67]">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-[#24415d]">{value}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#24415d]">{value}</p>
    </div>
  );
}
