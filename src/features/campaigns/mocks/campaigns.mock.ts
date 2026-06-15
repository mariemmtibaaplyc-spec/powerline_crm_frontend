import type {
  CampaignFormValues,
  CampaignRecord,
  CampaignStatus,
  CampaignType,
} from "@/types/campaign.types";

export const CAMPAIGN_TYPE_OPTIONS: Array<{ value: CampaignType; label: string }> = [
  { value: "outbound", label: "Outbound" },
  { value: "inbound", label: "Inbound" },
];

export const CAMPAIGN_STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "paused", label: "En pause" },
  { value: "inactive", label: "Inactive" },
  { value: "closed", label: "Cloturee" },
];

export const CAMPAIGN_TEAMS = [
  "Outbound Energie",
  "Outbound Solaire",
  "Qualification Residentiel",
  "Reactivation Premium",
  "Control room",
  "Retention Habitat",
] as const;

export const CAMPAIGN_GROUPS = [
  "NAT ISA",
  "Solar Elite",
  "Eco Habitat",
  "EMY ecologie",
  "Support CRM",
  "Reactivation Premium",
] as const;

export const CAMPAIGN_LIST_OPTIONS = [
  "Base B2B Avril",
  "Leads chauds T2",
  "Rappels sous 48h",
  "Fichier reactivation premium",
  "Listes rouges filtrees",
  "Prospects habitat juillet",
] as const;

export const MOCK_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "cmp-001",
    name: "NAT ISA Residentiel",
    description: "",
    type: "outbound",
    status: "active",
    startDate: undefined,
    endDate: undefined,
    createdBy: "admin",
    team: "Outbound Energie",
    group: "NAT ISA",
    agentsCount: 16,
    leadsCount: 18420,
    contactsCount: 18420,
    assignedAgents: 16,
    createdAt: "2026-02-03",
    updatedAt: undefined,
    cadence: "Cadence standard",
    priority: "Haute",
    lists: ["Base B2B Avril", "Leads chauds T2"],
    qualificationFlow: ["Interesse", "Rappel", "RDV", "Refus"],
    manager: "Leila Trabelsi",
  },
  {
    id: "cmp-002",
    name: "Solar Elite Avril",
    description: "",
    type: "inbound",
    status: "active",
    startDate: undefined,
    endDate: undefined,
    createdBy: "admin",
    team: "Qualification Residentiel",
    group: "Solar Elite",
    agentsCount: 11,
    leadsCount: 9650,
    contactsCount: 9650,
    assignedAgents: 11,
    createdAt: "2026-02-16",
    updatedAt: undefined,
    cadence: "Cadence soutenue",
    priority: "Moyenne",
    lists: ["Prospects habitat juillet"],
    qualificationFlow: ["Qualifie", "A relancer", "Non joignable"],
    manager: "Yassine Brahmi",
  },
  {
    id: "cmp-003",
    name: "Relance devis habitat",
    description: "",
    type: "inbound",
    status: "paused",
    startDate: undefined,
    endDate: undefined,
    createdBy: "admin",
    team: "Retention Habitat",
    group: "Eco Habitat",
    agentsCount: 7,
    leadsCount: 4120,
    contactsCount: 4120,
    assignedAgents: 7,
    createdAt: "2026-03-02",
    updatedAt: undefined,
    cadence: "Cadence moderee",
    priority: "Haute",
    lists: ["Rappels sous 48h"],
    qualificationFlow: ["Rappel", "RDV", "Refus"],
    manager: "Nadia Khemiri",
  },
  {
    id: "cmp-004",
    name: "Reactivation clients premium",
    description: "",
    type: "inbound",
    status: "inactive",
    startDate: undefined,
    endDate: undefined,
    createdBy: "admin",
    team: "Reactivation Premium",
    group: "Reactivation Premium",
    agentsCount: 5,
    leadsCount: 2300,
    contactsCount: 2300,
    assignedAgents: 5,
    createdAt: "2026-03-17",
    updatedAt: undefined,
    cadence: "Cadence test",
    priority: "Basse",
    lists: ["Fichier reactivation premium"],
    qualificationFlow: ["Interesse", "Rappel", "Refus"],
    manager: "Karim Mansouri",
  },
  {
    id: "cmp-005",
    name: "Campagne nettoyage blacklist",
    description: "",
    type: "inbound",
    status: "closed",
    startDate: undefined,
    endDate: undefined,
    createdBy: "admin",
    team: "Control room",
    group: "Support CRM",
    agentsCount: 3,
    leadsCount: 780,
    contactsCount: 780,
    assignedAgents: 3,
    createdAt: "2026-01-28",
    updatedAt: undefined,
    cadence: "Cadence controle",
    priority: "Moyenne",
    lists: ["Listes rouges filtrees"],
    qualificationFlow: ["Valide", "Bloque", "A verifier"],
    manager: "Nadia Khemiri",
  },
];

export function getCampaignTypeLabel(type: CampaignType) {
  return CAMPAIGN_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getCampaignStatusLabel(status: CampaignStatus) {
  return CAMPAIGN_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function createCampaignPayload(values: CampaignFormValues): CampaignRecord {
  return {
    id: `cmp-${Date.now()}`,
    name: values.name.trim(),
    description: values.description.trim(),
    type: values.type,
    status: values.status,
    startDate: values.startDate.trim() || undefined,
    endDate: values.endDate.trim() || undefined,
    createdBy: "admin",
    updatedAt: undefined,
    agentsCount: 0,
    leadsCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}
