export type SalesAppointmentStatus =
  | "SCHEDULED"
  | "DONE"
  | "CANCELLED"
  | "MISSED";

export interface SalesAppointmentRecord {
  id: string;
  scheduledAt: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  agentId: string;
  agentName: string;
  campaignId: string | null;
  campaign: string;
  team: string;
  status: SalesAppointmentStatus;
  note: string;
  contactLabel: string;
  leadLabel: string;
}
