"use client";

import { create } from "zustand";
import { campaignsApi } from "@/features/campaigns/api/campaigns.api";
import type { CampaignFormValues, CampaignRecord } from "@/types/campaign.types";

interface CampaignsStoreState {
  campaigns: CampaignRecord[];
  selectedCampaign: CampaignRecord | null;
  hasLoadedCampaigns: boolean;
  isLoadingCampaigns: boolean;
  isLoadingSelectedCampaign: boolean;
  isCreatingCampaign: boolean;
  isUpdatingCampaign: boolean;
  togglingCampaignIds: Record<string, boolean>;
  campaignsError: string | null;
  selectedCampaignError: string | null;
  createCampaignError: string | null;
  updateCampaignError: string | null;
  toggleCampaignError: string | null;
  loadCampaigns: (force?: boolean) => Promise<void>;
  loadCampaignById: (id: string, force?: boolean) => Promise<CampaignRecord | undefined>;
  createCampaign: (values: CampaignFormValues) => Promise<string | undefined>;
  updateCampaign: (id: string, values: CampaignFormValues) => Promise<void>;
  activateCampaign: (id: string) => Promise<void>;
  deactivateCampaign: (id: string) => Promise<void>;
  getCampaignById: (id: string) => CampaignRecord | undefined;
}

export const useCampaignsStore = create<CampaignsStoreState>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  hasLoadedCampaigns: false,
  isLoadingCampaigns: false,
  isLoadingSelectedCampaign: false,
  isCreatingCampaign: false,
  isUpdatingCampaign: false,
  togglingCampaignIds: {},
  campaignsError: null,
  selectedCampaignError: null,
  createCampaignError: null,
  updateCampaignError: null,
  toggleCampaignError: null,
  loadCampaigns: async (force = false) => {
    if ((get().hasLoadedCampaigns || get().isLoadingCampaigns) && !force) {
      return;
    }

    set({
      isLoadingCampaigns: true,
      campaignsError: null,
    });

    try {
      const campaigns = await campaignsApi.getCampaigns();

      set({
        campaigns,
        hasLoadedCampaigns: true,
        isLoadingCampaigns: false,
        campaignsError: null,
      });
    } catch (error) {
      set({
        campaigns: [],
        hasLoadedCampaigns: true,
        isLoadingCampaigns: false,
        campaignsError: error instanceof Error ? error.message : "Impossible de charger les campagnes.",
      });
    }
  },
  loadCampaignById: async (id, force = false) => {
    const currentSelectedCampaign = get().selectedCampaign;

    if (
      currentSelectedCampaign?.id === id &&
      !get().isLoadingSelectedCampaign &&
      !force
    ) {
      return currentSelectedCampaign;
    }

    set({
      isLoadingSelectedCampaign: true,
      selectedCampaignError: null,
      selectedCampaign: force ? null : get().selectedCampaign,
    });

    try {
      const campaign = await campaignsApi.getCampaignById(id);

      set((state) => ({
        selectedCampaign: campaign,
        isLoadingSelectedCampaign: false,
        selectedCampaignError: null,
        campaigns: state.campaigns.some((item) => item.id === campaign.id)
          ? state.campaigns.map((item) => (item.id === campaign.id ? campaign : item))
          : [campaign, ...state.campaigns],
      }));

      return campaign;
    } catch (error) {
      set({
        selectedCampaign: null,
        isLoadingSelectedCampaign: false,
        selectedCampaignError:
          error instanceof Error ? error.message : "Impossible de charger cette campagne.",
      });

      return undefined;
    }
  },
  createCampaign: async (values) => {
    set({
      isCreatingCampaign: true,
      createCampaignError: null,
    });

    try {
      const creationResult = await campaignsApi.createCampaign(values);
      const createdCampaign = creationResult.campaign;

      set((state) => ({
        campaigns:
          createdCampaign && state.campaigns.some((campaign) => campaign.id === createdCampaign.id)
            ? state.campaigns.map((campaign) =>
                campaign.id === createdCampaign.id ? createdCampaign : campaign,
              )
            : createdCampaign
              ? [createdCampaign, ...state.campaigns]
              : state.campaigns,
        selectedCampaign: createdCampaign ?? state.selectedCampaign,
        isCreatingCampaign: false,
        createCampaignError: null,
      }));

      await get().loadCampaigns(true);

      return creationResult.id;
    } catch (error) {
      set({
        isCreatingCampaign: false,
        createCampaignError:
          error instanceof Error ? error.message : "Impossible de creer la campagne.",
      });

      throw error;
    }
  },
  updateCampaign: async (id, values) => {
    set({
      isUpdatingCampaign: true,
      updateCampaignError: null,
    });

    try {
      const updatedCampaign = await campaignsApi.updateCampaign(id, values);

      if (updatedCampaign) {
        set((state) => ({
          campaigns: state.campaigns.some((campaign) => campaign.id === updatedCampaign.id)
            ? state.campaigns.map((campaign) =>
                campaign.id === updatedCampaign.id ? updatedCampaign : campaign,
              )
            : [updatedCampaign, ...state.campaigns],
          selectedCampaign: updatedCampaign,
          isUpdatingCampaign: false,
          updateCampaignError: null,
        }));
      } else {
        set({
          isUpdatingCampaign: false,
          updateCampaignError: null,
        });
      }

      await get().loadCampaigns(true);
      await get().loadCampaignById(id, true);
    } catch (error) {
      set({
        isUpdatingCampaign: false,
        updateCampaignError:
          error instanceof Error ? error.message : "Impossible de mettre a jour la campagne.",
      });

      throw error;
    }
  },
  activateCampaign: async (id) => {
    set((state) => ({
      togglingCampaignIds: {
        ...state.togglingCampaignIds,
        [id]: true,
      },
      toggleCampaignError: null,
    }));

    try {
      await campaignsApi.activateCampaign(id);
      await get().loadCampaigns(true);
      await get().loadCampaignById(id, true);
    } catch (error) {
      set({
        toggleCampaignError:
          error instanceof Error ? error.message : "Impossible d activer la campagne.",
      });
      throw error;
    } finally {
      set((state) => ({
        togglingCampaignIds: {
          ...state.togglingCampaignIds,
          [id]: false,
        },
      }));
    }
  },
  deactivateCampaign: async (id) => {
    set((state) => ({
      togglingCampaignIds: {
        ...state.togglingCampaignIds,
        [id]: true,
      },
      toggleCampaignError: null,
    }));

    try {
      await campaignsApi.deactivateCampaign(id);
      await get().loadCampaigns(true);
      await get().loadCampaignById(id, true);
    } catch (error) {
      set({
        toggleCampaignError:
          error instanceof Error ? error.message : "Impossible de desactiver la campagne.",
      });
      throw error;
    } finally {
      set((state) => ({
        togglingCampaignIds: {
          ...state.togglingCampaignIds,
          [id]: false,
        },
      }));
    }
  },
  getCampaignById: (id) => get().campaigns.find((campaign) => campaign.id === id),
}));
