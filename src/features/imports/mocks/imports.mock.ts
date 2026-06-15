import { MOCK_LISTS } from "@/features/lists/mocks/lists.mock";
import type {
  DeduplicationMode,
  ImportRecord,
  ImportStatus,
  ImportWizardValues,
} from "@/types/import.types";

export const IMPORT_STATUS_OPTIONS: Array<{ value: ImportStatus; label: string }> = [
  { value: "completed", label: "Termine" },
  { value: "processing", label: "En cours" },
  { value: "review", label: "En revision" },
  { value: "error", label: "Erreur" },
];

export const IMPORT_SCOPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "prospects", label: "Base prospects" },
  { value: "qualification", label: "Qualification" },
  { value: "callback", label: "Relance" },
  { value: "blacklist", label: "Blacklist / nettoyage" },
];

export const IMPORT_SOURCE_OPTIONS = [
  "import_b2b_avril.csv",
  "qualification_solaire_q2.csv",
  "callbacks_habitat_48h.csv",
  "blacklist_nettoyage_mars.csv",
  "reactivation_clients_premium.csv",
] as const;

export const IMPORT_ATTACHMENT_OPTIONS = [
  "Attacher directement a une campagne",
  "Preparer une liste pour diffusion",
  "Charger une base en revision admin",
] as const;

export const IMPORT_SEPARATOR_OPTIONS = ["Virgule (,)", "Point-virgule (;)", "Tabulation"] as const;

export const IMPORT_ENCODING_OPTIONS = ["UTF-8", "ISO-8859-1", "Windows-1252"] as const;

export const IMPORT_MAPPING_PROFILES = [
  "Mapping CRM standard",
  "Mapping qualification",
  "Mapping callbacks",
  "Mapping blacklist",
] as const;

export const DEDUPLICATION_OPTIONS: Array<{
  value: DeduplicationMode;
  title: string;
  description: string;
}> = [
  {
    value: "all_contacts",
    title: "Toute la base des contacts",
    description: "Controle le dedoublonnage sur l ensemble de la base CRM disponible.",
  },
  {
    value: "campaign_lists",
    title: "Listes de la campagne",
    description: "Compare seulement avec les listes deja attachees a la campagne cible.",
  },
  {
    value: "active_lists",
    title: "Listes actives",
    description: "Controle les doublons uniquement sur les listes actuellement en diffusion.",
  },
  {
    value: "specific_list",
    title: "Une liste specifique",
    description: "Permet de dedoublonner contre une seule liste choisie par l admin.",
  },
  {
    value: "none",
    title: "Aucun",
    description: "Charge les donnees sans controle de dedoublonnage sur la V1 mockee.",
  },
];

