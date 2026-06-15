"use client";

import { useEffect, useMemo, useState } from "react";
import { useMonitoringSnapshot } from "@/features/monitoring/hooks/use-monitoring";
import type { LiveActivityEntry, LiveAgent, LiveAgentStatus } from "@/types/monitoring.types";

function mapBackendStatus(status: string): LiveAgentStatus {
  switch (status) {
    case "AVAILABLE":
      return "waiting";
    case "IN_CALL":
      return "in_call";
    case "RINGING":
      return "ringing";
    case "WRAP_UP":
      return "qualification";
    case "PAUSED":
      return "paused";
    case "OFFLINE":
      return "offline";
    default:
      return "waiting";
  }
}

function buildAgentCode(agentId: number) {
  return `Agent ${String(agentId).padStart(3, "0")}`;
}

function buildLastAction(agent: {
  status: string;
  current_campaign: { name: string } | null;
  current_list: { name: string } | null;
  current_call: { phone_number: string; duration_live: number } | null;
}) {
  const campaignName = agent.current_campaign?.name ?? "campagne non assignee";
  const listName = agent.current_list?.name ?? "aucune liste active";

  switch (agent.status) {
    case "IN_CALL":
      return agent.current_call
        ? `Communication en cours avec ${agent.current_call.phone_number}.`
        : `Communication active sur ${campaignName}.`;
    case "RINGING":
      return `Poste en sonnerie sur ${campaignName}.`;
    case "WRAP_UP":
      return `Qualification post-appel sur ${campaignName}.`;
    case "PAUSED":
      return "Pause plateau declaree.";
    case "OFFLINE":
      return "Agent hors ligne.";
    default:
      return `Disponible sur ${listName}.`;
  }
}

export function useLiveMonitoring() {
  const { snapshot, agents: backendAgents, liveCalls, campaigns, alerts, isLoading, error } =
    useMonitoringSnapshot();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const normalizedAgents = useMemo<LiveAgent[]>(
    () =>
      backendAgents.map((agent) => {
        const baseDuration =
          agent.status_duration ??
          agent.current_call?.duration_live ??
          0;
        const statusStartedAt = now - baseDuration * 1000;
        const liveStatus = mapBackendStatus(agent.status);
        const currentListName = agent.current_list?.name ?? "Aucune liste active";
        const currentCampaignName = agent.current_campaign?.name ?? "Sans campagne";

        return {
          id: String(agent.agent_id),
          code: buildAgentCode(agent.agent_id),
          fullName: agent.agent_name || buildAgentCode(agent.agent_id),
          team: agent.role || "Agent",
          group: currentCampaignName,
          campaign: currentCampaignName,
          status: liveStatus,
          statusStartedAt,
          lastAction: buildLastAction(agent),
          elapsedSeconds: Math.max(0, Math.floor((now - statusStartedAt) / 1000)),
          callsCount: agent.calls_today,
          salesCount: agent.sales_today,
          listLabel: currentListName,
        };
      }),
    [backendAgents, now],
  );

  const activity = useMemo<LiveActivityEntry[]>(
    () =>
      alerts.slice(0, 10).map((alert, index) => ({
        id: `${alert.alert_type}-${alert.created_at}-${index}`,
        agentCode: alert.agent ? buildAgentCode(alert.agent.agent_id) : "SYSTEME",
        agentName: alert.agent?.agent_name ?? "Supervision",
        message: alert.message,
        status: alert.agent ? "paused" : "qualification",
        timestamp: new Date(alert.created_at).getTime(),
      })),
    [alerts],
  );

  const counts = useMemo(() => {
    const connected = snapshot?.online_agents ?? normalizedAgents.filter((agent) => agent.status !== "offline").length;
    const inCall = snapshot?.in_call_agents ?? normalizedAgents.filter((agent) => agent.status === "in_call").length;
    const paused = snapshot?.paused_agents ?? normalizedAgents.filter((agent) => agent.status === "paused").length;
    const waiting = snapshot?.ringing_agents ?? normalizedAgents.filter((agent) => agent.status === "ringing").length;

    return {
      connected,
      inCall,
      paused,
      waiting,
    };
  }, [normalizedAgents, snapshot]);

  const trafficMetrics = useMemo(
    () => [
      {
        label: "Places / en composition",
        value: snapshot?.active_calls ?? liveCalls.length,
        color: "bg-[#2d6fcb]",
        width:
          snapshot && snapshot.calls_today > 0
            ? `${Math.max(12, Math.min(100, Math.round((snapshot.active_calls / snapshot.calls_today) * 100)))}%`
            : "12%",
      },
      {
        label: "Contacts disponibles",
        value: snapshot?.contacts_available ?? 0,
        color: "bg-[#f09c43]",
        width: campaigns.length > 0 ? "92%" : "24%",
      },
      {
        label: "Appels aujourd'hui",
        value: snapshot?.calls_today ?? 0,
        color: "bg-[#6954cc]",
        width: snapshot?.calls_today ? "86%" : "20%",
      },
      {
        label: "Abandons",
        value: snapshot?.abandoned_today ?? 0,
        color: "bg-[#d95a78]",
        width: snapshot ? `${Math.max(10, snapshot.abandon_rate)}%` : "10%",
      },
      {
        label: "Vitesse",
        value: `${snapshot?.dialer_speed ?? 0} %`,
        color: "bg-[#1ea672]",
        width: `${snapshot?.dialer_speed ?? 0}%`,
      },
    ],
    [campaigns.length, liveCalls.length, snapshot],
  );

  return {
    agents: normalizedAgents,
    activity,
    counts,
    snapshot,
    liveCalls,
    campaigns,
    alerts,
    trafficMetrics,
    isLoading,
    error,
  };
}

