"use client";

import { ArrowLeft, Ban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BlacklistFormValues } from "@/types/blacklist.types";
import { useAdminBlacklist } from "@/features/admin-blacklist/hooks/use-admin-blacklist";
import { BlacklistForm } from "@/components/admin-blacklist/blacklist-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function BlacklistCreateModule() {
  const router = useRouter();
  const { createEntry } = useAdminBlacklist();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingValues, setPendingValues] = useState<BlacklistFormValues | null>(null);

  const handleSubmit = (values: BlacklistFormValues) => {
    setSubmitError(null);
    setPendingValues(values);
  };

  const handleConfirm = async () => {
    if (!pendingValues) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createEntry(pendingValues);
      setPendingValues(null);
      router.push("/admin/blacklist");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Impossible d ajouter cette entree blacklist.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Ajouter un numero blacklist"
        description="Ajout V1 d une exclusion CRM avec motif, statut et contexte de diffusion."
        actions={
          <>
            <Link
              href="/admin/blacklist"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d5db] bg-[#fff7f9] px-3 py-2 text-sm font-medium text-[#b54f67] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
              <Ban className="h-4 w-4 text-[#d95a78]" />
              Exclusion V1
            </span>
          </>
        }
      />
      {submitError ? (
        <Card className="border border-[#f2d5db] bg-[#fff7f9] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
          <CardContent className="py-4 text-sm text-[#b54f67]">{submitError}</CardContent>
        </Card>
      ) : null}
      <BlacklistForm mode="create" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      {pendingValues ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06101fcc]/70 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] border border-[#243b57] bg-white p-6 shadow-[0_28px_80px_rgba(6,16,31,0.28)]">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff1ec_0%,#ffe5da_100%)] text-[#d46f4d] shadow-[0_12px_24px_rgba(212,111,77,0.18)]">
              <Ban className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#142035]">Confirmer l ajout a la liste noire</h2>
              <p className="text-sm leading-6 text-[#5f7693]">
                Ce numero sera exclu des prochains appels.
              </p>
            </div>
            <div className="mt-5 rounded-2xl border border-[#dce6f0] bg-[#f8fbff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8fa8]">Numero concerne</p>
              <p className="mt-2 text-base font-semibold text-[#142035]">{pendingValues.phone}</p>
              {pendingValues.reason?.trim() ? (
                <p className="mt-1 text-sm text-[#5f7693]">{pendingValues.reason.trim()}</p>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full border border-[#dce6f0] bg-white text-[#24415d] hover:bg-[#f8fbff]"
                disabled={isSubmitting}
                onClick={() => setPendingValues(null)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[linear-gradient(135deg,#1d2f46_0%,#2a4b73_100%)] px-5 text-white shadow-[0_14px_30px_rgba(29,47,70,0.22)] hover:opacity-95"
                disabled={isSubmitting}
                onClick={handleConfirm}
              >
                {isSubmitting ? "Enregistrement..." : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
