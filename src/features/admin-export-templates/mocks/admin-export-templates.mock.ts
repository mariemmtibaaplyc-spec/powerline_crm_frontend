import type {
  ExportTemplateFormValues,
  ExportTemplateFormat,
  ExportTemplateRecord,
  ExportTemplateSource,
  ExportTemplateStatus,
} from "@/types/export-template.types";

export const EXPORT_TEMPLATE_SOURCE_OPTIONS: Array<{
  value: ExportTemplateSource;
  label: string;
}> = [
  { value: "contacts", label: "Contacts" },
  { value: "lists", label: "Listes" },
  { value: "campaigns", label: "Campagnes" },
];

export const EXPORT_TEMPLATE_FORMAT_OPTIONS: Array<{
  value: ExportTemplateFormat;
  label: string;
}> = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
];

export const EXPORT_TEMPLATE_STATUS_OPTIONS: Array<{
  value: ExportTemplateStatus;
  label: string;
}> = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
];

export const EXPORT_TEMPLATE_FIELD_PRESETS = [
  "Nom",
  "Prenom",
  "Telephone",
  "Telephone 2",
  "Email",
  "Ville",
  "Campagne",
  "Liste",
  "Statut",
  "Qualification",
  "Date creation",
] as const;

export const MOCK_EXPORT_TEMPLATES: ExportTemplateRecord[] = [
  {
    id: "tpl-001",
    name: "Export contacts residentiels",
    source: "contacts",
    format: "csv",
    fields: ["Nom", "Prenom", "Telephone", "Ville", "Campagne", "Statut"],
    status: "active",
    createdAt: "2026-04-14",
    createdBy: "root admin",
  },
  {
    id: "tpl-002",
    name: "Export relance habitat",
    source: "lists",
    format: "excel",
    fields: ["Nom", "Telephone", "Liste", "Qualification", "Campagne"],
    status: "active",
    createdAt: "2026-04-18",
    createdBy: "Nadia Khemiri",
  },
  {
    id: "tpl-003",
    name: "Export blacklist conformite",
    source: "contacts",
    format: "csv",
    fields: ["Telephone", "Nom", "Statut", "Date creation"],
    status: "inactive",
    createdAt: "2026-04-20",
    createdBy: "Karim Mansouri",
  },
  {
    id: "tpl-004",
    name: "Export reporting campagne",
    source: "campaigns",
    format: "excel",
    fields: ["Campagne", "Statut", "Ville", "Qualification", "Date creation"],
    status: "active",
    createdAt: "2026-04-22",
    createdBy: "Leila Trabelsi",
  },
];

export function getExportTemplateSourceLabel(source: ExportTemplateSource) {
  return EXPORT_TEMPLATE_SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source;
}

export function getExportTemplateStatusLabel(status: ExportTemplateStatus) {
  return EXPORT_TEMPLATE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function buildExportTemplatePayload(values: ExportTemplateFormValues): ExportTemplateRecord {
  return {
    id: `tpl-${Date.now()}`,
    name: values.name.trim(),
    source: values.source,
    format: values.format,
    fields: values.fields
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: values.status,
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: "root admin",
  };
}