export function formatElapsedTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatActivityTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getStatusStyles(status: LiveAgentStatus) {
  switch (status) {
    case "paused":
      return {
        badge: "bg-[#f3efff] text-[#5b48b0]",
        card: "from-[#faf7ff] to-[#f4efff]",
        dot: "bg-[#8d7cff]",
      };
    case "waiting":
      return {
        badge: "bg-[#fff7dc] text-[#9a7412]",
        card: "from-[#fffdf6] to-[#fff7e8]",
        dot: "bg-[#f0b57d]",
      };
    case "ringing":
      return {
        badge: "bg-[#ebfbff] text-[#237b96]",
        card: "from-[#f8feff] to-[#eefbff]",
        dot: "bg-[#64d6f2]",
      };
    case "in_call":
      return {
        badge: "bg-[#ebfff9] text-[#0f8b6d]",
        card: "from-[#f8fffc] to-[#eefaf5]",
        dot: "bg-[#14a57e]",
      };
    case "hung_up":
      return {
        badge: "bg-[#fff1f4] text-[#ba5972]",
        card: "from-[#fffafb] to-[#fff1f5]",
        dot: "bg-[#e07a8f]",
      };
    case "qualification":
      return {
        badge: "bg-[#fff4e8] text-[#b56a2a]",
        card: "from-[#fffdf9] to-[#fff4e8]",
        dot: "bg-[#f0b57d]",
      };
    case "offline":
      return {
        badge: "bg-[#eef2f6] text-[#617386]",
        card: "from-[#f8fafc] to-[#eef2f6]",
        dot: "bg-[#94a3b8]",
      };
  }
}

export function getStatusLabel(status: LiveAgentStatus) {
  switch (status) {
    case "paused":
      return "En pause";
    case "waiting":
      return "En attente";
    case "ringing":
      return "En sonnerie";
    case "in_call":
      return "En appel";
    case "hung_up":
      return "Raccroche";
    case "qualification":
      return "Qualification";
    case "offline":
      return "Hors ligne";
  }
}
