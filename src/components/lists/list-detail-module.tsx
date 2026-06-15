"use client";

import { ArrowLeft, PenSquare, RefreshCcw, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { getListTypeLabel } from "@/features/lists/mocks/lists.mock";
import { useLists } from "@/features/lists/hooks/use-lists";
import { ListStatusBadge } from "@/components/lists/list-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ListDetailModule() {
  const params = useParams<{ id: string }>();
  const {
    selectedList,
    isLoadingSelectedList,
    selectedListError,
    loadListById,
    isUpdatingListStatus,
    listStatusUpdateError,
    updateListStatusAction,
  } = useLists();
  const list = selectedList?.id === params.id ? selectedList : null;

  useEffect(() => {
    if (params.id) {
      void loadListById(params.id, true);
    }
  }, [loadListById, params.id]);

  if (isLoadingSelectedList && !list) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Chargement du detail de la liste...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedListError && !list) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">{selectedListError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!list) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Liste introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={list.name}
        description="Detail reel de la liste charge depuis le backend."
        actions={
          <>
            <Link
              href="/admin/lists"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <Link
              href={`/admin/lists/${list.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <PenSquare className="h-4 w-4" />
              Modifier
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume liste</CardTitle>
            <CardDescription>Vue rapide des donnees reelles de la liste CRM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Type" value={getListTypeLabel(list.type)} />
            <Metric label="Source" value={list.source || "-"} />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <ListStatusBadge status={list.status} />
              </div>
            </div>
            <Metric label="Campagne associee" value={list.campaign || "-"} />
            <Metric
              label="Volume total"
              value={
                list.hasContactsCount
                  ? list.contactsCount.toLocaleString("fr-FR")
                  : "Non disponible"
              }
            />
            <Metric label="Date de creation / import" value={list.importedAt || "-"} />
            <Metric label="Derniere mise a jour" value={list.updatedAt || "-"} />
            <Metric label="Imports lies" value={String(list.importsCount ?? 0)} />
            {listStatusUpdateError ? (
              <div className="rounded-[1.15rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
                {listStatusUpdateError}
              </div>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => void updateListStatusAction(list.id, list.status === "archived" ? "attached" : "archived")}
              disabled={isUpdatingListStatus}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isUpdatingListStatus ? "Mise a jour..." : "Changer le statut"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
            <CardHeader>
              <CardTitle>Description metier</CardTitle>
              <CardDescription>Contexte et description renvoyes par le backend.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4 text-sm leading-7 text-[#607287]">
                {list.description || "Aucune description disponible."}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
            <CardHeader>
              <CardTitle>Contacts dans cette liste</CardTitle>
              <CardDescription>Vue legere basee uniquement sur le compteur renvoye par le backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-5 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#295086]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">
                      Contacts dans cette liste
                    </p>
                    <p className="text-2xl font-semibold text-[#102033]">
                      {list.hasContactsCount ? list.contactsCount.toLocaleString("fr-FR") : "Non disponible"}
                    </p>
                    <p className="text-sm leading-6 text-[#607287]">
                      {list.hasContactsCount
                        ? "Le backend a fourni directement le compteur total des contacts."
                        : "Le backend n a pas fourni de compteur total pour cette liste."}
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="secondary" disabled>
                Voir les contacts
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
            <CardHeader>
              <CardTitle>Historique imports</CardTitle>
              <CardDescription>Import logs reels lies a cette liste si le backend les fournit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {list.importLogs && list.importLogs.length > 0 ? (
                list.importLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-[1.15rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4 text-sm text-[#24415d]"
                  >
                    <p className="font-semibold text-[#102033]">Import #{log.id}</p>
                    <p className="mt-1 text-[#607287]">Statut : {log.status || "-"}</p>
                    <p className="mt-1 text-[#607287]">
                      Lignes : {log.importedRows ?? 0} / {log.totalRows ?? 0}
                    </p>
                    <p className="mt-1 text-[#607287]">
                      Doublons : {log.duplicateRows ?? 0} • Echecs : {log.failedRows ?? 0}
                    </p>
                    <p className="mt-1 text-[#607287]">Termine le : {log.completedAt || "-"}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
                  Aucun import lie fourni par le backend.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
