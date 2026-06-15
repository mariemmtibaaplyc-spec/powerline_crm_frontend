"use client";

import { ArrowLeft, FileCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ExportTemplateFormValues } from "@/types/export-template.types";
import { useAdminExportTemplates } from "@/features/admin-export-templates/hooks/use-admin-export-templates";
import { ExportTemplateForm } from "@/components/admin-export-templates/export-template-form";
import { PageHeader } from "@/components/layout/page-header";

export function ExportTemplateCreateModule() {
  const router = useRouter();
  const { createTemplate } = useAdminExportTemplates();

  const handleSubmit = (values: ExportTemplateFormValues) => {
    const id = createTemplate(values);
    router.push(`/admin/contacts/export-templates/${id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Creer un modele d exportation"
        description="Ajout V1 d un modele simple pour accelerer les futures exportations CRM."
        actions={
          <>
            <Link
              href="/admin/contacts/export-templates"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <FileCog className="h-4 w-4 text-[#295086]" />
              Modele V1
            </span>
          </>
        }
      />
      <ExportTemplateForm mode="create" onSubmit={handleSubmit} />
    </section>
  );
}
