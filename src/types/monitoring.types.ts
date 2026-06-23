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
  agentNumericId: number;       // agent_id numerique pour les actions supervision
  callId: number | null;        // call_id en cours (null si pas en appel)
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
