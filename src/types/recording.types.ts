export type RecordingStatus = "available" | "processing" | "failed" | "expired";

export interface RecordingRecord {
  id: string;
  date: string;
  time: string;
  agentName: string;
  clientName: string;
  phone: string;
  campaign: string;
  status: RecordingStatus;
  durationSeconds: number;
  note: string;
  streamUrl?: string | null;
  downloadUrl?: string | null;
  filename?: string;
}
