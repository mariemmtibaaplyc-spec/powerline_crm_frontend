import { apiClient } from "@/lib/axios";
import type {
  ConfirmImportResult,
  DetectedImportColumn,
  ImportDetectionResult,
  ImportPreviewStats,
  ImportRecord,
  ImportStatus,
  UploadImportPreviewPayload,
  UploadImportPreviewResult,
} from "@/types/import.types";
import axios from "axios";

type BackendImport = {
  id: string | number;
  file_name?: string | null;
  file_type?: string | null;
  status?: string | null;
  total_rows?: number | null;
  imported_rows?: number | null;
  duplicate_rows?: number | null;
  failed_rows?: number | null;
  created_at?: string | null;
  completed_at?: string | null;
  user?: unknown;
  list?: {
    name?: string | null;
  } | null;
};

type GetImportsResponse = {
  data: BackendImport[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

type GetImportByIdResponse = {
  data: BackendImport;
};

type DetectImportResponse = {
  data?: unknown;
  result?: unknown;
  columns?: unknown;
  detected_columns?: unknown;
  headers?: unknown;
  fields?: unknown;
  preview?: unknown;
  preview_rows?: unknown;
  rows?: unknown;
  examples?: unknown;
  file_name?: unknown;
  file_type?: unknown;
  total_rows?: unknown;
  separator?: unknown;
  encoding?: unknown;
  has_header?: unknown;
};

type UploadImportResponse = {
  data?: unknown;
  previewToken?: unknown;
  preview_token?: unknown;
  token?: unknown;
};

type ConfirmImportResponse = {
  data?: unknown;
  importLogId?: unknown;
  import_log_id?: unknown;
  id?: unknown;
};

function normalizeImportStatus(status: string | null | undefined): ImportStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "processing" ||
    normalizedStatus === "review" ||
    normalizedStatus === "error"
  ) {
    return normalizedStatus;
  }

  if (normalizedStatus === "success" || normalizedStatus === "done") {
    return "completed";
  }

  if (normalizedStatus === "pending" || normalizedStatus === "queued" || normalizedStatus === "running") {
    return "processing";
  }

  if (normalizedStatus === "failed") {
    return "error";
  }

  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
    return "error";
  }

  return "processing";
}

