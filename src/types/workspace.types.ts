import type { Id } from "@/types/common.types";

export type AgentStatus =
  | "connected"
  | "paused"
  | "waiting"
  | "in_call"
  | "ringing"
  | "hung_up"
  | "qualification";

export interface AgentStatusMeta {
  value: AgentStatus;
  label: string;
  description: string;
  shellTone: string;
  badgeLight: string;
  badgeDark: string;
  menuTone: string;
  panelTone: string;
  accentOverlay: string;
  dotClass: string;
  actionRing: string;
  emphasisAction:
    | "Reprendre"
    | "Pause"
    | "Appel manuel"
    | "Transferer a"
    | "Raccrocher";
}

export interface AgentIdentity {
  id: Id;
  fullName: string;
  campaign: string;
  group: string;
  role: string;
  notificationsCount: number;
}

export interface PauseType {
  code: "coffee" | "lunch" | "meeting" | "micro" | "technical";
  label: string;
  durationLabel: string;
  durationMinutes: number;
}

export type QualificationCode =
  | "call_transferred"
  | "wrong_number"
  | "do_not_call"
  | "disconnected_number"
  | "busy"
  | "no_budget"
  | "no_answer"
  | "not_interested"
  | "callback"
  | "appointment"
  | "voicemail"
  | "sale_refused";

export interface QualificationOption {
  code: QualificationCode;
  label: string;
  group: "default" | "custom";
}

export interface ProspectSheet {
  id: Id;
  firstName: string;
  lastName: string;
  phone: string;
  phoneSecondary: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  comments: string;
}

export type ReminderStatus = "planned" | "priority" | "confirmed" | "reported";

export interface Reminder {
  id: Id;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  campaign: string;
  queue: string;
  note: string;
  status: ReminderStatus;
  prospect: ProspectSheet;
}

export type HistoryStatus =
  | "completed"
  | "follow_up"
  | "appointment"
  | "unreachable"
  | "refused"
  | "voicemail";

export interface QualificationRecord {
  code: QualificationCode;
  label: string;
  recordedAt: number;
  nextStatus: "paused" | "waiting";
}

export interface ReminderFormValues {
  date: string;
  time: string;
  note: string;
}

export interface AppointmentFormValues {
  date: string;
  time: string;
  note: string;
}

export interface AppointmentEntry {
  id: Id;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  campaign: string;
  queue: string;
  note: string;
  prospect: ProspectSheet;
}

export interface HistoryEntry {
  id: Id;
  date: string;
  time: string;
  clientName: string;
  phone: string;
  campaign: string;
  queue: string;
  result: string;
  summary: string;
  status: HistoryStatus;
  prospect: ProspectSheet;
  qualificationCode?: QualificationCode;
  qualificationLabel?: string;
}

export interface CallSession {
  active: boolean;
  direction: "manual" | "reminder" | null;
  currentNumber: string | null;
  activeReminderId: Id | null;
  startedAt: number | null;
  hungUpBy: "agent" | "client" | null;
  campaign: string | null;
  queue: string | null;
}

export interface ActivePause {
  type: PauseType;
  startedAt: number;
}
