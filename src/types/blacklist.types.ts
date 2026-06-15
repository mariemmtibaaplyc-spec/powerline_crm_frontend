export type BlacklistStatus = "active" | "inactive";

export type BlacklistReason =
  | "do_not_call"
  | "invalid_number"
  | "duplicate_blocked"
  | "manual_blacklist"
  | "compliance_dnc"
  | "hostile_contact";

export interface BlacklistRecord {
  id: string;
  phone: string;
  reason: string;
  status: BlacklistStatus;
  addedAt: string;
  addedBy: string;
  note: string;
  removedAt?: string | null;
  contactId?: string | null;
  linkedCampaign?: string | null;
  sourceImport?: string | null;
  linkedContactName?: string | null;
}

export interface BlacklistFormValues {
  phone: string;
  reason?: string;
  contactId?: string;
  status?: BlacklistStatus;
  addedBy?: string;
  note?: string;
  linkedCampaign?: string;
  sourceImport?: string;
  linkedContactName?: string;
}
