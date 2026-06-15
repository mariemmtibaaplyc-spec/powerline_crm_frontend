import type { ListFormValues, ListRecord, ListStatus, ListType } from "@/types/list.types";

export const LIST_TYPE_OPTIONS: Array<{ value: ListType; label: string }> = [
  { value: "prospects", label: "Base prospects" },
  { value: "callback", label: "Relance" },
  { value: "qualification", label: "Qualification" },
  { value: "cleanup", label: "Nettoyage" },
  { value: "blacklist", label: "Blacklist" },
];

export const LIST_STATUS_OPTIONS: Array<{ value: ListStatus; label: string }> = [
  { value: "ready", label: "Prete" },
  { value: "importing", label: "En cours d import" },
  { value: "review", label: "En revision" },
  { value: "attached", label: "Attachee" },
  { value: "archived", label: "Archivee" },
];

export const LIST_SOURCE_OPTIONS = [
  "Import CSV B2B",
  "Export CRM historique",
  "Segmentation callbacks",
  "Nettoyage blacklist",
  "Fichier commercial regional",
] as const;

export const LIST_CAMPAIGN_OPTIONS = [
  "NAT ISA Residentiel",
  "Solar Elite Avril",
  "Relance devis habitat",
  "Reactivation clients premium",
  "Aucune campagne",
] as const;

export const MOCK_LISTS: ListRecord[] = [
  {
    id: "lst-001",
    name: "Base B2B Avril",
    type: "prospects",
    source: "Import CSV B2B",
    status: "attached",
    campaign: "NAT ISA Residentiel",
    contactsCount: 12400,
    hasContactsCount: true,
    importedAt: "2026-04-12",
    description: "Base principale de prospection residentielle prete pour diffusion outbound.",
    columnsPreview: ["Nom", "Prenom", "Telephone", "Ville", "Segment"],
  },
  {
    id: "lst-002",
    name: "Rappels sous 48h",
    type: "callback",
    source: "Segmentation callbacks",
    status: "ready",
    campaign: "Relance devis habitat",
    contactsCount: 1840,
    hasContactsCount: true,
    importedAt: "2026-04-18",
    description: "Liste de relance des prospects a rappeler dans les 48 heures.",
    columnsPreview: ["Client", "Telephone", "Date rappel", "Issue", "Campagne"],
  },
  {
    id: "lst-003",
    name: "Qualification solaire Q2",
    type: "qualification",
    source: "Fichier commercial regional",
    status: "review",
    campaign: "Solar Elite Avril",
    contactsCount: 5630,
    hasContactsCount: true,
    importedAt: "2026-04-20",
    description: "Fichier de qualification sur les leads solaires du trimestre en cours.",
    columnsPreview: ["Lead", "Telephone", "Region", "Source", "Priorite"],
  },
  {
    id: "lst-004",
    name: "Nettoyage doublons habitat",
    type: "cleanup",
    source: "Export CRM historique",
    status: "importing",
    campaign: "Aucune campagne",
    contactsCount: 920,
    hasContactsCount: true,
    importedAt: "2026-04-24",
    description: "Liste technique de verification des doublons avant diffusion.",
    columnsPreview: ["ID CRM", "Telephone", "Email", "Doublon", "Etat"],
  },
  {
    id: "lst-005",
    name: "Liste rouge prioritaire",
    type: "blacklist",
    source: "Nettoyage blacklist",
    status: "archived",
    campaign: "Aucune campagne",
    contactsCount: 410,
    hasContactsCount: true,
    importedAt: "2026-03-29",
    description: "Liste d exclusion et de controle conformite avant remise en production.",
    columnsPreview: ["Numero", "Motif", "Date ajout", "Source"],
  },
];

export function getListTypeLabel(type: ListType) {
  return LIST_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getListStatusLabel(status: ListStatus) {
  return LIST_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function createListPayload(values: ListFormValues): ListRecord {
  return {
    id: `lst-${Date.now()}`,
    name: values.name.trim(),
    type: values.type,
    source: values.source.trim(),
    status: values.status,
    campaign: values.campaign.trim(),
    contactsCount: Number(values.contactsCount) || 0,
    hasContactsCount: true,
    importedAt: new Date().toISOString().slice(0, 10),
    description: values.description.trim(),
    columnsPreview: ["Nom", "Telephone", "Campagne", "Statut"],
  };
}
