import axios from "axios";
import { apiClient } from "@/lib/axios";
import type { CampaignFormValues, CampaignRecord, CampaignStatus, CampaignType } from "@/types/campaign.types";

type BackendCampaign = {
  id: string | number;
  name?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
  _count?: {
    agents?: number | null;
    leads?: number | null;
  } | null;
};

type CreateCampaignPayload = {
  name: string;
  description?: string;
  type: "OUTBOUND" | "INBOUND";
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "INACTIVE";
  start_date?: string;
  end_date?: string;
};

type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

type CampaignFormError = Error & {
  fieldErrors?: Record<string, string>;
};

function normalizeCampaignType(type: string | null | undefined): CampaignType {
  const normalizedType = type?.trim().toLowerCase();

  if (normalizedType === "outbound" || normalizedType === "inbound") {
    return normalizedType;
  }

  return "outbound";
}

function normalizeCampaignStatus(status: string | null | undefined): CampaignStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "paused" ||
    normalizedStatus === "closed" ||
    normalizedStatus === "inactive"
  ) {
    return normalizedStatus;
  }

  return "inactive";
}

function normalizeCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toBackendCampaignType(type: CampaignType): CreateCampaignPayload["type"] {
  if (type === "inbound") return "INBOUND";
  return "OUTBOUND";
}

function toBackendCampaignStatus(status: CampaignStatus): CreateCampaignPayload["status"] {
  if (status === "active") return "ACTIVE";
  if (status === "paused") return "PAUSED";
  if (status === "closed") return "CLOSED";
  return "INACTIVE";
}

function mapBackendCampaign(campaign: BackendCampaign): CampaignRecord {
  return {
    id: String(campaign.id),
    name: campaign.name?.trim() || `Campagne ${campaign.id}`,
    description: campaign.description?.trim() || "",
    type: normalizeCampaignType(campaign.type),
    status: normalizeCampaignStatus(campaign.status),
    startDate: campaign.start_date || undefined,
    endDate: campaign.end_date || undefined,
    createdBy:
      campaign.created_by === null || campaign.created_by === undefined
        ? undefined
        : String(campaign.created_by),
    createdAt: campaign.created_at || "",
    updatedAt: campaign.updated_at || undefined,
    agentsCount: normalizeCount(campaign._count?.agents),
    leadsCount: normalizeCount(campaign._count?.leads),
  };
}

function unwrapCampaignPayload(payload: unknown): BackendCampaign {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const root = payload as Record<string, unknown>;
    const nestedData = root.data;

    if (nestedData && typeof nestedData === "object" && !Array.isArray(nestedData)) {
      return nestedData as BackendCampaign;
    }

    return root as BackendCampaign;
  }

  throw new Error("Reponse backend invalide pour la campagne.");
}

function extractCampaignId(payload: unknown): string | undefined {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    const nestedData =
      record.data && typeof record.data === "object" && !Array.isArray(record.data)
        ? (record.data as Record<string, unknown>)
        : undefined;
    const rawId = nestedData?.id ?? record.id;

    if (typeof rawId === "string") {
      return rawId;
    }

    if (typeof rawId === "number" && Number.isFinite(rawId)) {
      return String(rawId);
    }
  }

  return undefined;
}

function toCampaignFormError(error: unknown, fallbackMessage: string): CampaignFormError {
  if (!axios.isAxiosError(error)) {
    return new Error(fallbackMessage) as CampaignFormError;
  }

  const responseData = error.response?.data;
  const apiMessage =
    typeof responseData === "string"
      ? responseData
      : typeof responseData?.message === "string"
        ? responseData.message
        : Array.isArray(responseData?.message) && typeof responseData.message[0] === "string"
          ? responseData.message[0]
          : fallbackMessage;

  const formError = new Error(apiMessage) as CampaignFormError;
  const loweredMessage = apiMessage.toLowerCase();

  if (loweredMessage.includes("name") || loweredMessage.includes("nom")) {
    formError.fieldErrors = { name: apiMessage };
  } else if (loweredMessage.includes("description")) {
    formError.fieldErrors = { description: apiMessage };
  } else if (loweredMessage.includes("type")) {
    formError.fieldErrors = { type: apiMessage };
  } else if (loweredMessage.includes("status") || loweredMessage.includes("statut")) {
    formError.fieldErrors = { status: apiMessage };
  } else if (loweredMessage.includes("start_date") || loweredMessage.includes("date de debut")) {
    formError.fieldErrors = { startDate: apiMessage };
  } else if (loweredMessage.includes("end_date") || loweredMessage.includes("date de fin")) {
    formError.fieldErrors = { endDate: apiMessage };
  }

  return formError;
}

