export type ImportStatus = "completed" | "processing" | "review" | "error";

export type ImportScope = "prospects" | "qualification" | "callback" | "blacklist";

export type DeduplicationMode =
  | "all_contacts"
  | "campaign_lists"
  | "active_lists"
  | "specific_list"
  | "none";

export interface DetectedImportColumn {
  name: string;
  sample?: string;
  target?: string;
}

export interface ImportDetectionResult {
  fileName: string;
  fileType?: string;
  columns: DetectedImportColumn[];
  previewRows: Array<Record<string, string>>;
  totalRows?: number;
  separator?: string;
  encoding?: string;
  hasHeader?: boolean;
}

export type ContactFieldTarget =
  | "phone"
  | "first_name"
  | "last_name"
  | "city"
  | "address"
  | "email"
  | "company"
  | "postal_code"
  | "notes";

export type DeduplicationScopeBackend =
  | "ALL_BASE"
  | "CAMPAIGN"
  | "ACTIVE_LISTS"
  | "SPECIFIC_LIST"
  | "NONE";

export interface UploadImportPreviewPayload {
  file: File;
  listName: string;
  deduplicationScope: DeduplicationScopeBackend;
  columnMapping: Record<string, string>;
  listId?: string;
  targetListId?: string;
}

export interface ImportPreviewStats {
  total_rows?: number;
  valid_rows?: number;
  internal_duplicates?: number;
  invalid_phones?: number;
  blacklisted?: number;
  external_duplicates?: number;
}

export interface UploadImportPreviewResult {
  previewToken: string;
  stats: ImportPreviewStats;
}

export interface ConfirmImportResult {
  importLogId?: string;
  id?: string;
}

export interface ImportRecord {
  id: string;
  name: string;
  sourceFile: string;
  fileName?: string;
  fileType?: string;
  backendStatus?: string;
  campaign: string;
  listName: string;
  date: string;
  createdAt?: string;
  completedAt?: string | null;
  status: ImportStatus;
  totalImported: number;
  totalRows?: number;
  importedRows?: number;
  duplicates: number;
  duplicateRows?: number;
  invalidPhones: number;
  failedRows?: number;
  separator: string;
  encoding: string;
  firstRowHeader: boolean;
  mappingPreview: Array<{ source: string; target: string }>;
  scope: ImportScope;
  attachmentMode: string;
  deduplicationMode: DeduplicationMode;
  deduplicationListName?: string | null;
  user?: unknown;
}

export interface ImportWizardValues {
  name: string;
  sourceFile: string;
  listName: string;
  estimatedRows: string;
  separator: string;
  encoding: string;
  firstRowHeader: "yes" | "no";
  deduplicationMode: DeduplicationMode;
  deduplicationListName: string;
}
