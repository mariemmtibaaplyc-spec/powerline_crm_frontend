import type { LiveActivityEntry, LiveAgent, LiveAgentStatus } from "@/types/monitoring.types";

const now = Date.now();

export const LIVE_MONITORING_AGENTS: LiveAgent[] = [
  {
    id: "live-agent-001",
    code: "Agent 001",
    fullName: "Meriem Abbassi",
    team: "Outbound Energie",
    group: "NAT ISA",
    campaign: "NAT ISA Residentiel",
    status: "waiting",
    statusStartedAt: now - 1000 * 58,
    lastAction: "Disponible sur la file residentielle.",
  },
  {
    id: "live-agent-002",
    code: "Agent 002",
    fullName: "Sami Ben Amor",
    team: "Qualification Residentiel",
    group: "Solar Elite",
    campaign: "Solar Elite Avril",
    status: "in_call",
    statusStartedAt: now - 1000 * 92,
    lastAction: "Communication active avec un lead solaire.",
  },
  {
    id: "live-agent-003",
    code: "Agent 003",
    fullName: "Nour Gharbi",
    team: "Retention Habitat",
    group: "Eco Habitat",
    campaign: "Relance devis habitat",
    status: "paused",
    statusStartedAt: now - 1000 * 240,
    lastAction: "Pause courte en cours.",
  },
  {
    id: "live-agent-004",
    code: "Agent 004",
    fullName: "Walid Dridi",
    team: "Outbound Energie",
    group: "EMY ecologie",
    campaign: "NAT ISA Residentiel",
    status: "ringing",
    statusStartedAt: now - 1000 * 12,
    lastAction: "Le poste sonne sur un prospect prioritaire.",
  },
  {
    id: "live-agent-005",
    code: "Agent 005",
    fullName: "Leila Khadraoui",
    team: "Qualification Residentiel",
    group: "Solar Elite",
    campaign: "Solar Elite Avril",
    status: "qualification",
    statusStartedAt: now - 1000 * 43,
    lastAction: "Qualification du besoin energetique.",
  },
  {
    id: "live-agent-006",
    code: "Agent 006",
    fullName: "Imed Triki",
    team: "Retention Habitat",
    group: "Eco Habitat",
    campaign: "Relance devis habitat",
    status: "waiting",
    statusStartedAt: now - 1000 * 81,
    lastAction: "File callback stabilisee.",
  },
  {
    id: "live-agent-007",
    code: "Agent 007",
    fullName: "Rim Mnasri",
    team: "Outbound Energie",
    group: "NAT ISA",
    campaign: "NAT ISA Residentiel",
    status: "hung_up",
    statusStartedAt: now - 1000 * 18,
    lastAction: "Appel termine, attente de traitement.",
  },
  {
    id: "live-agent-008",
    code: "Agent 008",
    fullName: "Karim Bouzid",
    team: "Qualification Residentiel",
    group: "Solar Elite",
    campaign: "Solar Elite Avril",
    status: "waiting",
    statusStartedAt: now - 1000 * 67,
    lastAction: "Pret pour une nouvelle tentative.",
  },
  {
    id: "live-agent-009",
    code: "Agent 009",
    fullName: "Sarra Jlassi",
    team: "Retention Habitat",
    group: "Support CRM",
    campaign: "Relance devis habitat",
    status: "paused",
    statusStartedAt: now - 1000 * 311,
    lastAction: "Pause technique declaree.",
  },
  {
    id: "live-agent-010",
    code: "Agent 010",
    fullName: "Tarek Ghedira",
    team: "Outbound Energie",
    group: "EMY ecologie",
    campaign: "NAT ISA Residentiel",
    status: "in_call",
    statusStartedAt: now - 1000 * 124,
    lastAction: "Traitement actif d'un prospect chaud.",
  },
  {
    id: "live-agent-011",
    code: "Agent 011",
    fullName: "Yasmine Trabelsi",
    team: "Qualification Residentiel",
    group: "Solar Elite",
    campaign: "Solar Elite Avril",
    status: "ringing",
    statusStartedAt: now - 1000 * 7,
    lastAction: "Ligne sortante en cours de sonnerie.",
  },
  {
    id: "live-agent-012",
    code: "Agent 012",
    fullName: "Hedi Karray",
    team: "Retention Habitat",
    group: "Eco Habitat",
    campaign: "Relance devis habitat",
    status: "qualification",
    statusStartedAt: now - 1000 * 66,
    lastAction: "Synthese post-appel en cours.",
  },
  {
    id: "live-agent-013",
    code: "Agent 013",
    fullName: "Mariem Ben Salem",
    team: "Outbound Energie",
    group: "NAT ISA",
    campaign: "NAT ISA Residentiel",
    status: "waiting",
    statusStartedAt: now - 1000 * 36,
    lastAction: "Attente de nouvelle distribution.",
  },
  {
    id: "live-agent-014",
    code: "Agent 014",
    fullName: "Anis Ben Hmida",
    team: "Qualification Residentiel",
    group: "Solar Elite",
    campaign: "Solar Elite Avril",
    status: "in_call",
    statusStartedAt: now - 1000 * 141,
    lastAction: "Echange en cours sur une qualification premium.",
  },
  {
    id: "live-agent-015",
    code: "Agent 015",
    fullName: "Mouna Ayari",
    team: "Retention Habitat",
    group: "Support CRM",
    campaign: "Relance devis habitat",
    status: "waiting",
    statusStartedAt: now - 1000 * 154,
    lastAction: "Supervision file callback en attente.",
  },
];

export const LIVE_INITIAL_ACTIVITY: LiveActivityEntry[] = [
  {
    id: "live-activity-001",
    agentCode: "Agent 002",
    agentName: "Sami Ben Amor",
    message: "est passe en appel sur Solar Elite Avril.",
    status: "in_call",
    timestamp: now - 1000 * 50,
  },
  {
    id: "live-activity-002",
    agentCode: "Agent 005",
    agentName: "Leila Khadraoui",
    message: "est en qualification sur un lead solaire.",
    status: "qualification",
    timestamp: now - 1000 * 34,
  },
  {
    id: "live-activity-003",
    agentCode: "Agent 009",
    agentName: "Sarra Jlassi",
    message: "est passee en pause technique.",
    status: "paused",
    timestamp: now - 1000 * 21,
  },
  {
    id: "live-activity-004",
    agentCode: "Agent 011",
    agentName: "Yasmine Trabelsi",
    message: "a une ligne en sonnerie sur le plateau.",
    status: "ringing",
    timestamp: now - 1000 * 9,
  },
];

export function getNextMonitoringStatus(status: LiveAgentStatus): LiveAgentStatus {
  switch (status) {
    case "paused":
      return "waiting";
    case "waiting":
      return Math.random() < 0.72 ? "ringing" : "paused";
    case "ringing":
      return Math.random() < 0.78 ? "in_call" : "hung_up";
    case "in_call":
      return "hung_up";
    case "hung_up":
      return "qualification";
    case "qualification":
      return Math.random() < 0.82 ? "waiting" : "paused";
    case "offline":
      return "waiting";
  }
}

export function getStatusActionMessage(status: LiveAgentStatus, campaign: string) {
  switch (status) {
    case "paused":
      return "est passe en pause plateau.";
    case "waiting":
      return "est revenu en attente de file.";
    case "ringing":
      return `a une ligne en sonnerie sur ${campaign}.`;
    case "in_call":
      return `est passe en appel sur ${campaign}.`;
    case "hung_up":
      return "a termine un appel et vient de raccrocher.";
    case "qualification":
      return "est en qualification post-appel.";
  }
}
