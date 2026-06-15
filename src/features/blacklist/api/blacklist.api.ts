import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { BlacklistFormValues, BlacklistRecord } from "@/types/blacklist.types";

type BackendBlacklistEntry = {
  id: string | number;
  phone?: string | null;
  contact_id?: string | number | null;
  reason?: string | null;
  added_by?: string | number | null;
  added_at?: string | null;
  removed_at?: string | null;
  is_active?: boolean | null;
};

export interface GetBlacklistParams {
  phone?: string;
}

type CreateBlacklistPayload = {
  phone: string;
  reason?: string;
  contact_id?: number;
};

type UpdateBlacklistPayload = {
  phone?: string;
  reason?: string;
  contact_id?: number;
};

function mapBlacklistEntry(entry: BackendBlacklistEntry): BlacklistRecord {
  return {
    id: String(entry.id),
    phone: entry.phone?.trim() || "-",
    reason: entry.reason?.trim() || "Non renseigne",
    status: entry.is_active ? "active" : "inactive",
    addedAt: entry.added_at || "",
    addedBy:
      entry.added_by === null || entry.added_by === undefined
        ? "-"
        : String(entry.added_by),
    note: entry.removed_at ? "Entree retiree de la blacklist." : "Entree active de la blacklist.",
    removedAt: entry.removed_at ?? null,
    contactId:
      entry.contact_id === null || entry.contact_id === undefined
        ? null
        : String(entry.contact_id),
    linkedCampaign: null,
    sourceImport: null,
    linkedContactName: null,
  };
}

export const blacklistApi = {
  async getBlacklist(params: GetBlacklistParams = {}): Promise<BlacklistRecord[]> {
    const queryParams = new URLSearchParams();

    if (params.phone?.trim()) {
      queryParams.set("phone", params.phone.trim());
    }

    const { data } = await apiClient.get<BackendBlacklistEntry[]>("/blacklist", {
      params: Object.fromEntries(queryParams.entries()),
    });

    return Array.isArray(data) ? data.map(mapBlacklistEntry) : [];
  },
  async getBlacklistEntryById(id: string): Promise<BlacklistRecord> {
    const { data } = await apiClient.get<BackendBlacklistEntry>(`/blacklist/${id}`);
    return mapBlacklistEntry(data);
  },
  async createBlacklistEntry(values: BlacklistFormValues): Promise<void> {
    const payload: CreateBlacklistPayload = {
      phone: values.phone.trim(),
    };

    if (values.reason?.trim()) {
      payload.reason = values.reason.trim();
    }

    if (values.contactId?.trim()) {
      payload.contact_id = Number(values.contactId.trim());
    }

    try {
      await apiClient.post("/blacklist", payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        const backendMessage =
          typeof data === "string"
            ? data
            : typeof data?.message === "string"
              ? data.message
              : Array.isArray(data?.message)
                ? data.message[0]
                : null;

        if (status === 409) {
          throw new Error(backendMessage || "Un doublon actif existe deja pour ce telephone.");
        }

        if (status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        if (backendMessage) {
          throw new Error(backendMessage);
        }
      }

      throw error;
    }
  },
  async updateBlacklistEntry(id: string, values: BlacklistFormValues): Promise<void> {
    const payload: UpdateBlacklistPayload = {};

    if (values.phone.trim()) {
      payload.phone = values.phone.trim();
    }

    if (values.reason?.trim()) {
      payload.reason = values.reason.trim();
    }

    if (values.contactId?.trim()) {
      payload.contact_id = Number(values.contactId.trim());
    }

    try {
      await apiClient.patch(`/blacklist/${id}`, payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        const backendMessage =
          typeof data === "string"
            ? data
            : typeof data?.message === "string"
              ? data.message
              : Array.isArray(data?.message)
                ? data.message[0]
                : null;

        if (status === 409) {
          throw new Error(backendMessage || "Un doublon actif existe deja pour ce telephone.");
        }

        if (status === 404) {
          throw new Error(backendMessage || "Entree blacklist introuvable.");
        }

        if (status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        if (backendMessage) {
          throw new Error(backendMessage);
        }
      }

      throw error;
    }
  },
  async deactivateBlacklistEntry(id: string): Promise<void> {
    try {
      await apiClient.patch(`/blacklist/${id}/deactivate`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        const backendMessage =
          typeof data === "string"
            ? data
            : typeof data?.message === "string"
              ? data.message
              : Array.isArray(data?.message)
                ? data.message[0]
                : null;

        if (status === 404) {
          throw new Error(backendMessage || "Entree blacklist introuvable.");
        }

        if (status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        if (backendMessage) {
          throw new Error(backendMessage);
        }
      }

      throw error;
    }
  },
};
