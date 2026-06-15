"use client";

import { useCampaignLeadsStore } from "@/features/campaign-leads/store/campaign-leads.store";
import type { CampaignLeadRecord } from "@/types/campaign-lead.types";

const EMPTY_LEADS: CampaignLeadRecord[] = [];

export function useCampaignLeads(campaignId?: string) {
  const loadCampaignLeads = useCampaignLeadsStore((state) => state.loadCampaignLeads);
  const leads = useCampaignLeadsStore((state) => {
    if (!campaignId) {
      return EMPTY_LEADS;
    }

    return state.leadsByCampaign[campaignId] ?? EMPTY_LEADS;
  });
  const isLoadingLeads = useCampaignLeadsStore((state) =>
    campaignId ? Boolean(state.loadingCampaignLeadIds[campaignId]) : false,
  );
  const leadsError = useCampaignLeadsStore((state) =>
    campaignId ? state.leadErrorsByCampaign[campaignId] ?? null : null,
  );

  return {
    leads,
    isLoadingLeads,
    leadsError,
    loadCampaignLeads,
  };
}
