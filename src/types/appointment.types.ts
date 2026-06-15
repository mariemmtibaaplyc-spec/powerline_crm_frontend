export type SalesAppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "pending";

export interface SalesAppointmentRecord {
  id: string;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  agentName: string;
  campaign: string;
  team: string;
  status: SalesAppointmentStatus;
  note: string;
  sourceList: string;
  sourceLabel: string;
}