function mapBackendImport(item: BackendImport): ImportRecord {
  const fileName = item.file_name ?? `import-${item.id}`;
  const totalRows = item.total_rows ?? 0;
  const importedRows = item.imported_rows ?? 0;
  const duplicateRows = item.duplicate_rows ?? 0;
  const failedRows = item.failed_rows ?? 0;

  return {
    id: String(item.id),
    name: fileName,
    sourceFile: fileName,
    fileName,
    fileType: item.file_type ?? "",
    backendStatus: normalizeString(item.status).trim().toUpperCase() || undefined,
    campaign: "Aucune campagne",
    listName: item.list?.name ?? "Aucune liste",
    date: item.created_at ?? "",
    createdAt: item.created_at ?? undefined,
    completedAt: item.completed_at ?? null,
    status: normalizeImportStatus(item.status),
    totalImported: importedRows,
    totalRows,
    importedRows,
    duplicates: duplicateRows,
    duplicateRows,
    invalidPhones: failedRows,
    failedRows,
    separator: "",
    encoding: "",
    firstRowHeader: true,
    mappingPreview: [],
    scope: "prospects",
    attachmentMode: "",
    deduplicationMode: "none",
    deduplicationListName: null,
    user: item.user,
  };
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeId(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
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

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return undefined;
}

function getNestedRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function unwrapDetectRoot(payload: unknown): Record<string, unknown> {
  const root = getNestedRecord(payload) ?? {};
  const data = getNestedRecord(root.data);
  const result = getNestedRecord(root.result);

  if (data && Object.keys(data).length > 0) {
    return data;
  }

  if (result && Object.keys(result).length > 0) {
    return result;
  }

  return root;
}

function normalizeColumns(value: unknown): DetectedImportColumn[] {
  if (Array.isArray(value)) {
    const columns = value.map((item): DetectedImportColumn | null => {
        if (typeof item === "string") {
          return { name: item, sample: "" };
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const name =
            normalizeString(record.name) ||
            normalizeString(record.column) ||
            normalizeString(record.source) ||
            normalizeString(record.header) ||
            normalizeString(record.field);
          const sample =
            normalizeString(record.sample) ||
            normalizeString(record.example) ||
            normalizeString(record.value) ||
            normalizeString(record.preview);
          const target =
            normalizeString(record.target) ||
            normalizeString(record.crmField) ||
            normalizeString(record.crm_field) ||
            normalizeString(record.mapped_to);

          if (name) {
            return { name, sample, target: target || undefined };
          }
        }

        return null;
      });

    return columns.filter((item): item is DetectedImportColumn => item !== null);
  }

  const record = getNestedRecord(value);
  if (!record) {
    return [];
  }

  return Object.entries(record)
    .map(([key, rawValue]): DetectedImportColumn | null => {
      if (!key) {
        return null;
      }

      if (typeof rawValue === "string") {
        return { name: key, sample: rawValue };
      }

      if (Array.isArray(rawValue)) {
        return {
          name: key,
          sample: rawValue.length > 0 && rawValue[0] != null ? String(rawValue[0]) : "",
        };
      }

      const rawRecord = getNestedRecord(rawValue);
      if (!rawRecord) {
        return { name: key, sample: "" };
      }

      const sample =
        normalizeString(rawRecord.sample) ||
        normalizeString(rawRecord.example) ||
        normalizeString(rawRecord.value) ||
        normalizeString(rawRecord.preview);
      const target =
        normalizeString(rawRecord.target) ||
        normalizeString(rawRecord.crmField) ||
        normalizeString(rawRecord.crm_field) ||
        normalizeString(rawRecord.mapped_to);

      return {
        name: normalizeString(rawRecord.name) || key,
        sample,
        target: target || undefined,
      };
    })
    .filter((item): item is DetectedImportColumn => item !== null);
}

function normalizePreviewRows(
  value: unknown,
  columns: DetectedImportColumn[],
): Array<Record<string, string>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((row) => {
      if (Array.isArray(row)) {
        return Object.fromEntries(
          row.map((cell, index) => [columns[index]?.name ?? `column_${index + 1}`, cell == null ? "" : String(cell)]),
        );
      }

      if (!row || typeof row !== "object") {
        return null;
      }

      const record = row as Record<string, unknown>;
      const normalized = Object.fromEntries(
        Object.entries(record).map(([key, cell]) => [key, cell == null ? "" : String(cell)]),
      );

      return normalized;
    })
    .filter((row): row is Record<string, string> => row !== null);
}

function mapDetectImportResponse(payload: unknown, fallbackFileName: string): ImportDetectionResult {
  const root = unwrapDetectRoot(payload);
  const previewContainer =
    getNestedRecord(root.preview) ??
    getNestedRecord(root.examples) ??
    getNestedRecord(root.sample);
  const columns = normalizeColumns(
    root.columns ??
      root.detected_columns ??
      root.headers ??
      root.fields ??
      previewContainer?.columns,
  );
  const previewRows = normalizePreviewRows(
    root.preview_rows ??
      root.previewRows ??
      root.rows ??
      root.examples ??
      root.preview ??
      previewContainer?.rows ??
      previewContainer?.preview_rows,
    columns,
  );
  const fileName =
    normalizeString(root.file_name) ||
    normalizeString(root.filename) ||
    normalizeString(root.originalName) ||
    normalizeString(root.name) ||
    fallbackFileName;
  const fileType =
    normalizeString(root.file_type) ||
    normalizeString(root.mime_type) ||
    normalizeString(root.mimeType) ||
    normalizeString(root.type) ||
    undefined;
  const totalRows =
    normalizeNumber(root.total_rows) ??
    normalizeNumber(root.totalRows) ??
    normalizeNumber(root.row_count) ??
    normalizeNumber(previewContainer?.total_rows);
  const separator = normalizeString(root.separator) || undefined;
  const encoding = normalizeString(root.encoding) || undefined;
  const hasHeader = normalizeBoolean(root.has_header ?? root.hasHeader);

  return {
    fileName,
    fileType,
    columns,
    previewRows,
    totalRows,
    separator,
    encoding,
    hasHeader,
  };
}

