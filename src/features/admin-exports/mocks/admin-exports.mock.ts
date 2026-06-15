import { MOCK_ADMIN_CONTACTS } from "@/features/admin-contacts/mocks/admin-contacts.mock";
import { MOCK_CAMPAIGNS } from "@/features/campaigns/mocks/campaigns.mock";
import { MOCK_IMPORTS } from "@/features/imports/mocks/imports.mock";
import { MOCK_LISTS } from "@/features/lists/mocks/lists.mock";
import type {
  ExportFormValues,
  ExportFormat,
  ExportRecord,
  ExportSourceType,
  ExportStatus,
} from "@/types/export.types";

export const EXPORT_STATUS_OPTIONS: Array<{ value: ExportStatus; label: string }> = [
  { value: "completed", label: "Terminee" },
  { value: "processing", label: "En cours" },
  { value: "scheduled", label: "Programmee" },
  { value: "failed", label: "Erreur" },
];

export const EXPORT_FORMAT_OPTIONS: Array<{ value: ExportFormat; label: string }> = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
];

export const EXPORT_SOURCE_TYPE_OPTIONS: Array<{ value: ExportSourceType; label: string }> = [
  { value: "campaign", label: "Campagne" },
  { value: "list", label: "Liste" },
  { value: "directory", label: "Repertoire contacts" },
];

export const EXPORT_TEMPLATE_OPTIONS = [
  "Modele qualification plateau",
  "Modele callbacks supervision",
  "Modele contacts CRM standard",
  "Modele blacklist controle",
  "Modele reporting commercial",
] as const;

export const EXPORT_SOURCE_OPTIONS = {
  campaign: MOCK_CAMPAIGNS.map((campaign) => campaign.name),
  list: MOCK_LISTS.map((list) => list.name),
  directory: ["Repertoire admin complet", "Contacts actifs", "Contacts a relancer"],
} satisfies Record<ExportSourceType, string[]>;

export const MOCK_EXPORTS: ExportRecord[] = [
  {
    id: "exp-001",
    name: "Export callbacks habitat matin",
    sourceType: "campaign",
    sourceName: "Relance devis habitat",
    modelName: "Modele callbacks supervision",
    date: "2026-04-24 09:10",
    status: "completed",
    volume: 1840,
    format: "csv",
    generatedFile: "export_callbacks_habitat_2026_04_24.csv",
    linkedCampaign: "Relance devis habitat",
    linkedList: "Rappels sous 48h",
    linkedImport: "Import callbacks habitat",
    summary: "Extraction preparee pour le plateau relance avec contacts a rappeler sous 48h.",
  },
  {
    id: "exp-002",
    name: "Export qualification solaire supervision",
    sourceType: "list",
    sourceName: "Qualification solaire Q2",
    modelName: "Modele qualification plateau",
    date: "2026-04-23 16:42",
    status: "processing",
    volume: 5630,
    format: "excel",
    generatedFile: "qualification_solaire_supervision.xlsx",
    linkedCampaign: "Solar Elite Avril",
    linkedList: "Qualification solaire Q2",
    linkedImport: "Import qualification solaire",
    summary: "Fichier en preparation pour redistribution des leads qualifiables sur le plateau solaire.",
  },
  {
    id: "exp-003",
    name: "Export repertoire contacts actifs",
    sourceType: "directory",
    sourceName: "Contacts actifs",
    modelName: "Modele contacts CRM standard",
    date: "2026-04-22 11:28",
    status: "scheduled",
    volume: 6,
    format: "csv",
    generatedFile: "contacts_actifs_admin.csv",
    linkedCampaign: null,
    linkedList: null,
    linkedImport: null,
    summary: "Export programme du repertoire admin pour partage cross-modules et controle CRM.",
  },
  {
    id: "exp-004",
    name: "Export blacklist controle mars",
    sourceType: "list",
    sourceName: "Liste rouge prioritaire",
    modelName: "Modele blacklist controle",
    date: "2026-03-29 18:02",
    status: "failed",
    volume: 410,
    format: "excel",
    generatedFile: "blacklist_controle_mars.xlsx",
    linkedCampaign: "Aucune campagne",
    linkedList: "Liste rouge prioritaire",
    linkedImport: "Nettoyage blacklist mars",
    summary: "Derniere tentative d extraction rejetee suite a une revision du lot blacklist.",
  },
];

export function getExportStatusLabel(status: ExportStatus) {
  return EXPORT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getExportSourceTypeLabel(sourceType: ExportSourceType) {
  return EXPORT_SOURCE_TYPE_OPTIONS.find((option) => option.value === sourceType)?.label ?? sourceType;
}

export function buildExportPayload(values: ExportFormValues): ExportRecord {
  const matchedCampaign = MOCK_CAMPAIGNS.find((campaign) => campaign.name === values.sourceName);
  const matchedList = MOCK_LISTS.find((list) => list.name === values.sourceName);
  const matchedImport = MOCK_IMPORTS.find(
    (item) => item.listName === values.sourceName || item.campaign === values.sourceName,
  );
  const matchedDirectoryContacts =
    values.sourceType === "directory"
      ? values.sourceName === "Contacts actifs"
        ? MOCK_ADMIN_CONTACTS.filter((contact) =>
            ["qualified", "callback", "appointment", "in_progress"].includes(contact.status),
          ).length
        : values.sourceName === "Contacts a relancer"
          ? MOCK_ADMIN_CONTACTS.filter((contact) => contact.status === "callback").length
          : MOCK_ADMIN_CONTACTS.length
      : null;

  const volume =
    Number(values.volume) ||
    matchedCampaign?.contactsCount ||
    matchedList?.contactsCount ||
    matchedDirectoryContacts ||
    0;

  const sourceLabel =
    values.sourceType === "campaign"
      ? "campagne"
      : values.sourceType === "list"
        ? "liste"
        : "repertoire";

  return {
    id: `exp-${Date.now()}`,
    name: values.name.trim(),
    sourceType: values.sourceType,
    sourceName: values.sourceName,
    modelName: values.modelName,
    date: new Date().toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "completed",
    volume,
    format: values.format,
    generatedFile: `${values.name
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")}.${values.format === "csv" ? "csv" : "xlsx"}`,
    linkedCampaign: matchedCampaign?.name ?? matchedList?.campaign ?? null,
    linkedList: matchedList?.name ?? null,
    linkedImport: matchedImport?.name ?? null,
    summary: `Export ${sourceLabel} genere depuis ${values.sourceName} avec le modele ${values.modelName}.`,
  };
}
