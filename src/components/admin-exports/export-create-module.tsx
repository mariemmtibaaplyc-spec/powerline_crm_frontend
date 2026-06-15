"use client";

import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ExportFormValues } from "@/types/export.types";
import { useAdminExports } from "@/features/admin-exports/hooks/use-admin-exports";
import { ExportForm } from "@/components/admin-exports/export-form";
import { PageHeader } from "@/components/layout/page-header";

export function ExportCreateModule() {
  const router = useRouter();
  const { createExport } = useAdminExports();

  const handleSubmit = (values: ExportFormValues) => {
    const record = createExport(values);
    router.push(`/admin/contacts/exports/${record.id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Nouvelle exportation"
        description="Lance une exportation mockee depuis une campagne, une liste ou le repertoire admin de contacts."
        actions={
          <>
            <Link
              href="/admin/contacts/exports"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <FileSpreadsheet className="h-4 w-4 text-[#295086]" />
              Export V1
            </span>
          </>
        }
      />
      <ExportForm onSubmit={handleSubmit} />
    </section>
  );
}
