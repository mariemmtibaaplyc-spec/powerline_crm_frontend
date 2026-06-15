export const CAMPAIGN_QUALIFICATION_TYPES = [
  "POSITIVE",
  "NEGATIVE",
  "NEUTRAL",
] as const;

export type CampaignQualificationType =
  (typeof CAMPAIGN_QUALIFICATION_TYPES)[number];

export interface CampaignQualificationRecord {
  id: string;
  name?: string;
  type?: CampaignQualificationType;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
