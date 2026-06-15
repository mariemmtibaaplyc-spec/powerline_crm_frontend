"use client";

import { useCampaignsStore } from "@/features/campaigns/store/campaigns.store";

export function useCampaigns() {
  const campaigns = useCampaignsStore((state) => state.campaigns);
  const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);
  const hasLoadedCampaigns = useCampaignsStore((state) => state.hasLoadedCampaigns);
  const isLoadingCampaigns = useCampaignsStore((state) => state.isLoadingCampaigns);
  const isLoadingSelectedCampaign = useCampaignsStore((state) => state.isLoadingSelectedCampaign);
  const isCreatingCampaign = useCampaignsStore((state) => state.isCreatingCampaign);
  const isUpdatingCampaign = useCampaignsStore((state) => state.isUpdatingCampaign);
  const togglingCampaignIds = useCampaignsStore((state) => state.togglingCampaignIds);
  const campaignsError = useCampaignsStore((state) => state.campaignsError);
  const selectedCampaignError = useCampaignsStore((state) => state.selectedCampaignError);
  const createCampaignError = useCampaignsStore((state) => state.createCampaignError);
  const updateCampaignError = useCampaignsStore((state) => state.updateCampaignError);
  const toggleCampaignError = useCampaignsStore((state) => state.toggleCampaignError);
  const loadCampaigns = useCampaignsStore((state) => state.loadCampaigns);
  const loadCampaignById = useCampaignsStore((state) => state.loadCampaignById);
  const createCampaign = useCampaignsStore((state) => state.createCampaign);
  const updateCampaign = useCampaignsStore((state) => state.updateCampaign);
  const activateCampaign = useCampaignsStore((state) => state.activateCampaign);
  const deactivateCampaign = useCampaignsStore((state) => state.deactivateCampaign);
  const getCampaignById = useCampaignsStore((state) => state.getCampaignById);

  return {
    campaigns,
    selectedCampaign,
    hasLoadedCampaigns,
    isLoadingCampaigns,
    isLoadingSelectedCampaign,
    isCreatingCampaign,
    isUpdatingCampaign,
    togglingCampaignIds,
    campaignsError,
    selectedCampaignError,
    createCampaignError,
    updateCampaignError,
    toggleCampaignError,
    loadCampaigns,
    loadCampaignById,
    createCampaign,
    updateCampaign,
    activateCampaign,
    deactivateCampaign,
    getCampaignById,
  };
}
