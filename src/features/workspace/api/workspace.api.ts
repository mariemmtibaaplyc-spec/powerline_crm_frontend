// src/features/workspace/api/workspace.api.ts

import { apiClient } from "@/lib/axios";

// ─── Types réponse ────────────────────────────────────────────────────────────

export interface AgentStatusResponse {
  id: number;
  user_id: number;
  status: "AVAILABLE" | "RINGING" | "IN_CALL" | "WRAP_UP" | "PAUSED" | "OFFLINE";
  started_at: string;
  is_current: boolean;
}

export interface CallResponse {
  id: number;           // call_id à stocker dans le store
  status: string;
  agent_id: number;
  phone_number: string;
  campaign_id?: number | null;
  channel_id?: string;
}

export interface EndCallBody {
  qualification_id?: number;
  result?: string;
  notes?: string;
  appointment?: {
    scheduled_at: string;   // ISO : "2026-06-25T09:30:00"
    notes?: string;
  };
}

export interface EndCallResponse {
  id: number;
  status: string;
  duration?: number;
  qualification_id?: number;
  appointment?: {
    id: number;
    scheduled_at: string;
    status: string;
  };
}

export interface BackendQualification {
  id: number;
  campaign_id: number;
  name: string;
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  is_active: boolean;
}

export interface ContactSearchResult {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  phone2?: string | null;
  email?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  custom_fields?: Record<string, any> | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(data: T | { data?: T }): T {
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "data" in data &&
    (data as any).data !== undefined
  ) {
    return (data as any).data;
  }
  return data as T;
}

function unwrapCallResponse(data: any): CallResponse {
  const payload = unwrap<any>(data);
  if (payload && typeof payload === "object" && payload.call && typeof payload.call === "object") {
    return payload.call as CallResponse;
  }
  return payload as CallResponse;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const workspaceApi = {

  // ── Agent Status ─────────────────────────────────────────────────────────────

  async getCurrentStatus(userId: number): Promise<AgentStatusResponse> {
    const { data } = await apiClient.get(`/agent-statuses/${userId}/current`);
    return unwrap(data);
  },

  async setAvailable(userId: number): Promise<AgentStatusResponse> {
    const { data } = await apiClient.patch(`/agent-statuses/${userId}/available`);
    return unwrap(data);
  },

  async setPaused(userId: number): Promise<AgentStatusResponse> {
    const { data } = await apiClient.patch(`/agent-statuses/${userId}/paused`);
    return unwrap(data);
  },

  async setOffline(userId: number): Promise<AgentStatusResponse> {
    const { data } = await apiClient.patch(`/agent-statuses/${userId}/offline`);
    return unwrap(data);
  },

  // ── Calls ─────────────────────────────────────────────────────────────────────

  async startManualCall(body: {
    agent_id: number;
    phone_number: string;
    campaign_id?: number;
    agent_extension?: string;
  }): Promise<CallResponse> {
    const { data } = await apiClient.post("/calls", body);
    return unwrapCallResponse(data);
  },

  async startClickToCall(body: {
    agent_id: number;
    contact_id: number;
    lead_id?: number;
    campaign_id?: number;
    agent_extension?: string;
  }): Promise<CallResponse> {
    const { data } = await apiClient.post("/calls/start", body);
    return unwrapCallResponse(data);
  },

  async endCall(callId: number, body: EndCallBody): Promise<EndCallResponse> {
    const { data } = await apiClient.patch(`/calls/${callId}/end`, body);
    return unwrap(data);
  },

  async hangupCall(callId: number): Promise<{ message: string }> {
    const { data } = await apiClient.patch(`/calls/${callId}/hangup`);
    return unwrap(data);
  },

  async getWebRtcCredentials(): Promise<{
    uri: string;
    username: string;
    realm: string;
    wsServer: string;
    password?: string;
  }> {
    const { data } = await apiClient.get("/telephony/webrtc-credentials");
    return unwrap(data);
  },

  // ── Contact search ───────────────────────────────────────────────────────────

  async searchContactByPhone(phone: string, campaignId?: number): Promise<ContactSearchResult[]> {
    const { data } = await apiClient.get("/contacts", {
      params: {
        q: phone,
        limit: 5,
        ...(campaignId ? { campaign_id: campaignId } : {}),
      },
    });
    const payload = unwrap<any>(data);
    return Array.isArray(payload) ? payload : (payload?.items ?? payload?.data ?? []);
  },

  // ── Qualifications ───────────────────────────────────────────────────────────

  async getCampaignQualifications(campaignId: number): Promise<BackendQualification[]> {
    const { data } = await apiClient.get(`/campaigns/${campaignId}/qualifications`);
    const payload = unwrap<any>(data);
    return Array.isArray(payload) ? payload : [];
  },
};
