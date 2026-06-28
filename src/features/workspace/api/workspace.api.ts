// src/features/workspace/api/workspace.api.ts

import { apiClient } from "@/lib/axios";
import type { HistoryEntry } from "@/types/workspace.types";
import { createUnknownManualCallProspect } from "@/features/workspace/mocks/prospects.mock";

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

// ─── Agent history mapping ────────────────────────────────────────────────────

// FRAGILITÉ : le matching sur le nom de qualification est textuel (insensible casse/accents).
// Un admin qui renomme une qualification peut casser le matching — il retombera sur le filet
// par type (POSITIVE/NEGATIVE/NEUTRAL) sans planter, mais le badge peut changer de sens.
// À surveiller si des qualifications sont renommées ou ajoutées.
function normalizeStr(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function mapCallToHistoryStatus(
  callStatus: string,
  qualification?: { name: string; type: string } | null,
): HistoryStatus {
  if (qualification) {
    const n = normalizeStr(qualification.name);
    if (n.includes("rdv"))                                         return "appointment";
    if (n.includes("rappel"))                                      return "follow_up";
    if (n.includes("repondeur"))                                   return "voicemail";
    if (n.includes("pas appeler") || n.includes("ne pas"))        return "refused";
    if (n.includes("pas interess") || n.includes("non interess")) return "refused";
    if (n.includes("deconnect"))                                   return "unreachable";
    if (qualification.type === "POSITIVE")                         return "completed";
    if (qualification.type === "NEGATIVE")                         return "refused";
    return "follow_up"; // NEUTRAL ou inconnu
  }
  if (callStatus === "AMD_MACHINE") return "voicemail";
  if (callStatus === "COMPLETED")   return "completed";
  return "unreachable"; // MISSED, NO_ANSWER, BUSY, FAILED, ABANDONED
}

function mapBackendCallToHistoryEntry(call: any): HistoryEntry {
  const startedAt = new Date(call.started_at);
  const date = call.started_at.slice(0, 10);
  const time = startedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const contact = call.contact as ContactSearchResult | null | undefined;
  const clientName =
    contact
      ? `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || call.phone_number
      : call.phone_number;

  const prospect: ProspectSheet = contact
    ? {
        id:            String(contact.id),
        firstName:     contact.first_name  ?? "",
        lastName:      contact.last_name   ?? "",
        phone:         contact.phone       ?? call.phone_number,
        phoneSecondary: contact.phone2     ?? "",
        email:         contact.email       ?? "",
        address:       contact.address     ?? "",
        postalCode:    contact.postal_code ?? "",
        city:          contact.city        ?? "",
        comments:
          typeof contact.custom_fields?.commentaires === "string"
            ? contact.custom_fields.commentaires
            : "",
      }
    : createUnknownManualCallProspect(call.phone_number);

  return {
    id:       String(call.id),
    date,
    time,
    clientName,
    phone:    call.phone_number,
    campaign: call.campaign?.name ?? "",
    queue:    "",
    result:   call.qualification?.name ?? call.result ?? call.status,
    summary:  call.notes ?? "",
    status:   mapCallToHistoryStatus(call.status, call.qualification),
    prospect,
    qualificationCode:  undefined,
    qualificationLabel: call.qualification?.name,
  };
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

  // ── Agent call history ───────────────────────────────────────────────────────

  async getAgentHistory(agentId: number, date: string): Promise<HistoryEntry[]> {
    const { data } = await apiClient.get("/calls/agent-history", {
      params: { agent_id: agentId, date },
    });
    const rows: any[] = Array.isArray(data) ? data : (unwrap<any>(data) ?? []);
    return rows.map(mapBackendCallToHistoryEntry);
  },

  // ── Daily session stats (footer) ─────────────────────────────────────────────

  async getDailyStats(userId: number): Promise<{
    date:                  string;
    communication_seconds: number;
    qualification_seconds: number;
    attente_seconds:       number;
    pause_seconds:         number;
    total_seconds:         number;
  }> {
    const { data } = await apiClient.get(`/agent-statuses/${userId}/daily-stats`);
    return unwrap<any>(data);
  },

  // ── Qualifications ───────────────────────────────────────────────────────────

  async getCampaignQualifications(campaignId: number): Promise<BackendQualification[]> {
    const { data } = await apiClient.get(`/campaigns/${campaignId}/qualifications`);
    const payload = unwrap<any>(data);
    return Array.isArray(payload) ? payload : [];
  },
};
