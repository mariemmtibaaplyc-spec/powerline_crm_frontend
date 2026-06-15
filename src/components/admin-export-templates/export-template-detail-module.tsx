"use client";

import { ArrowLeft, FileCog, PenSquare, Power } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getExportTemplateSourceLabel } from "@/features/admin-export-templates/mocks/admin-export-templates.mock";
import { useAdminExportTemplates } from "@/features/admin-export-templates/hooks/use-admin-export-templates";
import { ExportTemplateStatusBadge } from "@/components/admin-export-templates/export-template-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ExportTemplateDetailModule() {
  const params = useParams<{ id: string }>();
  const { getTemplateById, toggleTemplateStatus } = useAdminExportTemplates();
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

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={template.name}
        description="Fiche simple d un modele d exportation admin avec structure, source et statut."
        actions={
          <>
            <Link
              href="/admin/contacts/export-templates"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <Link
              href={`/admin/contacts/export-templates/${template.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <PenSquare className="h-4 w-4" />
              Modifier
            </Link>
            <button
              type="button"
              onClick={() => toggleTemplateStatus(template.id)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <Power className="h-4 w-4" />
              {template.status === "active" ? "Desactiver" : "Activer"}
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume modele</CardTitle>
            <CardDescription>Vue rapide du statut, de la source et du format de sortie.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <ExportTemplateStatusBadge status={template.status} />
              </div>
            </div>
            <Metric icon={FileCog} label="Source" value={getExportTemplateSourceLabel(template.source)} />
            <Metric label="Format" value={template.format === "csv" ? "CSV" : "Excel"} />
            <Metric label="Date de creation" value={template.createdAt} />
            <Metric label="Ajoute par" value={template.createdBy} />
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Champs inclus</CardTitle>
            <CardDescription>Liste simple des colonnes retenues dans le modele V1.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {template.fields.map((field) => (
                <span
                  key={field}
                  className="inline-flex rounded-full bg-[#eef6ff] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#295086]"
                >
                  {field}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof FileCog;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef6ff] text-[#295086]">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-[#24415d]">{value}</p>
    </div>
  );
}
