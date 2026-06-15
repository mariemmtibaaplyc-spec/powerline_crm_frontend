"use client";

import { create } from "zustand";
import { campaignListsApi } from "@/features/campaign-lists/api/campaign-lists.api";
import type { CampaignListRecord } from "@/types/campaign-list.types";

interface CampaignListsStoreState {
  listsByCampaign: Record<string, CampaignListRecord[]>;
  loadingCampaignListIds: Record<string, boolean>;
  listErrorsByCampaign: Record<string, string | null>;
  mutatingCampaignListIds: Record<string, boolean>;
  listActionErrorsByCampaign: Record<string, string | null>;
  loadCampaignLists: (campaignId: string, force?: boolean) => Promise<void>;
  attachCampaignList: (campaignId: string, listId: string) => Promise<void>;
  detachCampaignList: (campaignId: string, listId: string) => Promise<void>;
}

export const useCampaignListsStore = create<CampaignListsStoreState>((set, get) => ({
  listsByCampaign: {},
  loadingCampaignListIds: {},
  listErrorsByCampaign: {},
  mutatingCampaignListIds: {},
  listActionErrorsByCampaign: {},
  loadCampaignLists: async (campaignId, force = false) => {
    const existingLists = get().listsByCampaign[campaignId];
    const isLoading = get().loadingCampaignListIds[campaignId];

    if (existingLists && !force && !isLoading) {
      return;
    }

    set((state) => ({
      loadingCampaignListIds: {
        ...state.loadingCampaignListIds,
        [campaignId]: true,
      },
      listErrorsByCampaign: {
        ...state.listErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      const lists = await campaignListsApi.getCampaignLists(campaignId);

      set((state) => ({
        listsByCampaign: {
          ...state.listsByCampaign,
          [campaignId]: lists,
        },
        loadingCampaignListIds: {
          ...state.loadingCampaignListIds,
          [campaignId]: false,
        },
        listErrorsByCampaign: {
          ...state.listErrorsByCampaign,
          [campaignId]: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        listsByCampaign: {
          ...state.listsByCampaign,
          [campaignId]: [],
        },
        loadingCampaignListIds: {
          ...state.loadingCampaignListIds,
          [campaignId]: false,
        },
        listErrorsByCampaign: {
          ...state.listErrorsByCampaign,
          [campaignId]:
            error instanceof Error ? error.message : "Impossible de charger les listes.",
        },
      }));
    }
  },
  attachCampaignList: async (campaignId, listId) => {
    set((state) => ({
      mutatingCampaignListIds: {
        ...state.mutatingCampaignListIds,
        [campaignId]: true,
      },
      listActionErrorsByCampaign: {
        ...state.listActionErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      await campaignListsApi.attachCampaignList(campaignId, listId);
      await get().loadCampaignLists(campaignId, true);
    } catch (error) {
      set((state) => ({
        listActionErrorsByCampaign: {
          ...state.listActionErrorsByCampaign,
          [campaignId]:
            error instanceof Error ? error.message : "Impossible d attacher la liste.",
        },
      }));
      throw error;
    } finally {
      set((state) => ({
        mutatingCampaignListIds: {
          ...state.mutatingCampaignListIds,
          [campaignId]: false,
        },
      }));
    }
  },
  detachCampaignList: async (campaignId, listId) => {
    set((state) => ({
      mutatingCampaignListIds: {
        ...state.mutatingCampaignListIds,
        [campaignId]: true,
      },
      listActionErrorsByCampaign: {
        ...state.listActionErrorsByCampaign,
        [campaignId]: null,
      },
    }));

    try {
      await campaignListsApi.detachCampaignList(campaignId, listId);
      await get().loadCampaignLists(campaignId, true);
    } catch (error) {
      set((state) => ({
        listActionErrorsByCampaign: {
          ...state.listActionErrorsByCampaign,
          [campaignId]:
            error instanceof Error ? error.message : "Impossible de retirer la liste.",
        },
      }));
      throw error;
    } finally {
      set((state) => ({
        mutatingCampaignListIds: {
          ...state.mutatingCampaignListIds,
          [campaignId]: false,
        },
      }));
    }
  },
}));
