import axios from "axios";
import { apiClient } from "@/lib/axios";
import {
  CAMPAIGN_QUALIFICATION_TYPES,
  type CampaignQualificationRecord,
  type CampaignQualificationType,
} from "@/types/campaign-qualification.types";

type BackendCampaignQualification = {
  id: string | number;
  name?: string | null;
  type?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type GetCampaignQualificationsResponse =
  | BackendCampaignQualification[]
  | {
      data?: BackendCampaignQualification[];
    };

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isCampaignQualificationType(value: string): value is CampaignQualificationType {
  return CAMPAIGN_QUALIFICATION_TYPES.includes(value as CampaignQualificationType);
}

function normalizeQualificationType(value: unknown): CampaignQualificationType | undefined {
  const normalizedValue = normalizeString(value);
  return isCampaignQualificationType(normalizedValue) ? normalizedValue : undefined;
}

function getBackendErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  if (error.response?.status === 401) {
    return "Session expirée, reconnectez-vous";
  }

  const responseData = error.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (Array.isArray(responseData?.message) && typeof responseData.message[0] === "string") {
    return responseData.message[0];
  }

  if (typeof responseData?.error === "string") {
    return responseData.error;
  }

  return null;
}

function getQualificationApiErrorMessage(
  error: unknown,
  options: {
    fallbackMessage: string;
    notFoundMessage?: string;
  },
): string {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return getBackendErrorMessage(error) || options.notFoundMessage || options.fallbackMessage;
  }

  return getBackendErrorMessage(error) || options.fallbackMessage;
}

function mapCampaignQualification(
  qualification: BackendCampaignQualification,
): CampaignQualificationRecord {
  return {
    id: String(qualification.id),
    name: normalizeString(qualification.name) || undefined,
    type: normalizeQualificationType(qualification.type),
    isActive:
      typeof qualification.is_active === "boolean"
        ? qualification.is_active
        : undefined,
    createdAt: normalizeString(qualification.created_at) || undefined,
    updatedAt: normalizeString(qualification.updated_at) || undefined,
  };
}

type CampaignQualificationPayload = {
  name: string;
  type: CampaignQualificationType;
  is_active: boolean;
};

export const campaignQualificationsApi = {
  async getCampaignQualifications(
    campaignId: string,
  ): Promise<CampaignQualificationRecord[]> {
    try {
      const { data } = await apiClient.get<GetCampaignQualificationsResponse>(
        `/campaigns/${campaignId}/qualifications`,
      );
      const qualifications = Array.isArray(data) ? data : data.data;

      return Array.isArray(qualifications)
        ? qualifications.map(mapCampaignQualification)
        : [];
    } catch (error) {
      throw new Error(
        getQualificationApiErrorMessage(error, {
          fallbackMessage:
            "Impossible de charger les qualifications de cette campagne pour le moment.",
          notFoundMessage: "Campagne introuvable.",
        }),
      );
    }
  },
  async createCampaignQualification(
    campaignId: string,
    values: { name: string; type: CampaignQualificationType; isActive: boolean },
  ): Promise<void> {
    const payload: CampaignQualificationPayload = {
      name: values.name.trim(),
      type: values.type,
      is_active: values.isActive,
    };

    try {
      await apiClient.post(`/campaigns/${campaignId}/qualifications`, payload);
    } catch (error) {
      throw new Error(
        getQualificationApiErrorMessage(error, {
          fallbackMessage: "Impossible d ajouter la qualification pour le moment.",
          notFoundMessage: "Campagne introuvable.",
        }),
      );
    }
  },
  async updateCampaignQualification(
    campaignId: string,
    qualificationId: string,
    values: { name: string; type: CampaignQualificationType; isActive: boolean },
  ): Promise<void> {
    const payload: CampaignQualificationPayload = {
      name: values.name.trim(),
      type: values.type,
      is_active: values.isActive,
    };

    try {
      await apiClient.patch(
        `/campaigns/${campaignId}/qualifications/${qualificationId}`,
        payload,
      );
    } catch (error) {
      throw new Error(
        getQualificationApiErrorMessage(error, {
          fallbackMessage: "Impossible de modifier la qualification pour le moment.",
          notFoundMessage: "Qualification introuvable.",
        }),
      );
    }
  },
  async deleteCampaignQualification(
    campaignId: string,
    qualificationId: string,
  ): Promise<void> {
    try {
      await apiClient.delete(
        `/campaigns/${campaignId}/qualifications/${qualificationId}`,
      );
    } catch (error) {
      throw new Error(
        getQualificationApiErrorMessage(error, {
          fallbackMessage: "Impossible de supprimer la qualification pour le moment.",
          notFoundMessage: "Qualification introuvable.",
        }),
      );
    }
  },
};
