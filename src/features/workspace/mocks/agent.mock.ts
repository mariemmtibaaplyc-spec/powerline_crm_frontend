import type {
  AgentIdentity,
  AgentStatus,
  AgentStatusMeta,
  PauseType,
} from "@/types/workspace.types";

export const MOCK_AGENT_IDENTITY: AgentIdentity = {
  id: "agent-014",
  fullName: "Mariem Abbassi",
  campaign: "NAT ISA",
  group: "Groupe EMY ecologie",
  role: "Production appels",
  notificationsCount: 1,
};

export const PAUSE_OPTIONS: readonly PauseType[] = [
  { code: "coffee", label: "Pause cafe", durationLabel: "10 min", durationMinutes: 10 },
  { code: "lunch", label: "Pause dejeuner", durationLabel: "1 h 00", durationMinutes: 60 },
  { code: "meeting", label: "Reunion", durationLabel: "30 min", durationMinutes: 30 },
  { code: "micro", label: "Micro pause", durationLabel: "05 min", durationMinutes: 5 },
  {
    code: "technical",
    label: "Probleme technique",
    durationLabel: "15 min",
    durationMinutes: 15,
  },
] as const;

export const AGENT_STATUS_OPTIONS: readonly AgentStatusMeta[] = [
  {
    value: "connected",
    label: "Connecte",
    description:
      "Agent connecte et disponible. L'interface reste prete pour relancer un appel.",
    shellTone:
      "border-[#d9e8fb] bg-[linear-gradient(135deg,#fdfefe_0%,#eef5ff_100%)]",
    badgeLight: "border-[#d9e8fb] bg-[#eef5ff] text-[#2b4e8e]",
    badgeDark: "border-[#2b4e8e]/28 bg-[#1b3355] text-[#d7ecff]",
    menuTone: "border-[#d9e8fb] bg-[#eef5ff] text-[#2b4e8e]",
    panelTone:
      "border-[#2b4e8e]/20 bg-[linear-gradient(180deg,#102039_0%,#0d1b2a_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(75,142,240,0.18),transparent)]",
    dotClass: "bg-[#4b8ef0]",
    actionRing: "ring-[#4b8ef0]/40",
    emphasisAction: "Appel manuel",
  },
  {
    value: "paused",
    label: "En pause",
    description:
      "Agent suspendu. La reprise de file doit rester l'action dominante.",
    shellTone:
      "border-[#e0dafb] bg-[linear-gradient(135deg,#fdfcff_0%,#f2efff_100%)]",
    badgeLight: "border-[#d9d3ff] bg-[#f3efff] text-[#5b48b0]",
    badgeDark: "border-[#6e5ccf]/26 bg-[#241e4d] text-[#ddd3ff]",
    menuTone: "border-[#d9d3ff] bg-[#f3efff] text-[#5b48b0]",
    panelTone:
      "border-[#6e5ccf]/20 bg-[linear-gradient(180deg,#171737_0%,#101423_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(110,92,207,0.18),transparent)]",
    dotClass: "bg-[#8d7cff]",
    actionRing: "ring-[#8d7cff]/38",
    emphasisAction: "Reprendre",
  },
  {
    value: "waiting",
    label: "En attente",
    description:
      "Agent en file d'attente. La session reste ouverte mais aucun appel n'est encore engage.",
    shellTone:
      "border-[#f3e1ac] bg-[linear-gradient(135deg,#fffdf8_0%,#fff7e5_100%)]",
    badgeLight: "border-[#f3e1ac] bg-[#fff7dc] text-[#9a7412]",
    badgeDark: "border-[#9a7412]/22 bg-[#322914] text-[#f2d38b]",
    menuTone: "border-[#f3e1ac] bg-[#fff7dc] text-[#9a7412]",
    panelTone:
      "border-[#9a7412]/18 bg-[linear-gradient(180deg,#201a15_0%,#13171f_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(240,181,125,0.18),transparent)]",
    dotClass: "bg-[#f0b57d]",
    actionRing: "ring-[#f0b57d]/38",
    emphasisAction: "Pause",
  },
  {
    value: "in_call",
    label: "En appel",
    description:
      "Communication en cours. Le poste agent passe en mode actif et engage.",
    shellTone:
      "border-[#cfeee4] bg-[linear-gradient(135deg,#fcfffd_0%,#edf9f4_100%)]",
    badgeLight: "border-[#cfeee4] bg-[#ebfff9] text-[#0f8b6d]",
    badgeDark: "border-[#14a57e]/22 bg-[#14352e] text-[#bceee0]",
    menuTone: "border-[#cfeee4] bg-[#ebfff9] text-[#0f8b6d]",
    panelTone:
      "border-[#14a57e]/18 bg-[linear-gradient(180deg,#102922_0%,#0d1b2a_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(20,165,126,0.18),transparent)]",
    dotClass: "bg-[#14a57e]",
    actionRing: "ring-[#14a57e]/38",
    emphasisAction: "Raccrocher",
  },
  {
    value: "ringing",
    label: "En sonnerie",
    description:
      "Ligne en cours de sonnerie. La barre haute doit rester tres lisible et reactive.",
    shellTone:
      "border-[#cfefff] bg-[linear-gradient(135deg,#fbfeff_0%,#ebfbff_100%)]",
    badgeLight: "border-[#cfefff] bg-[#ebfbff] text-[#237b96]",
    badgeDark: "border-[#3dbbdc]/22 bg-[#14303a] text-[#bfefff]",
    menuTone: "border-[#cfefff] bg-[#ebfbff] text-[#237b96]",
    panelTone:
      "border-[#3dbbdc]/18 bg-[linear-gradient(180deg,#102530_0%,#0d1b2a_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(61,187,220,0.18),transparent)]",
    dotClass: "bg-[#64d6f2]",
    actionRing: "ring-[#64d6f2]/38",
    emphasisAction: "Raccrocher",
  },
  {
    value: "hung_up",
    label: "Raccroche",
    description:
      "Communication terminee. L'interface doit lire un etat de cloture et de relance.",
    shellTone:
      "border-[#f3d3da] bg-[linear-gradient(135deg,#fffafb_0%,#fff0f3_100%)]",
    badgeLight: "border-[#f3d3da] bg-[#fff1f4] text-[#ba5972]",
    badgeDark: "border-[#cc647d]/22 bg-[#311a24] text-[#ffd7e1]",
    menuTone: "border-[#f3d3da] bg-[#fff1f4] text-[#ba5972]",
    panelTone:
      "border-[#cc647d]/18 bg-[linear-gradient(180deg,#22161f_0%,#0d1b2a_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(204,100,125,0.18),transparent)]",
    dotClass: "bg-[#e07a8f]",
    actionRing: "ring-[#e07a8f]/38",
    emphasisAction: "Raccrocher",
  },
  {
    value: "qualification",
    label: "Qualification",
    description:
      "Phase de qualification active. Le poste reste concentre sur la fiche et le traitement.",
    shellTone:
      "border-[#f3dcc5] bg-[linear-gradient(135deg,#fffdf9_0%,#fff4e8_100%)]",
    badgeLight: "border-[#f3dcc5] bg-[#fff4e8] text-[#b56a2a]",
    badgeDark: "border-[#d99154]/22 bg-[#34231a] text-[#ffd8b5]",
    menuTone: "border-[#f3dcc5] bg-[#fff4e8] text-[#b56a2a]",
    panelTone:
      "border-[#d99154]/18 bg-[linear-gradient(180deg,#221916_0%,#0d1b2a_100%)]",
    accentOverlay:
      "bg-[linear-gradient(180deg,rgba(217,145,84,0.18),transparent)]",
    dotClass: "bg-[#f0b57d]",
    actionRing: "ring-[#f0b57d]/38",
    emphasisAction: "Reprendre",
  },
] as const;

export function getAgentStatusMeta(status: AgentStatus) {
  return (
    AGENT_STATUS_OPTIONS.find((option) => option.value === status) ??
    AGENT_STATUS_OPTIONS[1]
  );
}
