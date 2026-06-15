import type { DeduplicationMode, ImportStatus } from "@/types/import.types";

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

export const IMPORT_SEPARATOR_OPTIONS = ["Virgule (,)", "Point-virgule (;)", "Tabulation"] as const;

export const IMPORT_ENCODING_OPTIONS = ["UTF-8", "ISO-8859-1", "Windows-1252"] as const;

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
    description: "Charge les donnees sans controle de dedoublonnage sur la V1.",
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
