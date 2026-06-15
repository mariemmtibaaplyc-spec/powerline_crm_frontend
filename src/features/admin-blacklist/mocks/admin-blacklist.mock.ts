import { MOCK_ADMIN_CONTACTS } from "@/features/admin-contacts/mocks/admin-contacts.mock";
import { MOCK_CAMPAIGNS } from "@/features/campaigns/mocks/campaigns.mock";
import { MOCK_IMPORTS } from "@/features/imports/mocks/imports.mock";
import type {
  BlacklistFormValues,
  BlacklistReason,
  BlacklistRecord,
  BlacklistStatus,
} from "@/types/blacklist.types";

export const BLACKLIST_STATUS_OPTIONS: Array<{ value: BlacklistStatus; label: string }> = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
];

export const BLACKLIST_REASON_OPTIONS: Array<{ value: BlacklistReason; label: string }> = [
  { value: "do_not_call", label: "Refus d etre rappele" },
  { value: "invalid_number", label: "Faux numero" },
  { value: "duplicate_blocked", label: "Doublon bloque" },
  { value: "manual_blacklist", label: "Blacklist manuelle" },
  { value: "compliance_dnc", label: "Conformite / DNC" },
  { value: "hostile_contact", label: "Client hostile / opposition contact" },
];

export const BLACKLIST_CAMPAIGN_OPTIONS = [
  "Aucune campagne",
  ...MOCK_CAMPAIGNS.map((campaign) => campaign.name),
] as const;

export const BLACKLIST_IMPORT_OPTIONS = [
  "Aucun import",
  ...MOCK_IMPORTS.map((item) => item.name),
] as const;

export const BLACKLIST_CONTACT_OPTIONS = [
  "Aucun contact",
  ...MOCK_ADMIN_CONTACTS.map((contact) => `${contact.firstName} ${contact.lastName}`),
] as const;

export const MOCK_BLACKLIST: BlacklistRecord[] = [
  {
    id: "blk-001",
    phone: "+216 27 901 115",
    reason: "do_not_call",
    status: "active",
    addedAt: "2026-04-26 09:18",
    addedBy: "root admin",
    note: "Prospect a demande l arret complet des relances commerciales.",
    linkedCampaign: "Relance devis habitat",
    sourceImport: "Import callbacks habitat",
    linkedContactName: "Nour Gharbi",
  },
  {
    id: "blk-002",
    phone: "+216 24 881 994",
    reason: "compliance_dnc",
    status: "active",
    addedAt: "2026-04-24 17:03",
    addedBy: "Nadia Khemiri",
    note: "Numero place en opposition marketing apres controle conformite.",
    linkedCampaign: "Aucune campagne",
    sourceImport: "Nettoyage blacklist mars",
    linkedContactName: "Karim Bouzid",
  },
  {
    id: "blk-003",
    phone: "+216 22 640 317",
    reason: "invalid_number",
    status: "active",
    addedAt: "2026-04-23 12:11",
    addedBy: "Leila Trabelsi",
    note: "Numero detecte invalide apres plusieurs tentatives de composition.",
    linkedCampaign: "Relance devis habitat",
    sourceImport: "Import callbacks habitat",
    linkedContactName: "Walid Dridi",
  },
  {
    id: "blk-004",
    phone: "+216 26 381 004",
    reason: "duplicate_blocked",
    status: "inactive",
    addedAt: "2026-04-21 15:44",
    addedBy: "Karim Mansouri",
    note: "Blocage temporaire suite a un doublon, relecture effectuee par admin.",
    linkedCampaign: "Solar Elite Avril",
    sourceImport: "Import qualification solaire",
    linkedContactName: "Leila Khadraoui",
  },
  {
    id: "blk-005",
    phone: "+216 23 704 522",
    reason: "manual_blacklist",
    status: "active",
    addedAt: "2026-04-26 11:27",
    addedBy: "root admin",
    note: "Exclusion manuelle demandee par le control room avant reprise de diffusion.",
    linkedCampaign: "NAT ISA Residentiel",
    sourceImport: "Import B2B Avril",
    linkedContactName: "Sami Ben Amor",
  },
  {
    id: "blk-006",
    phone: "+216 29 314 661",
    reason: "hostile_contact",
    status: "inactive",
    addedAt: "2026-04-19 18:09",
    addedBy: "Support CRM",
    note: "Historique conflictuel cloture, fiche conservee hors diffusion active.",
    linkedCampaign: "Reactivation clients premium",
    sourceImport: "Aucun import",
    linkedContactName: "Rim Mnasri",
  },
];

export function getBlacklistStatusLabel(status: BlacklistStatus) {
  return BLACKLIST_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getBlacklistReasonLabel(reason: string) {
  return BLACKLIST_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason;
}

export function buildBlacklistPayload(values: BlacklistFormValues): BlacklistRecord {
  return {
    id: `blk-${Date.now()}`,
    phone: values.phone.trim(),
    reason: values.reason?.trim() || "Blacklist manuelle",
    status: values.status ?? "active",
    addedAt: new Date().toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    addedBy: values.addedBy?.trim() || "root admin",
    note: values.note?.trim() || "",
    contactId: values.contactId?.trim() || null,
    linkedCampaign:
      values.linkedCampaign?.trim() && values.linkedCampaign !== "Aucune campagne"
        ? values.linkedCampaign.trim()
        : null,
    sourceImport:
      values.sourceImport?.trim() && values.sourceImport !== "Aucun import"
        ? values.sourceImport.trim()
        : null,
    linkedContactName:
      values.linkedContactName?.trim() && values.linkedContactName !== "Aucun contact"
        ? values.linkedContactName.trim()
        : null,
  };
}
