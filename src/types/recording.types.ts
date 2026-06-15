export type RecordingStatus = "archived" | "review" | "available" | "flagged";

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
}
