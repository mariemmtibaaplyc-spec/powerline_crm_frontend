"use client";

import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import type { CampaignFormValues } from "@/types/campaign.types";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function CampaignEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    selectedCampaign,
    isLoadingSelectedCampaign,
    selectedCampaignError,
    isUpdatingCampaign,
    updateCampaignError,
    loadCampaignById,
    updateCampaign,
  } = useCampaigns();

  useEffect(() => {
    void loadCampaignById(params.id, true);
  }, [loadCampaignById, params.id]);

  const campaign = selectedCampaign?.id === params.id ? selectedCampaign : null;

  if (isLoadingSelectedCampaign && !campaign) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Chargement de la campagne...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedCampaignError && !campaign) {
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

  const initialValues: CampaignFormValues = {
    name: campaign.name,
    description: campaign.description ?? "",
    type: campaign.type,
    status: campaign.status,
    startDate: campaign.startDate ?? "",
    endDate: campaign.endDate ?? "",
  };

  const handleSubmit = async (values: CampaignFormValues) => {
    await updateCampaign(campaign.id, values);
    router.push(`/admin/campaigns/${campaign.id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier campagne"
        description="Mise a jour des champs supportes par le backend pour cette campagne."
        actions={
          <>
            <Link
              href={`/admin/campaigns/${campaign.id}`}
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
      <CampaignForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isSubmitting={isUpdatingCampaign}
        submitError={updateCampaignError}
      />
    </section>
  );
}