export const campaignsApi = {
  async getCampaigns(): Promise<CampaignRecord[]> {
    try {
      const { data } = await apiClient.get<BackendCampaign[]>("/campaigns");
      return Array.isArray(data) ? data.map(mapBackendCampaign) : [];
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

      throw new Error("Impossible de charger les campagnes pour le moment.");
    }
  },
  async getCampaignById(id: string): Promise<CampaignRecord> {
    try {
      const { data } = await apiClient.get<BackendCampaign>(`/campaigns/${id}`);
      return mapBackendCampaign(data);
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

        if (error.response?.status === 404) {
          throw new Error(apiMessage || "Campagne introuvable.");
        }

        if (apiMessage) {
          throw new Error(apiMessage);
        }
      }

      throw new Error("Impossible de charger cette campagne pour le moment.");
    }
  },
  async createCampaign(values: CampaignFormValues): Promise<{
    id?: string;
    campaign?: CampaignRecord;
  }> {
    const payload: CreateCampaignPayload = {
      name: values.name.trim(),
      type: toBackendCampaignType(values.type),
      status: toBackendCampaignStatus(values.status),
    };

    if (values.description.trim()) {
      payload.description = values.description.trim();
    }

    if (values.startDate.trim()) {
      payload.start_date = values.startDate.trim();
    }

    if (values.endDate.trim()) {
      payload.end_date = values.endDate.trim();
    }

    try {
      const { data } = await apiClient.post("/campaigns", payload);
      const id = extractCampaignId(data);

      try {
        return {
          id,
          campaign: mapBackendCampaign(unwrapCampaignPayload(data)),
        };
      } catch {
        return { id };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw toCampaignFormError(error, "Session expiree. Veuillez vous reconnecter.");
      }

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw toCampaignFormError(error, "Une campagne similaire existe deja.");
      }

      throw toCampaignFormError(error, "Impossible de creer la campagne pour le moment.");
    }
  },
  async updateCampaign(id: string, values: CampaignFormValues): Promise<CampaignRecord | undefined> {
    const payload: UpdateCampaignPayload = {
      name: values.name.trim(),
      description: values.description.trim(),
      type: toBackendCampaignType(values.type),
      status: toBackendCampaignStatus(values.status),
    };

    if (values.startDate.trim()) {
      payload.start_date = values.startDate.trim();
    }

    if (values.endDate.trim()) {
      payload.end_date = values.endDate.trim();
    }

    try {
      const { data } = await apiClient.patch(`/campaigns/${id}`, payload);

      try {
        return mapBackendCampaign(unwrapCampaignPayload(data));
      } catch {
        return undefined;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw toCampaignFormError(error, "Session expiree. Veuillez vous reconnecter.");
      }

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw toCampaignFormError(error, "Campagne introuvable.");
      }

      throw toCampaignFormError(error, "Impossible de mettre a jour la campagne pour le moment.");
    }
  },
  async activateCampaign(id: string): Promise<void> {
    try {
      await apiClient.patch(`/campaigns/${id}/activate`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Session expiree. Veuillez vous reconnecter.");
      }

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Campagne introuvable.");
      }

      const responseData = axios.isAxiosError(error) ? error.response?.data : null;
      const apiMessage =
        typeof responseData === "string"
          ? responseData
          : typeof responseData?.message === "string"
            ? responseData.message
            : Array.isArray(responseData?.message) && typeof responseData.message[0] === "string"
              ? responseData.message[0]
              : null;

      throw new Error(apiMessage || "Impossible d activer la campagne pour le moment.");
    }
  },
  async deactivateCampaign(id: string): Promise<void> {
    try {
      await apiClient.patch(`/campaigns/${id}/deactivate`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Session expiree. Veuillez vous reconnecter.");
      }

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Campagne introuvable.");
      }

      const responseData = axios.isAxiosError(error) ? error.response?.data : null;
      const apiMessage =
        typeof responseData === "string"
          ? responseData
          : typeof responseData?.message === "string"
            ? responseData.message
            : Array.isArray(responseData?.message) && typeof responseData.message[0] === "string"
              ? responseData.message[0]
              : null;

      throw new Error(apiMessage || "Impossible de desactiver la campagne pour le moment.");
    }
  },
};
