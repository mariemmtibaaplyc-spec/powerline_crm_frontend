export type CampaignType = "outbound" | "inbound";

export type CampaignStatus = "active" | "paused" | "closed" | "inactive";

export interface CampaignRecord {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  agentsCount: number;
  leadsCount: number;
  team?: string;
  group?: string;
  contactsCount?: number;
  assignedAgents?: number;
  cadence?: string;
  priority?: string;
  lists?: string[];
  qualificationFlow?: string[];
  manager?: string;
}

export interface CampaignFormValues {
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
}