export const MOCK_IMPORTS: ImportRecord[] = [
  {
    id: "imp-001",
    name: "Import B2B Avril",
    sourceFile: "import_b2b_avril.csv",
    campaign: "NAT ISA Residentiel",
    listName: "Base B2B Avril",
    date: "2026-04-12 11:42",
    status: "completed",
    totalImported: 12400,
    duplicates: 284,
    invalidPhones: 63,
    separator: "Point-virgule (;)",
    encoding: "UTF-8",
    firstRowHeader: true,
    mappingPreview: [
      { source: "first_name", target: "Prenom" },
      { source: "last_name", target: "Nom" },
      { source: "phone_1", target: "Telephone" },
      { source: "city", target: "Ville" },
    ],
    scope: "prospects",
    attachmentMode: "Attacher directement a une campagne",
    deduplicationMode: "campaign_lists",
    deduplicationListName: null,
  },
  {
    id: "imp-002",
    name: "Import qualification solaire",
    sourceFile: "qualification_solaire_q2.csv",
    campaign: "Solar Elite Avril",
    listName: "Qualification solaire Q2",
    date: "2026-04-20 09:18",
    status: "review",
    totalImported: 5630,
    duplicates: 151,
    invalidPhones: 28,
    separator: "Virgule (,)",
    encoding: "UTF-8",
    firstRowHeader: true,
    mappingPreview: [
      { source: "lead_name", target: "Nom prospect" },
      { source: "mobile", target: "Telephone" },
      { source: "source", target: "Source lead" },
      { source: "priority", target: "Priorite" },
    ],
    scope: "qualification",
    attachmentMode: "Preparer une liste pour diffusion",
    deduplicationMode: "active_lists",
    deduplicationListName: null,
  },
  {
    id: "imp-003",
    name: "Import callbacks habitat",
    sourceFile: "callbacks_habitat_48h.csv",
    campaign: "Relance devis habitat",
    listName: "Rappels sous 48h",
    date: "2026-04-24 14:06",
    status: "processing",
    totalImported: 1840,
    duplicates: 57,
    invalidPhones: 11,
    separator: "Point-virgule (;)",
    encoding: "Windows-1252",
    firstRowHeader: true,
    mappingPreview: [
      { source: "client", target: "Client" },
      { source: "callback_date", target: "Date rappel" },
      { source: "phone", target: "Telephone" },
      { source: "reason", target: "Motif" },
    ],
    scope: "callback",
    attachmentMode: "Attacher directement a une campagne",
    deduplicationMode: "specific_list",
    deduplicationListName: "Rappels sous 48h",
  },
  {
    id: "imp-004",
    name: "Nettoyage blacklist mars",
    sourceFile: "blacklist_nettoyage_mars.csv",
    campaign: "Aucune campagne",
    listName: "Liste rouge prioritaire",
    date: "2026-03-29 17:23",
    status: "error",
    totalImported: 410,
    duplicates: 36,
    invalidPhones: 8,
    separator: "Virgule (,)",
    encoding: "UTF-8",
    firstRowHeader: true,
    mappingPreview: [
      { source: "number", target: "Numero" },
      { source: "reason", target: "Motif exclusion" },
      { source: "created_at", target: "Date ajout" },
    ],
    scope: "blacklist",
    attachmentMode: "Charger une base en revision admin",
    deduplicationMode: "all_contacts",
    deduplicationListName: null,
  },
];

export function getImportStatusLabel(status: ImportStatus) {
  return IMPORT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getImportScopeLabel(scope: string) {
  return IMPORT_SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? scope;
}

export function getDeduplicationLabel(mode: DeduplicationMode) {
  return DEDUPLICATION_OPTIONS.find((option) => option.value === mode)?.title ?? mode;
}

function formatImportDate(date: Date) {
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildImportResult(values: ImportWizardValues): ImportRecord {
  const matchedList = MOCK_LISTS.find((item) => item.name === values.listName);
  const baseVolume = Number(values.estimatedRows) || matchedList?.contactsCount || 3200;
  const duplicates =
    values.deduplicationMode === "none"
      ? 0
      : Math.max(12, Math.round(baseVolume * (values.deduplicationMode === "all_contacts" ? 0.08 : 0.035)));
  const invalidPhones = Math.max(4, Math.round(baseVolume * 0.009));
  const totalImported = Math.max(0, baseVolume);

  return {
    id: `imp-${Date.now()}`,
    name: values.name.trim(),
    sourceFile: values.sourceFile,
    campaign: "Aucune campagne",
    listName: values.listName,
    date: formatImportDate(new Date()),
    status: values.deduplicationMode === "none" ? "review" : "completed",
    totalImported,
    duplicates,
    invalidPhones,
    separator: values.separator,
    encoding: values.encoding,
    firstRowHeader: values.firstRowHeader === "yes",
    mappingPreview: [
      { source: "first_name", target: "Prenom" },
      { source: "last_name", target: "Nom" },
      { source: "phone_1", target: "Telephone" },
      { source: "campaign", target: "Campagne" },
    ],
    scope: "prospects",
    attachmentMode: "",
    deduplicationMode: values.deduplicationMode,
    deduplicationListName:
      values.deduplicationMode === "specific_list" ? values.deduplicationListName || null : null,
  };
}
