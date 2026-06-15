"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLists } from "@/features/lists/hooks/use-lists";
import type { ListFormValues } from "@/types/list.types";
import { ListForm } from "@/components/lists/list-form";
import { PageHeader } from "@/components/layout/page-header";

export function ListCreateModule() {
  const router = useRouter();
  const { createList } = useLists();

  const handleSubmit = (values: ListFormValues) => {
    const id = createList(values);
    router.push(`/admin/lists/${id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Creer une liste"
        description="Creation V1 d une liste CRM admin avec source, campagne, statut et volumetrie."
        actions={
          <Link
            href="/admin/lists"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
        }
      />
      <ListForm mode="create" onSubmit={handleSubmit} />
    </section>
  );
}
