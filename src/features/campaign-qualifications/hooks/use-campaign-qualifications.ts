"use client";

import { useCampaignQualificationsStore } from "@/features/campaign-qualifications/store/campaign-qualifications.store";
import type { CampaignQualificationRecord } from "@/types/campaign-qualification.types";

const EMPTY_QUALIFICATIONS: CampaignQualificationRecord[] = [];

export function useCampaignQualifications(campaignId?: string) {
  const loadCampaignQualifications = useCampaignQualificationsStore(
    (state) => state.loadCampaignQualifications,
  );
  const createCampaignQualification = useCampaignQualificationsStore(
    (state) => state.createCampaignQualification,
  );
  const updateCampaignQualification = useCampaignQualificationsStore(
    (state) => state.updateCampaignQualification,
  );
  const deleteCampaignQualification = useCampaignQualificationsStore(
    (state) => state.deleteCampaignQualification,
  );
  const qualifications = useCampaignQualificationsStore((state) => {
    if (!campaignId) {
      return EMPTY_QUALIFICATIONS;
    }

    return state.qualificationsByCampaign[campaignId] ?? EMPTY_QUALIFICATIONS;
  });
  const isLoadingQualifications = useCampaignQualificationsStore((state) =>
    campaignId ? Boolean(state.loadingCampaignQualificationIds[campaignId]) : false,
  );
  const qualificationsError = useCampaignQualificationsStore((state) =>
    campaignId ? state.qualificationErrorsByCampaign[campaignId] ?? null : null,
  );
  const isMutatingQualifications = useCampaignQualificationsStore((state) =>
    campaignId ? Boolean(state.mutatingCampaignQualificationIds[campaignId]) : false,
  );
  const qualificationActionError = useCampaignQualificationsStore((state) =>
    campaignId ? state.qualificationActionErrorsByCampaign[campaignId] ?? null : null,
  );

  return {
    qualifications,
    isLoadingQualifications,
    qualificationsError,
    isMutatingQualifications,
    qualificationActionError,
    loadCampaignQualifications,
    createCampaignQualification,
    updateCampaignQualification,
    deleteCampaignQualification,
  };
}
