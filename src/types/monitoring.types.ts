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
  // Statut réel de l'appel en cours (current_call.status backend — INITIATED |
  // RINGING | ANSWERED | ...), distinct de agent.status (AgentStatus CRM).
  // Nécessaire car un appel manuel lancé depuis PAUSED reste ANSWERED côté
  // téléphonie alors que AgentStatus reste volontairement PAUSED — les actions
  // supervision (écoute/chuchotement/intrusion) doivent se baser sur ce champ,
  // pas sur agent.status.
  activeCallStatus: string | null;
  code: string;
  fullName: string;
  team: string;
  group: string;
  campaign: string;
  status: LiveAgentStatus;
  pauseType?: string | null;
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
