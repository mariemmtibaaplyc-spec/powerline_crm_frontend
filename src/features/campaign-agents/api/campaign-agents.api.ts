import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { CampaignAgentRecord } from "@/types/campaign-agent.types";

type BackendCampaignAgent = {
  id?: string | number;
  username?: string | null;
  email?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  user?: BackendCampaignAgent | null;
  agent?: BackendCampaignAgent | null;
};

type GetCampaignAgentsResponse =
  | BackendCampaignAgent[]
  | {
      data?: BackendCampaignAgent[];
    };

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNestedRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
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

function getCampaignAgentApiErrorMessage(
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

function mapCampaignAgent(item: BackendCampaignAgent): CampaignAgentRecord | null {
  const nestedUser =
    getNestedRecord(item.user) ??
    getNestedRecord(item.agent);
  const record = nestedUser ?? (item as Record<string, unknown>);
  const id = record.id;

  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  return {
    id: String(id),
    username: normalizeString(record.username) || undefined,
    firstName: normalizeString(record.first_name ?? record.firstName) || undefined,
    lastName: normalizeString(record.last_name ?? record.lastName) || undefined,
    email: normalizeString(record.email) || undefined,
    createdAt: normalizeString(record.created_at ?? record.createdAt) || undefined,
  };
}

export const campaignAgentsApi = {
  async getCampaignAgents(campaignId: string): Promise<CampaignAgentRecord[]> {
    try {
      const { data } = await apiClient.get<GetCampaignAgentsResponse>(
        `/campaigns/${campaignId}/agents`,
      );
      const agents = Array.isArray(data) ? data : data.data;

      return Array.isArray(agents)
        ? agents
            .map(mapCampaignAgent)
            .filter((agent): agent is CampaignAgentRecord => agent !== null)
        : [];
    } catch (error) {
      throw new Error(
        getCampaignAgentApiErrorMessage(error, {
          fallbackMessage: "Impossible de charger les agents de cette campagne pour le moment.",
          notFoundMessage: "Campagne introuvable.",
        }),
      );
    }
  },
  async getAssignableAgents(campaignId: string): Promise<CampaignAgentRecord[]> {
    try {
      const { data } = await apiClient.get<GetCampaignAgentsResponse>(
        `/campaigns/${campaignId}/assignable-agents`,
      );
      const agents = Array.isArray(data) ? data : data.data;

      return Array.isArray(agents)
        ? agents
            .map(mapCampaignAgent)
            .filter((agent): agent is CampaignAgentRecord => agent !== null)
        : [];
    } catch (error) {
      throw new Error(
        getCampaignAgentApiErrorMessage(error, {
          fallbackMessage: "Impossible de charger les agents assignables pour le moment.",
          notFoundMessage: "Campagne introuvable.",
        }),
      );
    }
  },
  async attachCampaignAgent(campaignId: string, agentId: string): Promise<void> {
    try {
      await apiClient.post(`/campaigns/${campaignId}/agents/${agentId}`);
    } catch (error) {
      throw new Error(
        getCampaignAgentApiErrorMessage(error, {
          fallbackMessage: "Impossible d affecter l agent pour le moment.",
          notFoundMessage: "Campagne ou agent introuvable.",
        }),
      );
    }
  },
  async detachCampaignAgent(campaignId: string, agentId: string): Promise<void> {
    try {
      await apiClient.delete(`/campaigns/${campaignId}/agents/${agentId}`);
    } catch (error) {
      throw new Error(
        getCampaignAgentApiErrorMessage(error, {
          fallbackMessage: "Impossible de retirer l agent pour le moment.",
          notFoundMessage: "Campagne ou agent introuvable.",
        }),
      );
    }
  },
};