function extractPreviewToken(payload: unknown) {
  const root = getNestedRecord(payload) ?? {};
  const data = getNestedRecord(root.data);

  return (
    normalizeString(data?.previewToken) ||
    normalizeString(data?.preview_token) ||
    normalizeString(data?.token) ||
    normalizeString(root.previewToken) ||
    normalizeString(root.preview_token) ||
    normalizeString(root.token)
  );
}

function extractImportPreviewStats(payload: unknown): ImportPreviewStats {
  const root = getNestedRecord(payload) ?? {};
  const data = getNestedRecord(root.data);
  const source = data ?? root;

  return {
    total_rows: normalizeNumber(source.total_rows),
    valid_rows: normalizeNumber(source.valid_rows),
    internal_duplicates: normalizeNumber(source.internal_duplicates),
    invalid_phones: normalizeNumber(source.invalid_phones),
    blacklisted: normalizeNumber(source.blacklisted),
    external_duplicates: normalizeNumber(source.external_duplicates),
  };
}

function extractConfirmImportResult(payload: unknown): ConfirmImportResult {
  const root = getNestedRecord(payload) ?? {};
  const data = getNestedRecord(root.data);

  return {
    importLogId: normalizeId(data?.importLogId) || normalizeId(data?.import_log_id) || normalizeId(root.importLogId) || normalizeId(root.import_log_id),
    id: normalizeId(data?.id) || normalizeId(root.id),
  };
}

export const importsApi = {
  async getImports(): Promise<ImportRecord[]> {
    const { data } = await apiClient.get<GetImportsResponse>("/imports");
    return data.data.map(mapBackendImport);
  },
  async getImportById(id: string): Promise<ImportRecord> {
    const { data } = await apiClient.get<GetImportByIdResponse | BackendImport>(`/imports/${id}`);
    const item = "data" in data ? data.data : data;
    return mapBackendImport(item);
  },
  async detectImportFile(file: File): Promise<ImportDetectionResult> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await apiClient.post("/imports/detect", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("imports.detect raw response", data);
      return mapDetectImportResponse(data, file.name);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : Array.isArray(error.response?.data?.message)
              ? error.response?.data?.message[0]
              : "";

        throw new Error(message || "Impossible de detecter ce fichier.");
      }

      throw error;
    }
  },
  async uploadImportPreview(payload: UploadImportPreviewPayload): Promise<UploadImportPreviewResult> {
    if (!(payload.file instanceof File)) {
      throw new Error("Veuillez selectionner un fichier avant de preparer l import.");
    }

    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("listName", payload.listName);
    formData.append("deduplicationScope", payload.deduplicationScope);
    formData.append("columnMapping", JSON.stringify(payload.columnMapping));

    if (payload.listId) {
      formData.append("listId", payload.listId);
    }

    if (payload.targetListId) {
      // Import worker owns list creation for new import lists.
      formData.append("targetListId", payload.targetListId);
    }

    try {
      const token =
        typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
      const headers = new axios.AxiosHeaders();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const debugEntries = Array.from(formData.entries()).map(([key, value]) => [
        key,
        value instanceof File
          ? { name: value.name, type: value.type, size: value.size }
          : value,
      ]);

      console.log("imports.upload formData entries", debugEntries);
      console.log("imports.upload columnMapping", payload.columnMapping);

      const { data } = await axios.post<UploadImportResponse>(
        `${apiClient.defaults.baseURL}/imports/upload`,
        formData,
        {
        headers,
        },
      );
      const previewToken = extractPreviewToken(data);

      if (!previewToken) {
        throw new Error("Le backend n a pas retourne de previewToken.");
      }

      return {
        previewToken,
        stats: extractImportPreviewStats(data),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : Array.isArray(error.response?.data?.message)
              ? error.response?.data?.message[0]
              : "";

        throw new Error(message || "Impossible de preparer l import.");
      }

      throw error;
    }
  },
  async confirmImport(previewToken: string): Promise<ConfirmImportResult> {
    try {
      const { data } = await apiClient.post<ConfirmImportResponse>("/imports/confirm", {
        previewToken,
      });

      return extractConfirmImportResult(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : Array.isArray(error.response?.data?.message)
              ? error.response?.data?.message[0]
              : "";

        throw new Error(message || "Impossible de confirmer l import.");
      }

      throw error;
    }
  },
};
