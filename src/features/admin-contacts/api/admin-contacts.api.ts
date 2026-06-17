import axios from "axios";
import { apiClient } from "@/lib/axios";
import type {
  AdminContactFormValues,
  AdminContactRecord,
  AdminContactsMeta,
  AdminContactUpdatePayload,
  LoadAdminContactsParams,
} from "@/types/admin-contact.types";

type BackendContact = {
  id: string | number;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  phone2?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  source?: string | null;
  country?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  custom_fields?: Record<string, unknown> | null;
};

type GetContactsResponse = {
  data?: BackendContact[];
  meta?: Partial<AdminContactsMeta>;
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getBackendErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  if (error.response?.status === 401) {
    return "Session expiree, reconnectez-vous";
  }

  if (error.response?.status === 404) {
    return "Contact introuvable.";
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

function mapBackendContact(contact: BackendContact): AdminContactRecord {
  const backendStatus = normalizeString(contact.status) || null;

  return {
    id: String(contact.id),
    firstName: normalizeString(contact.first_name),
    lastName: normalizeString(contact.last_name),
    phone: normalizeString(contact.phone),
    phone2: normalizeString(contact.phone2) || null,
    email: normalizeString(contact.email) || null,
    company: normalizeString(contact.company) || null,
    address: normalizeString(contact.address) || null,
    city: normalizeString(contact.city),
    postalCode: normalizeString(contact.postal_code) || null,
    source: normalizeString(contact.source) || null,
    country: normalizeString(contact.country) || null,
    status: backendStatus || "unknown",
    backendStatus,
    createdAt: normalizeString(contact.created_at),
    updatedAt: normalizeString(contact.updated_at) || undefined,
    customFields:
      contact.custom_fields && typeof contact.custom_fields === "object"
        ? contact.custom_fields
        : undefined,
  };
}

function normalizeOptionalValue(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function mapContactUpdatePayload(values: AdminContactFormValues): AdminContactUpdatePayload {
  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    phone: values.phone.trim(),
    phone2: normalizeOptionalValue(values.phone2),
    email: normalizeOptionalValue(values.email),
    company: normalizeOptionalValue(values.company),
    address: normalizeOptionalValue(values.address),
    city: values.city.trim(),
    postal_code: normalizeOptionalValue(values.postalCode),
    source: normalizeOptionalValue(values.source),
    country: normalizeOptionalValue(values.country),
    status: values.status,
  };
}

export const adminContactsApi = {
  async getContacts(params: LoadAdminContactsParams = {}): Promise<{
    data: AdminContactRecord[];
    meta: AdminContactsMeta;
  }> {
    const queryParams = new URLSearchParams();

    if (params.q?.trim()) {
      queryParams.set("q", params.q.trim());
    }

    if (params.status?.trim()) {
      queryParams.set("status", params.status.trim());
    }

    if (params.source?.trim()) {
      queryParams.set("source", params.source.trim());
    }

    if (params.city?.trim()) {
      queryParams.set("city", params.city.trim());
    }

    if (params.page) {
      queryParams.set("page", String(params.page));
    }

    if (params.limit) {
      queryParams.set("limit", String(params.limit));
    }

    if (params.sortBy?.trim()) {
      queryParams.set("sortBy", params.sortBy.trim());
    }

    if (params.order?.trim()) {
      queryParams.set("order", params.order.trim());
    }

    try {
      const { data } = await apiClient.get<GetContactsResponse>("/contacts", {
        params: Object.fromEntries(queryParams.entries()),
      });
      const contacts = Array.isArray(data.data) ? data.data.map(mapBackendContact) : [];
      const page = data.meta?.page ?? params.page ?? 1;
      const limit = data.meta?.limit ?? params.limit ?? 10;
      const total = data.meta?.total ?? contacts.length;
      const totalPages =
        data.meta?.totalPages ?? (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

      return {
        data: contacts,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: data.meta?.hasNextPage ?? page < totalPages,
        },
      };
    } catch (error) {
      throw new Error(
        getBackendErrorMessage(error) ||
          "Impossible de charger les contacts pour le moment.",
      );
    }
  },

  async getContactById(id: string): Promise<AdminContactRecord> {
    try {
      const { data } = await apiClient.get<BackendContact>(`/contacts/${id}`);
      return mapBackendContact(data);
    } catch (error) {
      throw new Error(
        getBackendErrorMessage(error) ||
          "Impossible de charger cette fiche contact pour le moment.",
      );
    }
  },

  async updateContact(id: string, values: AdminContactFormValues): Promise<AdminContactRecord> {
    try {
      const payload = mapContactUpdatePayload(values);
      const { data } = await apiClient.patch<BackendContact>(`/contacts/${id}`, payload);
      return mapBackendContact(data);
    } catch (error) {
      throw new Error(
        getBackendErrorMessage(error) ||
          "Impossible de mettre a jour ce contact pour le moment.",
      );
    }
  },
};
