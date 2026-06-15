"use client";

import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLists } from "@/features/lists/hooks/use-lists";
import type { ListFormValues } from "@/types/list.types";
import { ListForm } from "@/components/lists/list-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ListEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getListById, updateList } = useLists();
  const list = getListById(params.id);

  if (!list) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Liste introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  const initialValues: ListFormValues = {
    name: list.name,
    type: list.type,
    source: list.source,
    status: list.status,
    campaign: list.campaign,
    contactsCount: String(list.contactsCount),
    description: list.description,
  };

  const handleSubmit = (values: ListFormValues) => {
    updateList(list.id, values);
    router.push(`/admin/lists/${list.id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier liste"
        description="Mise a jour des informations de source, statut et rattachement campagne de la liste."
        actions={
          <>
            <Link
              href={`/admin/lists/${list.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour fiche
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <PenSquare className="h-4 w-4 text-[#295086]" />
              Edition V1
            </span>
          </>
        }
      />
      <ListForm mode="edit" initialValues={initialValues} onSubmit={handleSubmit} />
    </section>
  );
}
