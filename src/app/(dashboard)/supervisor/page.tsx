"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  PhoneCall,
  RefreshCw,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "@/components/reporting/stats-card";
import { ReportingFilters } from "@/components/reporting/reporting-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { monitoringApi, type SupervisionAgentStatusRow, type SupervisionAlert, type SupervisionCampaignLiveStat, type SupervisionLiveSnapshot } from "@/features/monitoring/api/monitoring.api";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingAppointmentsPerAgentData,
  ReportingCallsPerAgentData,
  ReportingQualificationStatusItem,
  ReportingProductionEvolutionPoint,
  ReportingValue,
} from "@/types/reporting.types";

const AUTO_REFRESH_MS = 30_000;

type TopAgentItem = {
  agentId: number;
  name: string;
  calls: number;
  appointments: number;
  doneAppointments: number;
};

type SupervisorDashboardData = {
  live: SupervisionLiveSnapshot;
  agents: SupervisionAgentStatusRow[];
  campaigns: SupervisionCampaignLiveStat[];
  alerts: SupervisionAlert[];
  production: ReportingProductionEvolutionPoint[];
  qualifications: ReportingQualificationStatusItem[];
  topAgents: TopAgentItem[];
};

function getTodayRange() {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function readArray(source: Record<string, ReportingValue | undefined>): Record<string, unknown>[] {
  const keys = ["rows", "items", "data", "results", "list", "agents"];
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      const rows: Record<string, unknown>[] = [];
      for (const item of value) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          rows.push(item as Record<string, unknown>);
        }
      }
      return rows;
    }
  }
  return [];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) {
      return fallback;
    }
    const parsed = Number(normalized.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function safeDivide(numerator: unknown, denominator: unknown, fallback = 0): number {
  const safeNumerator = toNumber(numerator, 0);
  const safeDenominator = toNumber(denominator, 0);

  if (safeDenominator <= 0) {
    return fallback;
  }

  const result = safeNumerator / safeDenominator;
  return Number.isFinite(result) ? result : fallback;
}

function safePercent(numerator: unknown, denominator: unknown, fallback = 0): number {
  return Math.round(safeDivide(numerator, denominator, fallback) * 100);
}

function toStringValue(value: unknown, fallback = "—"): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

function formatNumber(value: unknown) {
  return new Intl.NumberFormat("fr-FR").format(toNumber(value, 0));
}

function formatPercent(value: unknown) {
  return `${Math.round(toNumber(value, 0))}%`;
}

function formatDuration(seconds: unknown) {
  const safeSeconds = toNumber(seconds, 0);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return "0 s";
  }

  if (safeSeconds < 60) {
    return `${Math.round(safeSeconds)} s`;
  }

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")}`;
  }

  return `${minutes} min`;
}

function formatStatusLabel(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "IN_CALL":
      return "En appel";
    case "RINGING":
      return "Attente";
    case "WRAP_UP":
      return "Qualification";
    case "PAUSED":
      return "Pause";
    case "OFFLINE":
      return "Hors ligne";
    default:
      return status;
  }
}

function formatAlertSeverity(severity: SupervisionAlert["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return "Critique";
    case "HIGH":
      return "Haute";
    case "MEDIUM":
      return "Moyenne";
    default:
      return "Basse";
  }
}

function formatAlertTone(severity: SupervisionAlert["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return {
        container: "border-[#efc1bb] bg-[#fff4f1]",
        dot: "bg-[#c84d36]",
        badge: "bg-[#ffe0da] text-[#9f3d2b]",
      };
    case "HIGH":
      return {
        container: "border-[#f3d7bf] bg-[#fff8f1]",
        dot: "bg-[#d37a3a]",
        badge: "bg-[#fff0df] text-[#8a5425]",
      };
    case "MEDIUM":
      return {
        container: "border-[#d9e8fb] bg-[#f6faff]",
        dot: "bg-[#2d6fcb]",
        badge: "bg-[#edf4ff] text-[#295086]",
      };
    default:
      return {
        container: "border-[#d7e9e3] bg-[#f4fbf8]",
        dot: "bg-[#0f8b6d]",
        badge: "bg-[#e9f8f2] text-[#0f6a66]",
      };
  }
}

function formatHourLabel(value: string) {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
    }).format(date).replace(":", "h");
  }

  if (value.includes("T")) {
    return value.slice(11, 13) + "h";
  }

  return value;
}

function formatSyncLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Sync inconnue";
  }

  return `Sync ${new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

function pickNumberValue(
  source: Record<string, unknown> | null | undefined,
  aliases: string[],
  fallback = 0,
) {
  if (!source) {
    return fallback;
  }

  for (const alias of aliases) {
    if (alias in source) {
      return toNumber(source[alias], fallback);
    }
  }

  return fallback;
}

function getHourKey(value: string) {
  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return String(date.getHours()).padStart(2, "0");
  }

  if (value.includes("T")) {
    return value.slice(11, 13);
  }

  return value.slice(0, 2).padStart(2, "0");
}

function buildStableHourlyRows(points: ReportingProductionEvolutionPoint[]) {
  const byHour = new Map<string, { calls: number; appointments: number }>();

  for (const point of points) {
    const hourKey = getHourKey(point.date);
    const current = byHour.get(hourKey) ?? { calls: 0, appointments: 0 };

    byHour.set(hourKey, {
      calls: current.calls + toNumber(point.total_calls, 0),
      appointments: current.appointments + toNumber(point.total_appointments, 0),
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const hour = index + 9;
    const hourKey = String(hour).padStart(2, "0");
    const hourData = byHour.get(hourKey);

    return {
      slot: hourKey,
      label: `${hourKey}h`,
      calls: hourData?.calls ?? 0,
      appointments: hourData?.appointments ?? 0,
    };
  });
}

function buildTopAgents(
  callsPerAgent: ReportingCallsPerAgentData,
  appointmentsPerAgent: ReportingAppointmentsPerAgentData,
): TopAgentItem[] {
  const callRows = readArray(callsPerAgent);
  const appointmentRows = readArray(appointmentsPerAgent);
  const appointmentMap = new Map<number, { total: number; done: number }>();

  for (const row of appointmentRows) {
    const agentId = toNumber(row.agent_id);
    if (!agentId) {
      continue;
    }

    const byStatus = row.by_status;
    const doneAppointments =
      byStatus && typeof byStatus === "object" && !Array.isArray(byStatus)
        ? toNumber((byStatus as Record<string, unknown>).DONE)
        : 0;

    appointmentMap.set(agentId, {
      total: toNumber(row.total),
      done: doneAppointments,
    });
  }

  return callRows
    .map((row) => {
      const agentId = toNumber(row.agent_id);
      const appointments = appointmentMap.get(agentId);

      return {
        agentId,
        name: toStringValue(row.agent_name, `Agent #${agentId || "?"}`),
        calls: toNumber(row.total_calls),
        appointments: appointments?.total ?? 0,
        doneAppointments: appointments?.done ?? 0,
      };
    })
    .filter((row) => row.agentId > 0)
    .sort((left, right) => {
      if (right.calls !== left.calls) {
        return right.calls - left.calls;
      }
      if (right.appointments !== left.appointments) {
        return right.appointments - left.appointments;
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, 4);
}

async function fetchSupervisorDashboardData(): Promise<SupervisorDashboardData> {
  const { from, to } = getTodayRange();
  const [
    live,
    agents,
    campaigns,
    alerts,
    production,
    qualifications,
    callsPerAgent,
    appointmentsPerAgent,
  ] = await Promise.all([
    monitoringApi.getSupervisionLive(),
    monitoringApi.getSupervisionAgentsStatus(),
    monitoringApi.getSupervisionCampaignsLive(),
    monitoringApi.getSupervisionAlerts(),
    reportingApi.getProductionEvolution({ from, to, interval: "hour" }),
    reportingApi.getQualificationsStatus({ from, to }),
    reportingApi.getCallsPerAgent({ from, to }),
    reportingApi.getAppointmentsPerAgent({ from, to }),
  ]);

  return {
    live,
    agents,
    campaigns,
    alerts,
    production,
    qualifications,
    topAgents: buildTopAgents(callsPerAgent, appointmentsPerAgent),
  };
}

export default function Page() {
  const [dashboard, setDashboard] = useState<SupervisorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (silent = false) => {
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const nextDashboard = await fetchSupervisorDashboardData();
      setDashboard(nextDashboard);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger le dashboard superviseur pour le moment.",
      );
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    const run = async (silent = false) => {
      if (!active) {
        return;
      }
      await loadDashboard(silent);
    };

    void run(false);
    const intervalId = window.setInterval(() => {
      void run(true);
    }, AUTO_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const summary = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    const onlineAgents = toNumber(dashboard.live.online_agents, 0);
    const activeCampaigns = dashboard.campaigns.length;
    const livePayload = dashboard.live as unknown as Record<string, unknown>;
    const attemptedCalls = toNumber(
      dashboard.live.attempted_calls_today ?? dashboard.live.calls_today,
      0,
    );
    const answeredCalls = toNumber(dashboard.live.answered_today, 0);
    const abandonedCalls = toNumber(dashboard.live.abandoned_today, 0);
    const maxWaitSeconds = pickNumberValue(
      livePayload,
      ["max_wait_time_seconds", "max_waiting_time_seconds", "waiting_time_seconds", "avg_wait_time"],
      0,
    );
    const sortedAgents = [...dashboard.agents]
      .sort((left, right) => {
        const leftActive = left.status === "IN_CALL" || left.status === "RINGING" || left.status === "WRAP_UP" ? 1 : 0;
        const rightActive = right.status === "IN_CALL" || right.status === "RINGING" || right.status === "WRAP_UP" ? 1 : 0;
        if (rightActive !== leftActive) {
          return rightActive - leftActive;
        }
        return toNumber(right.calls_today, 0) - toNumber(left.calls_today, 0);
      })
      .slice(0, 4)
      .map((agent) => ({
        id: agent.agent_id,
        name: toStringValue(agent.agent_name, `Agent #${agent.agent_id}`),
        campaign: agent.current_campaign?.name ?? "Sans campagne",
        status: formatStatusLabel(agent.status),
        occupancy: formatNumber(agent.calls_today),
        quality: formatDuration(agent.avg_dmc),
      }));

    const statusRows = [
      {
        name: "Disponibles",
        count: toNumber(dashboard.live.available_agents, 0),
        share: safePercent(dashboard.live.available_agents, onlineAgents, 0),
        color: "bg-[#1d5fc0]",
      },
      {
        name: "En appel",
        count: toNumber(dashboard.live.in_call_agents, 0),
        share: safePercent(dashboard.live.in_call_agents, onlineAgents, 0),
        color: "bg-[#0f6a66]",
      },
      {
        name: "En pause",
        count: toNumber(dashboard.live.paused_agents, 0),
        share: safePercent(dashboard.live.paused_agents, onlineAgents, 0),
        color: "bg-[#d37a3a]",
      },
      {
        name: "Qualification",
        count: toNumber(dashboard.live.wrap_up_agents, 0),
        share: safePercent(dashboard.live.wrap_up_agents, onlineAgents, 0),
        color: "bg-[#6f5cc2]",
      },
    ];

    const campaignRows = dashboard.campaigns
      .slice()
      .sort((left, right) => toNumber(right.calls_today, 0) - toNumber(left.calls_today, 0))
      .slice(0, 5)
      .map((campaign) => {
        const campaignSource = campaign as unknown as Record<string, unknown>;
        const communicationSeconds = pickNumberValue(
          campaignSource,
          ["communication_seconds", "talk_time_seconds", "connected_duration_seconds"],
          0,
        );
        const waitingSeconds = pickNumberValue(
          campaignSource,
          ["waiting_seconds", "wait_seconds", "ringing_seconds", "queue_waiting_seconds"],
          0,
        );
        const pauseSeconds = pickNumberValue(
          campaignSource,
          ["pause_seconds", "paused_seconds"],
          0,
        );
        const qualificationSeconds = pickNumberValue(
          campaignSource,
          ["qualification_seconds", "wrap_up_seconds", "wrapup_seconds"],
          0,
        );

        return {
          id: campaign.campaign_id,
          campaign: campaign.campaign_name,
          pace: campaign.dialer_speed_mode || `${formatNumber(campaign.dialer_speed)}%`,
          available: toNumber(campaign.contacts_available, 0),
          waitSeconds: pickNumberValue(
            campaignSource,
            ["waiting_time_seconds", "max_wait_time_seconds", "max_waiting_time_seconds"],
            0,
          ),
          wait: `${formatDuration(
            pickNumberValue(
              campaignSource,
              ["waiting_time_seconds", "max_wait_time_seconds", "max_waiting_time_seconds"],
              0,
            ),
          )}`,
          team: `${formatNumber(campaign.agents_in_call)} agents`,
          activeCalls: toNumber(campaign.active_calls, 0),
          agentsInCall: toNumber(campaign.agents_in_call, 0),
          communicationSeconds,
          waitingSeconds,
          communicationWaitingSeconds: communicationSeconds + waitingSeconds,
          pauseSeconds,
          qualificationSeconds,
        };
      });

    const hourlyData = buildStableHourlyRows(dashboard.production);

    return {
      activeCampaigns,
      attemptedCalls,
      answeredCalls,
      abandonedCalls,
      reachabilityRate: safePercent(answeredCalls, attemptedCalls, 0),
      abandonmentRate: safePercent(abandonedCalls, attemptedCalls, 0),
      contactsAvailable: toNumber(dashboard.live.contacts_available, 0),
      maxWaitSeconds,
      sortedAgents,
      statusRows,
      campaignRows,
      hourlyData,
    };
  }, [dashboard]);

  if (isLoading && !dashboard) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Supervisor workspace"
          title="Tableau de bord"
          description="Chargement des donnees live du plateau, des campagnes et des agents."
        />
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="py-12">
            <p className="text-sm text-[#607287]">Chargement du dashboard superviseur...</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!dashboard || !summary) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Supervisor workspace"
          title="Tableau de bord"
          description="Vue temps reel de la production, de la charge des campagnes et de la performance des equipes de supervision."
        />
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="space-y-4 py-10">
            <p className="text-sm font-medium text-[#24415d]">
              {error || "Aucune donnee de supervision disponible pour le moment."}
            </p>
            <Button onClick={() => void loadDashboard(false)}>Recharger</Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const kpis = [
    {
      label: "Joignabilite",
      value: formatPercent(summary.reachabilityRate),
      caption: "Appels repondus sur la base des tentatives du jour",
      delta: `${formatNumber(summary.answeredCalls)} repondus`,
      tone: "blue" as const,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      label: "Taux d'abandon",
      value: formatPercent(summary.abandonmentRate),
      caption: "Appels abandonnes sur la volumetrie disponible du jour",
      delta: `${formatNumber(summary.abandonedCalls)} abandonnes`,
      tone: "navy" as const,
      icon: <PhoneCall className="h-5 w-5" />,
    },
    {
      label: "Fiches disponibles",
      value: formatNumber(summary.contactsAvailable),
      caption: "Contacts disponibles sur les campagnes actives",
      delta: `${formatNumber(summary.activeCampaigns)} campagnes`,
      tone: "teal" as const,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Delai d'attente max",
      value: formatDuration(summary.maxWaitSeconds),
      caption: "Valeur exposee par les flux live quand elle existe",
      delta: `${formatNumber(dashboard.live.waiting_calls)} appels en attente`,
      tone: "amber" as const,
      icon: <Clock3 className="h-5 w-5" />,
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Supervisor workspace"
        title="Tableau de bord"
        description="Vue temps reel de la production, de la charge des campagnes et de la performance des equipes de supervision."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f0b57d]/22 bg-[#fff6ed] px-3 py-2 text-sm font-medium text-[#8a5425] shadow-[0_8px_18px_rgba(227,165,109,0.1)]">
              <span className="h-2 w-2 rounded-full bg-[#e3a56d]" />
              Live {formatNumber(dashboard.live.online_agents)} agents
            </span>
            <span className="rounded-full border border-[#d6e1ec] bg-white px-3 py-2 text-sm font-medium text-[#24415d]">
              {formatNumber(summary.activeCampaigns)} campagnes actives
            </span>
            <Button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={isRefreshing}
              className="rounded-full bg-[#eaf4ff] px-3 py-2 text-sm font-medium text-[#27518f] hover:bg-[#dbeefe]"
              variant="ghost"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {formatSyncLabel(dashboard.live.timestamp)}
            </Button>
          </>
        }
      />

      {error ? (
        <div className="rounded-[1.35rem] border border-dashed border-[#f0d0cb] bg-[#fff7f5] px-4 py-3 text-sm text-[#9f3d2b]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatsCard
            key={`kpi-${kpi.label}`}
            label={kpi.label}
            value={kpi.value}
            caption={kpi.caption}
            delta={kpi.delta}
            tone={kpi.tone}
            icon={kpi.icon}
          />
        ))}
      </div>

      <ReportingFilters
        filters={[
          { label: "Periode", value: "Aujourd hui" },
          { label: "Agents connectes", value: formatNumber(dashboard.live.online_agents) },
          { label: "Disponibles", value: formatNumber(dashboard.live.available_agents) },
          { label: "En pause", value: formatNumber(dashboard.live.paused_agents) },
        ]}
        actions={[
          { label: "Auto refresh 30s" },
          {
            label: isRefreshing ? "Actualisation..." : "Donnees reelles",
            primary: true,
            onClick: () => void loadDashboard(true),
            disabled: isRefreshing,
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1.14fr_0.86fr] 2xl:grid-cols-[1.18fr_0.92fr]">
        <HourlyActivityCard
          title="Activite horaire appels / RDV"
          subtitle="Volumes reels de la journee courante, agrégés heure par heure depuis le reporting."
          rows={summary.hourlyData}
        />
        <CampaignLiveCard
          title="Etat live des campagnes"
          subtitle="Campagnes actives, vitesse courante, contacts disponibles et intensite live."
          rows={summary.campaignRows}
        />
      </div>

      <ProductionCampaignCard rows={summary.campaignRows} />

      <div className="grid auto-rows-fr gap-5 xl:grid-cols-2 2xl:grid-cols-[0.95fr_1.1fr_0.85fr]">
        <AgentStatusCard
          rows={summary.statusRows}
        />

        <AgentsLiveCard rows={summary.sortedAgents} />

        <SupervisorInsightsCard
          topAgents={dashboard.topAgents}
          qualifications={dashboard.qualifications}
        />
      </div>
    </section>
  );
}

function HourlyActivityCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ slot: string; label: string; calls: number; appointments: number }>;
}) {
  const maxCalls = Math.max(0, ...rows.map((row) => toNumber(row.calls, 0)));
  const chartMax = Math.max(100, Math.ceil(maxCalls / 25) * 25 || 100);
  const axisTicks = Array.from({ length: 5 }, (_, index) => {
    const value = chartMax - index * (chartMax / 4);
    return {
      slot: `tick-${index}`,
      value: Math.max(0, Math.round(value)),
    };
  });
  const gridRows = axisTicks.slice(0, -1);

  return (
    <div className="relative flex h-full min-h-[484px] flex-col overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle,rgba(227,165,109,0.18),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">{title}</h3>
          <p className="mt-1 text-sm text-[#65788c]">{subtitle}</p>
        </div>
        <div className="rounded-full bg-[#fff3e7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8a5425]">
          Heure par heure
        </div>
      </div>

      <div className="mt-5 grid h-[340px] grid-cols-[40px_1fr] gap-3">
        <div className="flex h-full flex-col justify-between pb-12 pt-1 text-[11px] font-medium text-[#7a8da3]">
          {axisTicks.map((tick) => (
            <span key={`axis-tick-${tick.slot}-${tick.value}`}>{formatNumber(Math.max(tick.value, 0))}</span>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-[1.6rem] border border-[#e7eef6] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-3 pb-6 pt-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-4">
          <div className="pointer-events-none absolute inset-x-3 top-5 bottom-12 sm:inset-x-4">
            {gridRows.map((tick, index) => (
              <div
                key={`gridline-${tick.slot}-${tick.value}`}
                className={`absolute left-0 right-0 border-t border-dashed border-[#d6e0eb] ${index === 0 ? "opacity-70" : "opacity-100"}`}
                style={{ top: `${(index / 4) * 100}%` }}
              />
            ))}
          </div>
          {rows.length > 0 ? (
            <div className="relative flex h-full items-end gap-2.5">
              {rows.map((item) => (
                <div key={`hour-${item.slot}-calls-rdv`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="rounded-full bg-white/80 px-2 py-1 text-center shadow-[0_10px_18px_rgba(20,32,53,0.05)]">
                    <p className="text-sm font-semibold leading-none text-[#2a67c7]">{formatNumber(item.calls)}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#1aa08e]">
                      {formatNumber(item.appointments)} RDV
                    </p>
                  </div>
                  <div className="flex h-[180px] items-end gap-2">
                    <div
                      className="w-[22px] rounded-t-[1rem] bg-[linear-gradient(180deg,#5aa7ff_0%,#1e5bbb_100%)] shadow-[0_14px_26px_rgba(33,90,180,0.18)] sm:w-[24px]"
                      style={{
                        height: `${Math.max(
                          safeDivide(item.calls, chartMax, 0) * 100,
                          toNumber(item.calls, 0) > 0 ? 8 : 0,
                        )}%`,
                      }}
                    />
                    <div
                      className="w-[22px] rounded-t-[1rem] bg-[linear-gradient(180deg,#63dbc7_0%,#17a08d_100%)] shadow-[0_14px_26px_rgba(23,160,141,0.16)] sm:w-[24px]"
                      style={{
                        height: `${Math.max(
                          safeDivide(item.appointments, chartMax, 0) * 100,
                          toNumber(item.appointments, 0) > 0 ? 8 : 0,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#20344b]">{item.label}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#7a8da3]">Appels / RDV</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#607287]">
              Aucune activite horaire disponible.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[#edf3f8] pt-4 text-sm text-[#44586f]">
        <div className="flex items-center gap-3 rounded-full bg-[#f4f8fc] px-3 py-2">
          <span className="h-4 w-7 rounded-lg bg-[linear-gradient(180deg,#5aa7ff_0%,#1e5bbb_100%)] shadow-[0_10px_20px_rgba(33,90,180,0.16)]" />
          <span>Appels</span>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-[#f1faf7] px-3 py-2">
          <span className="h-4 w-7 rounded-lg bg-[linear-gradient(180deg,#63dbc7_0%,#17a08d_100%)] shadow-[0_10px_20px_rgba(23,160,141,0.14)]" />
          <span>RDV</span>
        </div>
      </div>
    </div>
  );
}

function CampaignLiveCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{
    id: number;
    campaign: string;
    pace: string;
    available: number;
    waitSeconds: number;
    wait: string;
    team: string;
    activeCalls: number;
    agentsInCall: number;
    communicationSeconds: number;
    waitingSeconds: number;
    communicationWaitingSeconds: number;
    pauseSeconds: number;
    qualificationSeconds: number;
  }>;
}) {
  const maxAvailable = Math.max(1, ...rows.map((row) => toNumber(row.available, 0)));

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(93,222,199,0.16),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">{title}</h3>
          <p className="mt-1 text-sm text-[#65788c]">{subtitle}</p>
        </div>
        <div className="rounded-full bg-[#eef8f6] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#0f6a66]">
          Recap campagne
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div
              key={`campaign-availability-${row.id}-${row.campaign}`}
              className="rounded-[1.35rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4 shadow-[0_12px_24px_rgba(20,32,53,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#102033]">{row.campaign}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#7a8da3]">{row.pace}</p>
                </div>
                <span className="rounded-full bg-[#eef8f6] px-2.5 py-1 text-[11px] font-semibold text-[#0f6a66]">
                  {formatNumber(row.available)}
                </span>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[#7a8da3]">
                Contacts disponibles
              </p>
              <div className="mt-4 h-2.5 rounded-full bg-[#e9f0f6]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#63dbc7_0%,#17a08d_100%)]"
                  style={{
                    width: `${Math.max(safeDivide(row.available, maxAvailable, 0) * 100, row.available > 0 ? 6 : 0)}%`,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#607287]">
                <span className="truncate">{row.team}</span>
                <span>{formatNumber(row.activeCalls)} live</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-6 text-sm text-[#607287] md:col-span-5">
            Aucune campagne active disponible.
          </div>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.45rem] border border-[#edf2f7] bg-white shadow-[0_12px_28px_rgba(20,32,53,0.05)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7fbff]">
            <tr>
              {["Campagne", "Vitesse", "Disponibles", "Delai d'attente", "Equipe"].map((label) => (
                <th
                  key={label}
                  className="border-b border-[#edf2f7] px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={`campaign-${row.id}-${row.campaign}`}>
                  <td className="border-b border-[#edf2f7] px-4 py-3 font-medium text-[#17304a]">
                    <div>
                      <p className="font-medium text-[#17304a]">{row.campaign}</p>
                      <p className="mt-1 text-xs text-[#7a8da3]">{formatNumber(row.activeCalls)} appels live</p>
                    </div>
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3">
                    <span className="rounded-full bg-[#eef8f6] px-2.5 py-1 text-xs font-medium text-[#0f6a66]">
                      {row.pace}
                    </span>
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 font-semibold text-[#17304a]">
                    {formatNumber(row.available)}
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3">
                    <span className="rounded-full bg-[#fff6ea] px-2.5 py-1 text-xs font-medium text-[#9a622e]">
                      {row.waitSeconds > 0 ? row.wait : "0 s"}
                    </span>
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3">
                    <span className="rounded-full bg-[#f5f9fd] px-2.5 py-1 text-xs font-medium text-[#4f6478]">
                      {row.team}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#607287]">
                  Aucune campagne live disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgentStatusCard({
  rows,
}: {
  rows: Array<{ name: string; count: number; share: number; color: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(227,165,109,0.16),transparent_72%)] blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">Equipes et occupation</h3>
          <p className="mt-1 text-sm text-[#65788c]">
            Lecture rapide des statuts agents sur le plateau superviseur.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#27518f]">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div key={`agent-status-${row.name}-${row.count}`} className="space-y-2.5 rounded-[1.25rem] border border-[#edf2f7] bg-[#fbfdff] px-4 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#102033]">{row.name}</p>
                <p className="mt-1 text-sm text-[#65788c]">{formatNumber(row.count)} agents</p>
              </div>
              <span className="rounded-full bg-[#fff3e7] px-3 py-1 text-xs font-medium text-[#8a5425]">
                {row.share}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[#edf3f8]">
              <div className={`${row.color} h-full rounded-full`} style={{ width: `${Math.max(row.share, row.count > 0 ? 6 : 0)}%` }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function ProductionCampaignCard({
  rows,
}: {
  rows: Array<{
    id: number;
    campaign: string;
    pace: string;
    available: number;
    waitSeconds: number;
    wait: string;
    team: string;
    activeCalls: number;
    agentsInCall: number;
    communicationSeconds: number;
    waitingSeconds: number;
    communicationWaitingSeconds: number;
    pauseSeconds: number;
    qualificationSeconds: number;
  }>;
}) {
  const maxCombined = Math.max(
    1,
    ...rows.map((row) => toNumber(row.communicationWaitingSeconds, 0)),
  );
  const hasTimedCampaignMetric = rows.some(
    (row) =>
      toNumber(row.communicationSeconds, 0) > 0 ||
      toNumber(row.waitingSeconds, 0) > 0 ||
      toNumber(row.pauseSeconds, 0) > 0 ||
      toNumber(row.qualificationSeconds, 0) > 0,
  );

  return (
    <div className="relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(93,222,199,0.14),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">Volumes de production par campagne</h3>
          <p className="mt-1 text-sm text-[#65788c]">
            Vue campagne des agents et des temps production exposes par les APIs actuelles.
          </p>
        </div>
        <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#295086]">
          Production campagne
        </div>
      </div>

      {hasTimedCampaignMetric ? (
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {rows.map((row) => (
            <div
              key={`campaign-production-${row.id}-${row.campaign}`}
              className="rounded-[1.3rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4 shadow-[0_12px_24px_rgba(20,32,53,0.05)]"
            >
              <p className="truncate text-sm font-semibold text-[#102033]">{row.campaign}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#7a8da3]">
                {formatDuration(row.communicationWaitingSeconds)}
              </p>
              <div className="mt-4 h-2.5 rounded-full bg-[#e9f0f6]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#5aa7ff_0%,#1e5bbb_100%)]"
                  style={{
                    width: `${Math.max(
                      safeDivide(row.communicationWaitingSeconds, maxCombined, 0) * 100,
                      row.communicationWaitingSeconds > 0 ? 6 : 0,
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-[#607287]">{formatNumber(row.agentsInCall)} agents</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.3rem] border border-dashed border-[#d7e2ee] bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbff_100%)] px-4 py-4 text-sm text-[#607287]">
          <p className="font-medium text-[#20344b]">Aucune duree exploitable par campagne pour le moment.</p>
          <p className="mt-1 text-sm text-[#607287]">
            Les campagnes affichees sont reelles, mais l’API ne renvoie pas encore les agrégats par campagne
            pour <span className="font-medium text-[#42576d]">communication_seconds</span>,
            <span className="font-medium text-[#42576d]"> waiting_seconds</span>,
            <span className="font-medium text-[#42576d]"> pause_seconds</span> et
            <span className="font-medium text-[#42576d]"> qualification_seconds</span>.
          </p>
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-[1.45rem] border border-[#edf2f7] bg-white shadow-[0_12px_28px_rgba(20,32,53,0.05)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7fbff]">
            <tr>
              {["Campagne", "Agents", "Communication / attente", "Pause", "Qualification"].map((label) => (
                <th
                  key={label}
                  className="border-b border-[#edf2f7] px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={`campaign-production-table-${row.id}-${row.campaign}`}>
                  <td className="border-b border-[#edf2f7] px-4 py-3 font-medium text-[#17304a]">
                    {row.campaign}
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                    {formatNumber(row.agentsInCall)}
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 font-semibold text-[#17304a]">
                    {formatDuration(row.communicationWaitingSeconds)}
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                    {formatDuration(row.pauseSeconds)}
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                    {formatDuration(row.qualificationSeconds)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#607287]">
                  Aucune campagne active disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgentsLiveCard({
  rows,
}: {
  rows: Array<{ id: number; name: string; campaign: string; status: string; occupancy: string; quality: string }>;
}) {
  return (
    <div className="relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(227,165,109,0.14),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">Agents en supervision</h3>
          <p className="mt-1 text-sm text-[#65788c]">
            Statut live, campagne rattachee et tempo moyen sur la journee.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3e7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8a5425]">
          <span className="h-2 w-2 rounded-full bg-[#e3a56d]" />
          {rows.length} agents suivis
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.45rem] border border-[#edf2f7] bg-white shadow-[0_12px_28px_rgba(20,32,53,0.05)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7fbff]">
            <tr>
              {["Agent", "Campagne", "Statut", "Appels du jour", "DMC moy."].map((label) => (
                <th
                  key={label}
                  className="border-b border-[#edf2f7] px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={`agent-${row.id}-${row.name}`}>
                  <td className="border-b border-[#edf2f7] px-4 py-3 font-medium text-[#17304a]">{row.name}</td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">{row.campaign}</td>
                  <td className="border-b border-[#edf2f7] px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        row.status.toLowerCase().includes("appel")
                          ? "bg-[#fff3e7] text-[#8a5425]"
                          : row.status.toLowerCase().includes("qualification")
                            ? "bg-[#eef4ff] text-[#295086]"
                            : row.status.toLowerCase().includes("disponible")
                              ? "bg-[#edf8f4] text-[#0f6a66]"
                              : "bg-[#f5f9fd] text-[#506478]"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="border-b border-[#edf2f7] px-4 py-3 font-semibold text-[#17304a]">{row.occupancy}</td>
                  <td className="border-b border-[#edf2f7] px-4 py-3">
                    <span className="rounded-full bg-[#edf8f4] px-2.5 py-1 text-xs font-medium text-[#0f6a66]">
                      {row.quality}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#607287]">
                  Aucun agent live disponible.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupervisorInsightsCard({
  topAgents,
  qualifications,
}: {
  topAgents: TopAgentItem[];
  qualifications: ReportingQualificationStatusItem[];
}) {
  const displayedQualifications = qualifications.slice(0, 4);

  return (
    <div className="relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle,rgba(227,165,109,0.16),transparent_72%)] blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">Top agents et qualifications</h3>
          <p className="mt-1 text-sm text-[#65788c]">
            Lecture croisee des meilleurs agents et des qualifications remontees sur la journee.
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4ea] text-[#c56e34]">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-3.5">
        {topAgents.length > 0 ? (
          topAgents.map((agent) => (
            <div key={`top-agent-${agent.agentId}-${agent.name}`} className="rounded-[1.35rem] border border-[#edf2f7] bg-[#fbfdff] p-4 shadow-[0_10px_22px_rgba(20,32,53,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#102033]">{agent.name}</p>
                  <p className="mt-1 text-sm text-[#65788c]">
                    {formatNumber(agent.calls)} appels, {formatNumber(agent.appointments)} RDV
                  </p>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#295086]">
                  {formatNumber(agent.doneAppointments)} realises
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.35rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
            Aucun top agent disponible pour aujourd hui.
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[1.35rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#f8fbff_0%,#f5f9fd_100%)] p-4 shadow-[0_10px_22px_rgba(20,32,53,0.04)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7e92]">
          Repartition qualifications
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {displayedQualifications.length > 0 ? (
            displayedQualifications.map((item) => (
              <span
                key={`${item.qualification_id ?? "none"}-${item.qualification_name}`}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#24415d] shadow-[0_8px_18px_rgba(20,32,53,0.06)]"
              >
                {item.qualification_name} · {formatPercent(item.percentage)}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#607287]">Aucune qualification remontee.</span>
          )}
        </div>
      </div>
    </div>
  );
}
