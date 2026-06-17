export type ContactStatus =
  | "new"
  | "in_progress"
  | "callback"
  | "appointment"
  | "qualified"
  | "blacklisted"
  | "unreachable"
  | (string & {});

export interface AdminContactsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface LoadAdminContactsParams {
  q?: string;
  status?: string;
  source?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface AdminContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  phone2?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  city: string;
  postalCode?: string | null;
  source?: string | null;
  country?: string | null;
  status: ContactStatus;
  backendStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, unknown>;
  campaign?: string;
  listName?: string;
  sourceImport?: string;
  lastAction?: string;
  lastQualification?: string;
  note?: string;
}

export interface AdminContactFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  phone2: string;
  email: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  source: string;
  country: string;
  status: ContactStatus;
}

export interface AdminContactUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  company?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  source?: string;
  country?: string;
  status?: ContactStatus;
}
