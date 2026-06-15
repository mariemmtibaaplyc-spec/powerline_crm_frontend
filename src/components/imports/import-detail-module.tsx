"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { getDeduplicationLabel, getImportScopeLabel } from "@/features/imports/mocks/imports.mock";
import { useImports } from "@/features/imports/hooks/use-imports";
import { FilePreview } from "@/components/imports/file-preview";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function isImportProcessingStatus(status: string | undefined) {
  const normalized = status?.trim().toUpperCase();
  return normalized === "PENDING" || normalized === "PROCESSING" || normalized === "QUEUED" || normalized === "RUNNING";
}

function isImportTerminalStatus(status: string | undefined) {
  const normalized = status?.trim().toUpperCase();
  return normalized === "DONE" || normalized === "FAILED" || normalized === "CANCELLED" || normalized === "CANCELED";
}

export function ImportDetailModule() {
  const params = useParams<{ id: string }>();
  const { getImportById, importDetailErrors, loadingImportIds, loadImportById } = useImports();
  const item = getImportById(params.id);
  const error = importDetailErrors[params.id];
  const isLoading = loadingImportIds[params.id] ?? false;
  const isProcessing = isImportProcessingStatus(item?.backendStatus) || (!item?.backendStatus && item?.status === "processing");

  useEffect(() => {
    if (params.id) {
      void loadImportById(params.id, true);
    }
  }, [loadImportById, params.id]);

  useEffect(() => {
    if (!params.id || !item || !isProcessing) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadImportById(params.id, true);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isProcessing, item, loadImportById, params.id]);

  useEffect(() => {
    if (!params.id || !item?.backendStatus || !isImportTerminalStatus(item.backendStatus)) {
      return;
    }

    void loadImportById(params.id, true);
  }, [item?.backendStatus, loadImportById, params.id]);

  if (isLoading && !item) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Chargement du detail de l import...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !item) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Import introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={item.name}
        description="Detail d import admin V1 avec campagne, dedoublonnage et statistiques finales."
        actions={
          <Link
            href="/admin/imports"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour imports
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume import</CardTitle>
            <CardDescription>Informations essentielles du lot importe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing ? (
              <div className="rounded-[1.25rem] border border-[#f4dfbf] bg-[linear-gradient(180deg,#fff9ef_0%,#fff4e2_100%)] px-4 py-4 text-[#8a5425]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Import en cours...</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d08b38]" />
                  <p className="text-sm leading-6">
                    Le worker backend traite encore ce fichier. Les statistiques se mettront a jour automatiquement.
                  </p>
                </div>
              </div>
            ) : null}
            <Metric label="Fichier source" value={item.sourceFile} />
            <Metric label="Campagne" value={item.campaign} />
            <Metric label="Liste associee" value={item.listName} />
            <Metric label="Date" value={item.date} />
            <Metric label="Perimetre" value={getImportScopeLabel(item.scope)} />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <ImportStatusBadge status={item.status} />
              </div>
            </div>
            <Metric
              label="Dedoublonnage"
              value={
                item.deduplicationMode === "specific_list" && item.deduplicationListName
                  ? `${getDeduplicationLabel(item.deduplicationMode)} • ${item.deduplicationListName}`
                  : getDeduplicationLabel(item.deduplicationMode)
              }
            />
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resultat de fin d importation</CardTitle>
            <CardDescription>Lecture finale des volumes valides, doublons et faux numeros.</CardDescription>
          </CardHeader>
          <CardContent>
            <FilePreview result={item} compact />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#24415d]">{value}</p>
    </div>
  );
}
