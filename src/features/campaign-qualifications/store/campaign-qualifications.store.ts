"use client";

import { create } from "zustand";
import { campaignQualificationsApi } from "@/features/campaign-qualifications/api/campaign-qualifications.api";
import type {
  CampaignQualificationRecord,
  CampaignQualificationType,
} from "@/types/campaign-qualification.types";

interface CampaignQualificationsStoreState {
  qualificationsByCampaign: Record<string, CampaignQualificationRecord[]>;
  loadingCampaignQualificationIds: Record<string, boolean>;
  qualificationErrorsByCampaign: Record<string, string | null>;
  mutatingCampaignQualificationIds: Record<string, boolean>;
  qualificationActionErrorsByCampaign: Record<string, string | null>;
  loadCampaignQualifications: (campaignId: string, force?: boolean) => Promise<void>;
  createCampaignQualification: (
    campaignId: string,
    values: { name: string; type: CampaignQualificationType; isActive: boolean },
  ) => Promise<void>;
  updateCampaignQualification: (
    campaignId: string,
    qualificationId: string,
    values: { name: string; type: CampaignQualificationType; isActive: boolean },
  ) => Promise<void>;
  deleteCampaignQualification: (campaignId: string, qualificationId: string) => Promise<void>;
}

export const useCampaignQualificationsStore =
  create<CampaignQualificationsStoreState>((set, get) => ({
    qualificationsByCampaign: {},
    loadingCampaignQualificationIds: {},
    qualificationErrorsByCampaign: {},
    mutatingCampaignQualificationIds: {},
    qualificationActionErrorsByCampaign: {},
    loadCampaignQualifications: async (campaignId, force = false) => {
      const existingQualifications = get().qualificationsByCampaign[campaignId];
      const isLoading = get().loadingCampaignQualificationIds[campaignId];

      if (existingQualifications && !force && !isLoading) {
        return;
      }

      set((state) => ({
        loadingCampaignQualificationIds: {
          ...state.loadingCampaignQualificationIds,
          [campaignId]: true,
        },
        qualificationErrorsByCampaign: {
          ...state.qualificationErrorsByCampaign,
          [campaignId]: null,
        },
      }));

      try {
        const qualifications =
          await campaignQualificationsApi.getCampaignQualifications(campaignId);

        set((state) => ({
          qualificationsByCampaign: {
            ...state.qualificationsByCampaign,
            [campaignId]: qualifications,
          },
          loadingCampaignQualificationIds: {
            ...state.loadingCampaignQualificationIds,
            [campaignId]: false,
          },
          qualificationErrorsByCampaign: {
            ...state.qualificationErrorsByCampaign,
            [campaignId]: null,
          },
        }));
      } catch (error) {
        set((state) => ({
          qualificationsByCampaign: {
            ...state.qualificationsByCampaign,
            [campaignId]: [],
          },
          loadingCampaignQualificationIds: {
            ...state.loadingCampaignQualificationIds,
            [campaignId]: false,
          },
          qualificationErrorsByCampaign: {
            ...state.qualificationErrorsByCampaign,
            [campaignId]:
              error instanceof Error
                ? error.message
                : "Impossible de charger les qualifications.",
          },
        }));
      }
    },
    createCampaignQualification: async (campaignId, values) => {
      set((state) => ({
        mutatingCampaignQualificationIds: {
          ...state.mutatingCampaignQualificationIds,
          [campaignId]: true,
        },
        qualificationActionErrorsByCampaign: {
          ...state.qualificationActionErrorsByCampaign,
          [campaignId]: null,
        },
      }));

      try {
        await campaignQualificationsApi.createCampaignQualification(campaignId, values);
        await get().loadCampaignQualifications(campaignId, true);
      } catch (error) {
        set((state) => ({
          qualificationActionErrorsByCampaign: {
            ...state.qualificationActionErrorsByCampaign,
            [campaignId]:
              error instanceof Error
                ? error.message
                : "Impossible d ajouter la qualification.",
          },
        }));
        throw error;
      } finally {
        set((state) => ({
          mutatingCampaignQualificationIds: {
            ...state.mutatingCampaignQualificationIds,
            [campaignId]: false,
          },
        }));
      }
    },
    updateCampaignQualification: async (campaignId, qualificationId, values) => {
      set((state) => ({
        mutatingCampaignQualificationIds: {
          ...state.mutatingCampaignQualificationIds,
          [campaignId]: true,
        },
        qualificationActionErrorsByCampaign: {
          ...state.qualificationActionErrorsByCampaign,
          [campaignId]: null,
        },
      }));

      try {
        await campaignQualificationsApi.updateCampaignQualification(
          campaignId,
          qualificationId,
          values,
        );
        await get().loadCampaignQualifications(campaignId, true);
      } catch (error) {
        set((state) => ({
          qualificationActionErrorsByCampaign: {
            ...state.qualificationActionErrorsByCampaign,
            [campaignId]:
              error instanceof Error
                ? error.message
                : "Impossible de modifier la qualification.",
          },
        }));
        throw error;
      } finally {
        set((state) => ({
          mutatingCampaignQualificationIds: {
            ...state.mutatingCampaignQualificationIds,
            [campaignId]: false,
          },
        }));
      }
    },
    deleteCampaignQualification: async (campaignId, qualificationId) => {
      set((state) => ({
        mutatingCampaignQualificationIds: {
          ...state.mutatingCampaignQualificationIds,
          [campaignId]: true,
        },
        qualificationActionErrorsByCampaign: {
          ...state.qualificationActionErrorsByCampaign,
          [campaignId]: null,
        },
      }));

      try {
        await campaignQualificationsApi.deleteCampaignQualification(campaignId, qualificationId);
        await get().loadCampaignQualifications(campaignId, true);
      } catch (error) {
        set((state) => ({
          qualificationActionErrorsByCampaign: {
            ...state.qualificationActionErrorsByCampaign,
            [campaignId]:
              error instanceof Error
                ? error.message
                : "Impossible de supprimer la qualification.",
          },
        }));
        throw error;
      } finally {
        set((state) => ({
          mutatingCampaignQualificationIds: {
            ...state.mutatingCampaignQualificationIds,
            [campaignId]: false,
          },
        }));
      }
    },
  }));
