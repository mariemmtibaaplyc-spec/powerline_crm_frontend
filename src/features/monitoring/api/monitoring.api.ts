import axios from "axios";
import { apiClient } from "@/lib/axios";

export interface SupervisionLiveSnapshot {
  available_agents: number;
  in_call_agents: number;
  ringing_agents: number;
  wrap_up_agents: number;
  paused_agents: number;
  offline_agents: number;
  online_agents: number;
  active_calls: number;
  waiting_calls: number;
  calls_today: number;
  answered_today: number;
  missed_today: number;
  abandoned_today: number;
  avg_duration: number;
  answer_rate: number;
  abandon_rate: number;
  contacts_available: number;
  dialer_speed: number;
  timestamp: string;
}

export interface SupervisionAgentCampaignRef {
  id: number;
  name: string;
}

export interface SupervisionAgentCurrentCall {
  call_id: number;
  phone_number: string;
  status: string;
  duration_live: number;
  campaign: SupervisionAgentCampaignRef | null;
}

export interface SupervisionAgentStatusRow {
  agent_id: number;
  agent_name: string;
  role: string;
  email: string | null;
  status: string;
  login_time: string | null;
  status_duration: number | null;
  pause_type: string | null;
  current_campaign: SupervisionAgentCampaignRef | null;
  current_list: SupervisionAgentCampaignRef | null;
  current_call: SupervisionAgentCurrentCall | null;
  calls_today: number;
  sales_today: number;
  avg_dmc: number;
  avg_dmt: number;
}

export interface SupervisionLiveCall {
  call_id: number;
  agent: {
    agent_id: number;
    name: string;
  };
  customer: {
    contact_id?: number;
    name?: string;
    phone: string;
  };
  campaign: {
    id: number;
    name: string;
  } | null;
  started_at: string;
  duration_live: number;
  call_status: string;
  qualification: {
    id: number;
    name: string;
    type: string;
  } | null;
}

export interface SupervisionCampaignLiveStat {
  campaign_id: number;
  campaign_name: string;
  active_calls: number;
  agents_in_call: number;
  calls_today: number;
  answer_rate: number;
  abandon_rate: number;
  contacts_available: number;
  dialer_speed: number;
  dialer_speed_mode: string;
  timestamp: string;
}

export interface SupervisionAlert {
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  agent?: {
    agent_id: number;
    agent_name: string;
    role: string;
  } | null;
  campaign_id?: number | null;
  message: string;
  created_at: string;
}

function unwrapPayload<T>(payload: T | { data?: T }): T {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload &&
    payload.data !== undefined
  ) {
    return payload.data;
  }

  return payload as T;
}

function toApiError(error: unknown, fallbackMessage: string) {
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
      return new Error(apiMessage);
    }
  }

  return new Error(fallbackMessage);
}

export const monitoringApi = {
  async getSupervisionLive(): Promise<SupervisionLiveSnapshot> {
    try {
      const { data } = await apiClient.get<SupervisionLiveSnapshot | { data?: SupervisionLiveSnapshot }>(
        "/supervision/live",
      );
      return unwrapPayload(data);
    } catch (error) {
      throw toApiError(error, "Impossible de charger le snapshot de supervision.");
    }
  },

  async getSupervisionAgentsStatus(params?: {
    campaign_id?: number;
  }): Promise<SupervisionAgentStatusRow[]> {
    try {
      const { data } = await apiClient.get<
        SupervisionAgentStatusRow[] | { data?: SupervisionAgentStatusRow[] }
      >("/supervision/agents-status", { params });
      const payload = unwrapPayload(data);
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      throw toApiError(error, "Impossible de charger les agents en supervision.");
    }
  },

  async getSupervisionLiveCalls(params?: {
    agent_id?: number;
    campaign_id?: number;
  }): Promise<SupervisionLiveCall[]> {
    try {
      const { data } = await apiClient.get<SupervisionLiveCall[] | { data?: SupervisionLiveCall[] }>(
        "/supervision/live-calls",
        { params },
      );
      const payload = unwrapPayload(data);
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      throw toApiError(error, "Impossible de charger les appels live.");
    }
  },

  async getSupervisionCampaignsLive(): Promise<SupervisionCampaignLiveStat[]> {
    try {
      const { data } = await apiClient.get<
        SupervisionCampaignLiveStat[] | { data?: SupervisionCampaignLiveStat[] }
      >("/supervision/campaigns-live");
      const payload = unwrapPayload(data);
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      throw toApiError(error, "Impossible de charger les campagnes live.");
    }
  },

  async getSupervisionAlerts(): Promise<SupervisionAlert[]> {
    try {
      const { data } = await apiClient.get<SupervisionAlert[] | { data?: SupervisionAlert[] }>(
        "/supervision/alerts",
      );
      const payload = unwrapPayload(data);
      return Array.isArray(payload) ? payload : [];
    } catch (error) {
      throw toApiError(error, "Impossible de charger les alertes de supervision.");
    }
  },
};
