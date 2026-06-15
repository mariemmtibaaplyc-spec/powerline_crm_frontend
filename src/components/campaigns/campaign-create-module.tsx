"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import type { CampaignFormValues } from "@/types/campaign.types";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { PageHeader } from "@/components/layout/page-header";

export function CampaignCreateModule() {
  const router = useRouter();
  const { createCampaign, isCreatingCampaign, createCampaignError } = useCampaigns();

  const handleSubmit = async (values: CampaignFormValues) => {
    const id = await createCampaign(values);

    if (id) {
      router.push(`/admin/campaigns/${id}`);
      return;
    }

    router.push("/admin/campaigns");
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Creer une campagne"
        description="Creation d une campagne branchee sur le backend avec les champs actuellement supportes."
        actions={
          <Link
            href="/admin/campaigns"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
        }
      />
      <CampaignForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isCreatingCampaign}
        submitError={createCampaignError}
      />
    </section>
  );
}
