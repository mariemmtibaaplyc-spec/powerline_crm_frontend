"use client";

import { ArrowLeft, FileCog } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ExportTemplateFormValues } from "@/types/export-template.types";
import { useAdminExportTemplates } from "@/features/admin-export-templates/hooks/use-admin-export-templates";
import { ExportTemplateForm } from "@/components/admin-export-templates/export-template-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ExportTemplateEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getTemplateById, updateTemplate } = useAdminExportTemplates();
  const template = getTemplateById(params.id);

  if (!template) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Modele introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  const initialValues: ExportTemplateFormValues = {
    name: template.name,
    source: template.source,
    format: template.format,
    fields: template.fields.join(", "),
    status: template.status,
  };

  const handleSubmit = (values: ExportTemplateFormValues) => {
    updateTemplate(template.id, values);
    router.push(`/admin/contacts/export-templates/${template.id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier le modele"
        description="Edition V1 d un modele d exportation simple et reutilisable."
        actions={
          <>
            <Link
              href={`/admin/contacts/export-templates/${template.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour fiche
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <FileCog className="h-4 w-4 text-[#295086]" />
              Modele V1
            </span>
          </>
        }
      />
      <ExportTemplateForm mode="edit" initialValues={initialValues} onSubmit={handleSubmit} />
    </section>
  );
}
