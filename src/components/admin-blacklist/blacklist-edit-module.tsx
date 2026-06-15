"use client";

import { ArrowLeft, Ban } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { BlacklistFormValues } from "@/types/blacklist.types";
import { useAdminBlacklist } from "@/features/admin-blacklist/hooks/use-admin-blacklist";
import { BlacklistForm } from "@/components/admin-blacklist/blacklist-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function BlacklistEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    selectedEntry,
    selectedEntryError,
    isLoadingSelectedEntry,
    loadEntryById,
    updateEntry,
  } = useAdminBlacklist();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const initialValues: BlacklistFormValues = {
    phone: selectedEntry.phone,
    reason: selectedEntry.reason === "Non renseigne" ? "" : selectedEntry.reason,
    contactId: selectedEntry.contactId ?? "",
  };

  const handleSubmit = async (values: BlacklistFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await updateEntry(selectedEntry.id, values);
      router.push(`/admin/blacklist/${selectedEntry.id}`);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Impossible de modifier cette entree blacklist.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier l entree blacklist"
        description="Edition backend simple d un numero blacklisté."
        actions={
          <>
            <Link
              href={`/admin/blacklist/${selectedEntry.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour fiche
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d5db] bg-[#fff7f9] px-3 py-2 text-sm font-medium text-[#b54f67] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
              <Ban className="h-4 w-4 text-[#d95a78]" />
              Edition backend
            </span>
          </>
        }
      />
      {submitError ? (
        <Card className="border border-[#f2d5db] bg-[#fff7f9] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
          <CardContent className="py-4 text-sm text-[#b54f67]">{submitError}</CardContent>
        </Card>
      ) : null}
      <BlacklistForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
