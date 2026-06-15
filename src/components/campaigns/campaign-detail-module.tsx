"use client";

import { ArrowLeft, PenSquare, Power } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCampaignTypeLabel } from "@/features/campaigns/mocks/campaigns.mock";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { CampaignAgentsPanel } from "@/components/campaigns/campaign-agents-panel";
import { CampaignListsPanel } from "@/components/campaigns/campaign-lists-panel";
import { CampaignQualificationsPanel } from "@/components/campaigns/campaign-qualifications-panel";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CampaignDetailModule() {
  const params = useParams<{ id: string }>();
  const {
    selectedCampaign,
    isLoadingSelectedCampaign,
    selectedCampaignError,
    togglingCampaignIds,
    toggleCampaignError,
    loadCampaignById,
    activateCampaign,
    deactivateCampaign,
  } = useCampaigns();
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  useEffect(() => {
    void loadCampaignById(params.id, true);
  }, [loadCampaignById, params.id]);

  const campaign = selectedCampaign?.id === params.id ? selectedCampaign : null;
  const isTogglingCampaign = Boolean(togglingCampaignIds[params.id]);

  if (isLoadingSelectedCampaign) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Chargement de la campagne...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedCampaignError) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">{selectedCampaignError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Campagne introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  const handleStatusToggle = async () => {
    if (campaign.status === "active") {
      await deactivateCampaign(campaign.id);
    } else {
      await activateCampaign(campaign.id);
    }

    setStatusModalOpen(false);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={campaign.name}
        description="Fiche campagne synchronisee depuis le backend avec les informations metier actuellement supportees."
        actions={
          <>
            <Link
              href="/admin/campaigns"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <Link
              href={`/admin/campaigns/${campaign.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <PenSquare className="h-4 w-4" />
              Modifier
            </Link>
            <Button
              type="button"
              variant={campaign.status === "active" ? "danger" : "secondary"}
              disabled={isTogglingCampaign}
              onClick={() => setStatusModalOpen(true)}
            >
              <Power className="mr-2 h-4 w-4" />
              {isTogglingCampaign
                ? "Traitement..."
                : campaign.status === "active"
                  ? "Desactiver"
                  : "Activer"}
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume campagne</CardTitle>
            <CardDescription>Vue rapide des informations exposees par le backend pour cette campagne.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {toggleCampaignError ? (
              <div className="rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
                {toggleCampaignError}
              </div>
            ) : null}
            <Metric label="Type" value={getCampaignTypeLabel(campaign.type)} />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <CampaignStatusBadge status={campaign.status} />
              </div>
            </div>
            <Metric label="Leads" value={campaign.leadsCount.toLocaleString("fr-FR")} />
            <Metric label="Agents" value={campaign.agentsCount.toLocaleString("fr-FR")} />
            <Metric label="Date de debut" value={campaign.startDate ?? "Non renseignee"} />
            <Metric label="Date de fin" value={campaign.endDate ?? "Non renseignee"} />
            <Metric label="Date de creation" value={campaign.createdAt} />
            <Metric label="Derniere mise a jour" value={campaign.updatedAt ?? "Non renseignee"} />
            <Metric label="Creee par" value={campaign.createdBy ?? "Non renseigne"} />
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Contenu descriptif actuellement renvoye par le backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-sm leading-6 text-[#24415d]">
                {campaign.description?.trim() ? campaign.description : "Aucune description fournie pour cette campagne."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CampaignAgentsPanel campaignId={campaign.id} />
      <CampaignQualificationsPanel campaignId={campaign.id} />
      <CampaignListsPanel campaignId={campaign.id} />

      <Modal
        open={statusModalOpen}
        title={campaign.status === "active" ? "Desactiver la campagne" : "Activer la campagne"}
        description={
          campaign.status === "active"
            ? "Confirmez la desactivation de cette campagne."
            : "Confirmez l activation de cette campagne."
        }
        onClose={() => setStatusModalOpen(false)}
      >
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setStatusModalOpen(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            variant={campaign.status === "active" ? "danger" : "secondary"}
            disabled={isTogglingCampaign}
            onClick={() => void handleStatusToggle()}
          >
            {isTogglingCampaign
              ? "Traitement..."
              : campaign.status === "active"
                ? "Desactiver"
                : "Activer"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#24415d]">{value}</p>
    </div>
  );
}
