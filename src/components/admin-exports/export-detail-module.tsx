"use client";

import { ArrowLeft, Download, FileSpreadsheet, Files, Link2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getExportSourceTypeLabel,
} from "@/features/admin-exports/mocks/admin-exports.mock";
import { useAdminExports } from "@/features/admin-exports/hooks/use-admin-exports";
import { ExportStatusBadge } from "@/components/admin-exports/export-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ExportDetailModule() {
  const params = useParams<{ id: string }>();
  const { getExportById } = useAdminExports();
  const item = getExportById(params.id);

  if (!item) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Exportation introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={item.name}
        description="Fiche detaillee d une exportation admin avec source, modele, volume et fichier mocke genere."
        actions={
          <Link
            href="/admin/contacts/exports"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume export</CardTitle>
            <CardDescription>Lecture rapide du lot, de son statut et du fichier genere.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(135deg,#f8fbff_0%,#f3faf8_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <ExportStatusBadge status={item.status} />
              </div>
            </div>
            <Metric icon={Files} label="Source" value={item.sourceName} helper={getExportSourceTypeLabel(item.sourceType)} />
            <Metric icon={FileSpreadsheet} label="Modele" value={item.modelName} helper={item.format === "csv" ? "Format CSV" : "Format Excel"} />
            <Metric icon={Download} label="Fichier genere" value={item.generatedFile} helper={`${item.volume.toLocaleString("fr-FR")} lignes`} />
            <Metric icon={Link2} label="Date / heure" value={item.date} helper="Horodatage mocke de l export" />
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-3">
            <ColorStat
              label="Volume"
              value={item.volume.toLocaleString("fr-FR")}
              tone="from-[#eef7ff] to-[#edf3ff]"
              text="text-[#295086]"
            />
            <ColorStat
              label="Source liee"
              value={item.linkedList ? "Liste" : item.linkedCampaign ? "Campagne" : "Repertoire"}
              tone="from-[#effbf7] to-[#eefaf7]"
              text="text-[#0f6a66]"
            />
            <ColorStat
              label="Lot importe"
              value={item.linkedImport ? "Associe" : "Aucun"}
              tone="from-[#fff8ec] to-[#fff3e7]"
              text="text-[#b96b1f]"
            />
          </div>

          <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
            <CardHeader>
              <CardTitle>Details metier</CardTitle>
              <CardDescription>Elements utiles pour relire la coherence de l export dans le cockpit CRM.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <InfoField label="Campagne liee" value={item.linkedCampaign ?? "Aucune campagne"} />
              <InfoField label="Liste liee" value={item.linkedList ?? "Aucune liste"} />
              <InfoField label="Import associe" value={item.linkedImport ?? "Aucun import"} />
              <InfoField label="Format" value={item.format === "csv" ? "CSV" : "Excel"} />
              <div className="md:col-span-2">
                <InfoField label="Resume metier" value={item.summary} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Files;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef6ff] text-[#295086]">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      </div>
      <p className="mt-3 text-sm font-medium text-[#24415d]">{value}</p>
      <p className="mt-1 text-xs text-[#607287]">{helper}</p>
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

function ColorStat({
  label,
  value,
  tone,
  text,
}: {
  label: string;
  value: string;
  tone: string;
  text: string;
}) {
  return (
    <div className={`rounded-[1.25rem] border border-[#e6edf6] bg-gradient-to-br ${tone} px-4 py-4`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${text}`}>{value}</p>
    </div>
  );
}
