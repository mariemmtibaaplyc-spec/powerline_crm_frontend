export type ExportTemplateSource = "contacts" | "lists" | "campaigns";
export type ExportTemplateFormat = "csv" | "excel";
export type ExportTemplateStatus = "active" | "inactive";

export interface ExportTemplateRecord {
  id: string;
  name: string;
  source: ExportTemplateSource;
  format: ExportTemplateFormat;
  fields: string[];
  status: ExportTemplateStatus;
  createdAt: string;
  createdBy: string;
}

export interface ExportTemplateFormValues {
  name: string;
  source: ExportTemplateSource;
  format: ExportTemplateFormat;
  fields: string;
  status: ExportTemplateStatus;
}
