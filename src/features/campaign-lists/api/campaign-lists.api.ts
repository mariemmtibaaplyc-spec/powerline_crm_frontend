import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { CampaignListRecord } from "@/types/campaign-list.types";

type BackendList = {
  id?: string | number;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  contact_count?: number | string | null;
  contacts_count?: number | string | null;
  created_at?: string | null;
};

type BackendCampaignListPivot = {
  id?: string | number;
  status?: string | null;
  created_at?: string | null;
  list?: BackendList | null;
};

type GetCampaignListsResponse =
  | Array<BackendList | BackendCampaignListPivot>
  | {
      data?: Array<BackendList | BackendCampaignListPivot>;
    };

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function getCampaignListApiErrorMessage(
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

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getNestedRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function mapCampaignList(item: BackendList | BackendCampaignListPivot): CampaignListRecord | null {
  const listRecord = getNestedRecord((item as BackendCampaignListPivot).list) ?? (item as Record<string, unknown>);
  const id = listRecord.id;

  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  return {
    id: String(id),
    name: normalizeString(listRecord.name) || `Liste ${id}`,
    description: normalizeString(listRecord.description) || undefined,
    status:
      normalizeString(listRecord.status) ||
      normalizeString((item as BackendCampaignListPivot).status) ||
      undefined,
    contactCount: normalizeNumber(listRecord.contact_count ?? listRecord.contacts_count),
    createdAt:
      normalizeString(listRecord.created_at) ||
      normalizeString((item as BackendCampaignListPivot).created_at) ||
      undefined,
  };
}

export const campaignListsApi = {
  async getCampaignLists(campaignId: string): Promise<CampaignListRecord[]> {
    try {
      const { data } = await apiClient.get<GetCampaignListsResponse>(
        `/campaigns/${campaignId}/lists`,
      );
      const lists = Array.isArray(data) ? data : data.data;

      return Array.isArray(lists)
        ? lists
            .map(mapCampaignList)
            .filter((item): item is CampaignListRecord => item !== null)
        : [];
    } catch (error) {
      throw new Error(
        getCampaignListApiErrorMessage(error, {
          fallbackMessage: "Impossible de charger les listes de cette campagne pour le moment.",
          notFoundMessage: "Campagne introuvable.",
        }),
      );
    }
  },
  async attachCampaignList(campaignId: string, listId: string): Promise<void> {
    try {
      await apiClient.post(`/campaigns/${campaignId}/lists/${listId}`);
    } catch (error) {
      throw new Error(
        getCampaignListApiErrorMessage(error, {
          fallbackMessage: "Impossible d attacher la liste pour le moment.",
          notFoundMessage: "Campagne ou liste introuvable.",
        }),
      );
    }
  },
  async detachCampaignList(campaignId: string, listId: string): Promise<void> {
    try {
      await apiClient.delete(`/campaigns/${campaignId}/lists/${listId}`);
    } catch (error) {
      throw new Error(
        getCampaignListApiErrorMessage(error, {
          fallbackMessage: "Impossible de retirer la liste pour le moment.",
          notFoundMessage: "Campagne ou liste introuvable.",
        }),
      );
    }
  },
};
