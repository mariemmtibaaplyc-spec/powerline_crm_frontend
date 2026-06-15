export type ExportSourceType = "campaign" | "list" | "directory";
export type ExportFormat = "csv" | "excel";
export type ExportStatus = "completed" | "processing" | "scheduled" | "failed";

export interface ExportRecord {
  id: string;
  name: string;
  sourceType: ExportSourceType;
  sourceName: string;
  modelName: string;
  date: string;
  status: ExportStatus;
  volume: number;
  format: ExportFormat;
  generatedFile: string;
  linkedCampaign?: string | null;
  linkedList?: string | null;
  linkedImport?: string | null;
  summary: string;
}

export interface ExportFormValues {
  name: string;
  sourceType: ExportSourceType;
  sourceName: string;
  modelName: string;
  format: ExportFormat;
  volume: string;
}
