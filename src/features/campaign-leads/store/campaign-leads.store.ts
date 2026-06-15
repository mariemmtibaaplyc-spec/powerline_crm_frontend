"use client";

import { create } from "zustand";
import { campaignLeadsApi } from "@/features/campaign-leads/api/campaign-leads.api";
import type { CampaignLeadRecord } from "@/types/campaign-lead.types";

interface CampaignLeadsStoreState {
  leadsByCampaign: Record<string, CampaignLeadRecord[]>;
  loadingCampaignLeadIds: Record<string, boolean>;
  leadErrorsByCampaign: Record<string, string | null>;
  loadCampaignLeads: (campaignId: string, force?: boolean) => Promise<void>;
}

export const useCampaignLeadsStore = create<CampaignLeadsStoreState>((set, get) => ({
  leadsByCampaign: {},
  loadingCampaignLeadIds: {},
  leadErrorsByCampaign: {},
  loadCampaignLeads: async (campaignId, force = false) => {
    const existingLeads = get().leadsByCampaign[campaignId];
    const isLoading = get().loadingCampaignLeadIds[campaignId];

    if (existingLeads && !force && !isLoading) {
      return;
    }

    set((state) => ({
      loadingCampaignLeadIds: {
        ...state.loadingCampaignLeadIds,
        [campaignId]: true,
      },
      leadErrorsByCampaign: {
        ...state.leadErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      const leads = await campaignLeadsApi.getCampaignLeads(campaignId);

      set((state) => ({
        leadsByCampaign: {
          ...state.leadsByCampaign,
          [campaignId]: leads,
        },
        loadingCampaignLeadIds: {
          ...state.loadingCampaignLeadIds,
          [campaignId]: false,
        },
        leadErrorsByCampaign: {
          ...state.leadErrorsByCampaign,
          [campaignId]: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        leadsByCampaign: {
          ...state.leadsByCampaign,
          [campaignId]: [],
        },
        loadingCampaignLeadIds: {
          ...state.loadingCampaignLeadIds,
          [campaignId]: false,
        },
        leadErrorsByCampaign: {
          ...state.leadErrorsByCampaign,
          [campaignId]:
            error instanceof Error ? error.message : "Impossible de charger les leads.",
        },
      }));
    }
  },
}));
