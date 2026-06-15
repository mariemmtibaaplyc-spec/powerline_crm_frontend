import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { CampaignLeadRecord } from "@/types/campaign-lead.types";

type BackendLead = {
  id: string | number;
  status?: string | null;
  priority?: string | null;
  created_at?: string | null;
  contact?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    phone2?: string | null;
  } | null;
  agent?: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    name?: string | null;
  } | null;
};

type GetCampaignLeadsResponse =
  | BackendLead[]
  | {
      data?: BackendLead[];
    };

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function mapAssignedAgent(agent: BackendLead["agent"]) {
  if (!agent) {
    return undefined;
  }

  const firstName = normalizeString(agent.first_name);
  const lastName = normalizeString(agent.last_name);
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || normalizeString(agent.name) || normalizeString(agent.username) || undefined;
}

function mapCampaignLead(lead: BackendLead): CampaignLeadRecord {
  return {
    id: String(lead.id),
    firstName: normalizeString(lead.contact?.first_name) || undefined,
    lastName: normalizeString(lead.contact?.last_name) || undefined,
    phone: normalizeString(lead.contact?.phone) || undefined,
    phone2: normalizeString(lead.contact?.phone2) || undefined,
    status: normalizeString(lead.status) || undefined,
    priority: normalizeString(lead.priority) || undefined,
    assignedAgent: mapAssignedAgent(lead.agent),
    createdAt: normalizeString(lead.created_at) || undefined,
  };
}

export const campaignLeadsApi = {
  async getCampaignLeads(campaignId: string): Promise<CampaignLeadRecord[]> {
    try {
      const { data } = await apiClient.get<GetCampaignLeadsResponse>(
        `/leads/campaign/${campaignId}`,
      );
      const leads = Array.isArray(data) ? data : data.data;

      return Array.isArray(leads) ? leads.map(mapCampaignLead) : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        const apiMessage =
          typeof responseData === "string"
            ? responseData
            : typeof responseData?.message === "string"
              ? responseData.message
              : Array.isArray(responseData?.message) && typeof responseData.message[0] === "string"
                ? responseData.message[0]
                : null;

        if (apiMessage) {
          throw new Error(apiMessage);
        }
      }

      throw new Error("Impossible de charger les leads de cette campagne pour le moment.");
    }
  },
};
