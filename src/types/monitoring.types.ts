export type LiveAgentStatus =
  | "paused"
  | "waiting"
  | "in_call"
  | "ringing"
  | "hung_up"
  | "qualification"
  | "offline";

export interface LiveAgent {
  id: string;
  code: string;
  fullName: string;
  team: string;
  group: string;
  campaign: string;
  status: LiveAgentStatus;
  statusStartedAt: number;
  lastAction: string;
  elapsedSeconds?: number;
  callsCount?: number;
  salesCount?: number;
  listLabel?: string;
}

export interface LiveActivityEntry {
  id: string;
  agentCode: string;
  agentName: string;
  message: string;
  status: LiveAgentStatus;
  timestamp: number;
}
