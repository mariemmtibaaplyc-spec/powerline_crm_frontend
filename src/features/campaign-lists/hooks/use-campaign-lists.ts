"use client";

import { useCampaignListsStore } from "@/features/campaign-lists/store/campaign-lists.store";
import type { CampaignListRecord } from "@/types/campaign-list.types";

const EMPTY_LISTS: CampaignListRecord[] = [];

export function useCampaignLists(campaignId?: string) {
  const loadCampaignLists = useCampaignListsStore((state) => state.loadCampaignLists);
  const attachCampaignList = useCampaignListsStore((state) => state.attachCampaignList);
  const detachCampaignList = useCampaignListsStore((state) => state.detachCampaignList);
  const campaignLists = useCampaignListsStore((state) => {
    if (!campaignId) {
      return EMPTY_LISTS;
    }

    return state.listsByCampaign[campaignId] ?? EMPTY_LISTS;
  });
  const isLoadingCampaignLists = useCampaignListsStore((state) =>
    campaignId ? Boolean(state.loadingCampaignListIds[campaignId]) : false,
  );
  const campaignListsError = useCampaignListsStore((state) =>
    campaignId ? state.listErrorsByCampaign[campaignId] ?? null : null,
  );
  const isMutatingCampaignLists = useCampaignListsStore((state) =>
    campaignId ? Boolean(state.mutatingCampaignListIds[campaignId]) : false,
  );
  const campaignListsActionError = useCampaignListsStore((state) =>
    campaignId ? state.listActionErrorsByCampaign[campaignId] ?? null : null,
  );

  return {
    campaignLists,
    isLoadingCampaignLists,
    campaignListsError,
    isMutatingCampaignLists,
    campaignListsActionError,
    loadCampaignLists,
    attachCampaignList,
    detachCampaignList,
  };
}
