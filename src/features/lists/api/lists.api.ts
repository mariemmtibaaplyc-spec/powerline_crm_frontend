import { apiClient } from "@/lib/axios";
import type {
  LoadListContactsParams,
  ListContactRecord,
  ListFormValues,
  ListImportLogRecord,
  ListRecord,
  ListsPaginationMeta,
  LoadListsParams,
  ListStatus,
  ListType,
} from "@/types/list.types";

type BackendList = {
  id: string | number;
  name?: string | null;
  description?: string | null;
  status?: string | null;
  type?: string | null;
  source?: string | null;
  campaign?: string | null;
  campaign_name?: string | null;
  contact_count?: number | string | null;
  contacts_count?: number | string | null;
  total_contacts?: number | string | null;
  contactCount?: number | string | null;
  contactsCount?: number | string | null;
  totalContacts?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  imported_at?: string | null;
  imports_count?: number | string | null;
  contacts?: unknown;
  import_logs?: unknown;
};

type GetListsResponse = {
  data?: BackendList[];
  meta?: Partial<ListsPaginationMeta>;
};

type GetListByIdResponse = {
  data?: BackendList;
};

type CreateListResponse =
  | BackendList
  | {
      data?: BackendList;
    };

type BackendListContact = {
  id: string | number;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type GetListContactsResponse = {
  data?: BackendListContact[];
  meta?: Partial<ListsPaginationMeta>;
};

function normalizeListStatus(status: string | null | undefined): ListStatus {
  const normalized = status?.trim().toLowerCase();

  if (
    normalized === "ready" ||
    normalized === "importing" ||
    normalized === "review" ||
    normalized === "attached" ||
    normalized === "archived"
  ) {
    return normalized;
  }

  if (normalized === "done" || normalized === "completed" || normalized === "active") {
    return "attached";
  }

  if (normalized === "pending" || normalized === "processing" || normalized === "running") {
    return "importing";
  }

  if (normalized === "draft" || normalized === "new") {
    return "ready";
  }

  return "ready";
}

function normalizeListType(type: string | null | undefined): ListType {
  const normalized = type?.trim().toLowerCase();

  if (
    normalized === "prospects" ||
    normalized === "callback" ||
    normalized === "qualification" ||
    normalized === "cleanup" ||
    normalized === "blacklist"
  ) {
    return normalized;
  }

  if (normalized === "contact" || normalized === "contacts" || normalized === "import") {
    return "prospects";
  }

  return "prospects";
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getNestedRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function mapContact(item: unknown): ListContactRecord | null {
  const record = getNestedRecord(item);
  if (!record) {
    return null;
  }

  const id = record.id;
  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  return {
    id: String(id),
    firstName: normalizeString(record.first_name ?? record.firstName) || undefined,
    lastName: normalizeString(record.last_name ?? record.lastName) || undefined,
    phone: normalizeString(record.phone) || undefined,
    email: normalizeString(record.email) || undefined,
    city: normalizeString(record.city) || undefined,
    status: normalizeString(record.status) || undefined,
    createdAt: normalizeString(record.created_at ?? record.createdAt) || undefined,
    updatedAt: normalizeString(record.updated_at ?? record.updatedAt) || undefined,
  };
}

function mapImportLog(item: unknown): ListImportLogRecord | null {
  const record = getNestedRecord(item);
  if (!record) {
    return null;
  }

  const id = record.id;
  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  return {
    id: String(id),
    status: normalizeString(record.status) || undefined,
    totalRows: normalizeNumber(record.total_rows ?? record.totalRows),
    importedRows: normalizeNumber(record.imported_rows ?? record.importedRows),
    duplicateRows: normalizeNumber(record.duplicate_rows ?? record.duplicateRows),
    failedRows: normalizeNumber(record.failed_rows ?? record.failedRows),
    completedAt: normalizeString(record.completed_at ?? record.completedAt) || undefined,
  };
}

function mapBackendList(item: BackendList): ListRecord {
  const contactsCount =
    getOptionalNumber(
      item.contact_count ??
      item.contacts_count ??
      item.total_contacts ??
      item.contactCount ??
      item.contactsCount ??
      item.totalContacts,
    );

  return {
    id: String(item.id),
    name: item.name?.trim() || `Liste ${item.id}`,
    description: item.description?.trim() || "",
    status: normalizeListStatus(item.status),
    type: normalizeListType(item.type),
    source: item.source?.trim() || "",
    campaign: item.campaign?.trim() || item.campaign_name?.trim() || "",
    contactsCount: contactsCount ?? 0,
    hasContactsCount: contactsCount != null,
    importedAt: item.created_at || item.imported_at || "",
    createdAt: item.created_at || undefined,
    updatedAt: item.updated_at || undefined,
    importsCount: normalizeNumber(item.imports_count),
    contacts: Array.isArray(item.contacts) ? item.contacts.map(mapContact).filter((entry): entry is ListContactRecord => entry !== null) : undefined,
    importLogs: Array.isArray(item.import_logs) ? item.import_logs.map(mapImportLog).filter((entry): entry is ListImportLogRecord => entry !== null) : undefined,
    columnsPreview: [],
  };
}

function toBackendListStatus(status: ListStatus) {
  if (status === "archived") {
    return "ARCHIVED";
  }

  return "ACTIVE";
}

export const listsApi = {
  async getLists(params: LoadListsParams = {}): Promise<{
    data: ListRecord[];
    meta: ListsPaginationMeta;
  }> {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.set("page", String(params.page));
    }

    if (params.limit) {
      queryParams.set("limit", String(params.limit));
    }

    if (params.q?.trim()) {
      queryParams.set("q", params.q.trim());
    }

    if (params.status?.trim()) {
      queryParams.set("status", params.status.trim());
    }

    if (params.type?.trim()) {
      queryParams.set("type", params.type.trim());
    }

    const { data } = await apiClient.get<GetListsResponse>("/lists", {
      params: Object.fromEntries(queryParams.entries()),
    });

    const items = Array.isArray(data.data) ? data.data.map(mapBackendList) : [];
    const page = data.meta?.page ?? params.page ?? 1;
    const limit = data.meta?.limit ?? params.limit ?? 10;
    const total = data.meta?.total ?? items.length;
    const totalPages =
      data.meta?.totalPages ?? (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: data.meta?.hasNextPage ?? page < totalPages,
      },
    };
  },
  async getListById(id: string): Promise<ListRecord> {
    const { data } = await apiClient.get<GetListByIdResponse | BackendList>(`/lists/${id}`);
    const item =
      "data" in data && data.data
        ? data.data
        : (data as BackendList);

    if (!item || typeof item !== "object") {
      throw new Error("Liste introuvable.");
    }

    return mapBackendList(item);
  },
  async createList(values: ListFormValues): Promise<ListRecord> {
    const payload = {
      name: values.name.trim(),
    };

    const { data } = await apiClient.post<CreateListResponse>("/lists", payload);
    const item =
      "data" in data && data.data
        ? data.data
        : (data as BackendList);

    if (!item || typeof item !== "object") {
      throw new Error("Impossible de creer la liste.");
    }

    return mapBackendList(item);
  },
  async getListContacts(
    listId: string,
    params: LoadListContactsParams = {},
  ): Promise<{ data: ListContactRecord[]; meta: ListsPaginationMeta }> {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.set("page", String(params.page));
    }

    if (params.limit) {
      queryParams.set("limit", String(params.limit));
    }

    const { data } = await apiClient.get<GetListContactsResponse>(`/lists/${listId}/contacts`, {
      params: Object.fromEntries(queryParams.entries()),
    });

    const items = Array.isArray(data.data)
      ? data.data.map(mapContact).filter((entry): entry is ListContactRecord => entry !== null)
      : [];
    const page = data.meta?.page ?? params.page ?? 1;
    const limit = data.meta?.limit ?? params.limit ?? 30;
    const total = data.meta?.total ?? items.length;
    const totalPages =
      data.meta?.totalPages ?? (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: data.meta?.hasNextPage ?? page < totalPages,
      },
    };
  },
  async updateListStatus(id: string, status: ListStatus): Promise<void> {
    await apiClient.patch(`/lists/${id}/status`, {
      status: toBackendListStatus(status),
    });
  },
};
