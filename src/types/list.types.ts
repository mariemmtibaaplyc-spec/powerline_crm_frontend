export type ListType = "prospects" | "callback" | "qualification" | "cleanup" | "blacklist";

export type ListStatus = "ready" | "importing" | "review" | "attached" | "archived";

export interface ListsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface LoadListsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  type?: string;
}

export interface ListContactRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  city?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListImportLogRecord {
  id: string;
  status?: string;
  totalRows?: number;
  importedRows?: number;
  duplicateRows?: number;
  failedRows?: number;
  completedAt?: string;
}

export interface ListRecord {
  id: string;
  name: string;
  type: ListType;
  source: string;
  status: ListStatus;
  campaign: string;
  contactsCount: number;
  hasContactsCount: boolean;
  importedAt: string;
  createdAt?: string;
  updatedAt?: string;
  description: string;
  importsCount?: number;
  contacts?: ListContactRecord[];
  importLogs?: ListImportLogRecord[];
  columnsPreview: string[];
}

export interface LoadListContactsParams {
  page?: number;
  limit?: number;
}

export interface ListFormValues {
  name: string;
  type: ListType;
  source: string;
  status: ListStatus;
  campaign: string;
  contactsCount: string;
  description: string;
}
