"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  ClipboardCheck,
  Gauge,
  Headphones,
  PauseCircle,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  formatElapsedTime,
  getStatusLabel,
  useLiveMonitoring,
} from "@/features/monitoring/hooks/use-live-monitoring";
import type { LiveAgentStatus } from "@/types/monitoring.types";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function AdminRealtimeModule() {
  const { agents, counts, snapshot, trafficMetrics, isLoading, error } = useLiveMonitoring();
  const [showOfflineAgents, setShowOfflineAgents] = useState(false);

  const waitingCount = snapshot?.ringing_agents ?? agents.filter((agent) => agent.status === "ringing").length;
  const inCallCount = snapshot?.in_call_agents ?? agents.filter((agent) => agent.status === "in_call").length;
  const pausedCount = snapshot?.paused_agents ?? agents.filter((agent) => agent.status === "paused").length;
  const qualificationCount =
    snapshot?.wrap_up_agents ?? agents.filter((agent) => agent.status === "qualification").length;
  const offlineCount = snapshot?.offline_agents ?? agents.filter((agent) => agent.status === "offline").length;
  const visibleAgents = useMemo(
    () => (showOfflineAgents ? agents : agents.filter((agent) => agent.status !== "offline")),
    [agents, showOfflineAgents],
  );

  if (isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Administration CRM"
          title="Temps reel"
          description="Chargement de la supervision backend en cours."
        />
        <Card className="border border-[#cfd9e6] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="px-6 py-10 text-sm text-[#607287]">
            Chargement des KPI, agents, appels live, campagnes et alertes...
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Administration CRM"
          title="Temps reel"
          description="Impossible de charger la supervision temps reel."
        />
        <Card className="border border-[#f2d5db] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="px-6 py-10 text-sm text-[#b54f67]">{error}</CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Temps reel"
        description="Supervision des campagnes en temps reel avec une lecture plateau dense, vivante et inspiree d'un monitoring call center de production."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <Radio className="h-4 w-4 text-[#295086]" />
              Ecoute live active
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d5db] bg-[#fff7f9] px-3 py-2 text-sm font-medium text-[#b54f67] shadow-[0_10px_22px_rgba(181,79,103,0.08)]">
              <ShieldCheck className="h-4 w-4 text-[#d95a78]" />
              Supervision plateau
            </span>
          </>
        }
      />

      <Card className="overflow-hidden border border-[#cfd9e6] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-0 p-0">
          <div className="border-b border-[#d8e1ed] bg-[#f8fbff] px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#2d6fcb]">
                  <Headphones className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#102033]">
                    Supervision des campagnes en temps reel
                  </h2>
                  <p className="mt-1 text-sm text-[#607287]">
                    Tableau de bord live du plateau avec statuts agent, volumes et trafic de production.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#295086]">
                  <span className="h-2 w-2 rounded-full bg-[#2d6fcb] animate-pulse" />
                  {visibleAgents.length} agents affiches
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d9eee9] bg-[#f3fbf8] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f6a66]">
                  <Activity className="h-3.5 w-3.5" />
                  Backend live branche
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[1.58fr_0.42fr]">
            <div className="border-r border-[#dbe3ee] p-4">
              <div className="overflow-hidden rounded-[0.9rem] border border-[#cfd9e6] bg-white">
                <div className="grid grid-cols-6 gap-0 border-b border-[#d7e0eb] bg-white">
                  <StatusRibbonItem
                    value={counts.connected}
                    label="Total agents"
                    color="bg-[#1ea672]"
                    textColor="text-[#1ea672]"
                  />
                  <StatusRibbonItem
                    value={waitingCount}
                    label="Attente"
                    color="bg-[#f0b57d]"
                    textColor="text-[#9a7412]"
                  />
                  <StatusRibbonItem
                    value={inCallCount}
                    label="Appel"
                    color="bg-[#18a36a]"
                    textColor="text-[#0f8b6d]"
                  />
                  <StatusRibbonItem
                    value={pausedCount}
                    label="Pause"
                    color="bg-[#7c68d8]"
                    textColor="text-[#5b48b0]"
                  />
                  <StatusRibbonItem
                    value={qualificationCount}
                    label="Qualification"
                    color="bg-[#f09c43]"
                    textColor="text-[#b56a2a]"
                  />
                  <StatusRibbonItem
                    value={offlineCount}
                    label="Hors ligne"
                    color="bg-[#a2afbf]"
                    textColor="text-[#617386]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-[#d7e0eb] bg-[#f8fbff] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#102033]">Tableau agents</p>
                    <p className="text-xs text-[#6f8195]">
                      Affichage par defaut des agents connectes. Les agents hors ligne restent comptes dans les KPI.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOfflineAgents((currentValue) => !currentValue)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                      showOfflineAgents
                        ? "border-[#c9d6e5] bg-white text-[#24415d]"
                        : "border-[#d9eee9] bg-[#f3fbf8] text-[#0f6a66]"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {showOfflineAgents ? "Masquer hors ligne" : "Afficher hors ligne"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="bg-[#1b1f74] text-white">
                      <tr>
                        <HeaderCell>Agent</HeaderCell>
                        <HeaderCell>Statut</HeaderCell>
                        <HeaderCell>Temps</HeaderCell>
                        <HeaderCell>Appels</HeaderCell>
                        <HeaderCell>Ventes</HeaderCell>
                        <HeaderCell>Liste</HeaderCell>
                        <HeaderCell className="text-right">Actions</HeaderCell>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAgents.map((agent, index) => (
                        <AgentRealtimeRow key={agent.id} agent={agent} index={index} />
                      ))}
                      {visibleAgents.length === 0 ? (
                        <tr className="border-b border-[#eef2f6] bg-white text-[#607287]">
                          <td className="px-3 py-6 text-sm" colSpan={7}>
                            Aucun agent connecte a afficher pour le moment.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="rounded-[0.9rem] border border-[#cfd9e6] bg-white shadow-[0_14px_30px_rgba(20,32,53,0.05)]">
                <div className="flex items-center justify-between border-b border-[#e9eef5] px-4 py-3">
                  <div>
                    <p className="text-lg font-semibold text-[#102033]">Trafic</p>
                    <p className="text-xs text-[#7a8da3]">
                      Delai moyen {snapshot?.avg_duration ?? 0} s
                    </p>
                  </div>
                  <span className="rounded-full bg-[#effbf7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0f8b6d]">
                    Live
                  </span>
                </div>
                <div className="space-y-4 px-4 py-4">
                  {trafficMetrics.map((metric) => (
                    <TrafficBar
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      color={metric.color}
                      width={metric.width}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function StatusRibbonItem({
  value,
  label,
  color,
  textColor,
}: {
  value: number;
  label: string;
  color: string;
  textColor: string;
}) {
  return (
    <div className="border-r border-[#e1e8f2] px-3 py-3 last:border-r-0">
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-[0_6px_16px_rgba(0,0,0,0.16)] ${color}`}>
          {value}
        </span>
        <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
      </div>
      <div className={`mt-3 h-[4px] w-full rounded-full ${color}`} />
    </div>
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] ${className}`}
    >
      {children}
    </th>
  );
}

function AgentRealtimeRow({
  agent,
  index,
}: {
  agent: {
    id: string;
    code: string;
    fullName: string;
    team: string;
    group: string;
    campaign: string;
    status: LiveAgentStatus;
    lastAction: string;
    elapsedSeconds?: number;
    callsCount?: number;
    salesCount?: number;
    listLabel?: string;
  };
  index: number;
}) {
  const rowTone = getRowTone(agent.status, index);
  const statusTone = getStatusTone(agent.status);

  return (
    <tr className={`${rowTone} border-b border-white/40 text-[#102033]`}>
      <td className="px-3 py-2.5">
        <div className="space-y-0.5">
          <p className="font-semibold">{agent.fullName}</p>
          <p className="text-[11px] text-[#0d223c]/70">
            {agent.code} ({agent.team})
          </p>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex items-center gap-2 rounded-[0.55rem] px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
          {getStatusIcon(agent.status)}
          {getStatusLabel(agent.status)}
        </span>
      </td>
      <td className="px-3 py-2.5 font-semibold tabular-nums">
        {formatElapsedTime(agent.elapsedSeconds ?? 0)}
      </td>
      <td className="px-3 py-2.5 font-medium">{agent.callsCount ?? 0}</td>
      <td className="px-3 py-2.5 font-medium">{agent.salesCount ?? 0}</td>
      <td className="px-3 py-2.5">
        <div className="space-y-0.5">
          <p>{agent.listLabel ?? agent.campaign}</p>
          <p className="text-[11px] text-[#0d223c]/70">{agent.group}</p>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex justify-end gap-1.5">
          <ActionDot color="bg-[#2d6fcb]" icon="i" />
          <ActionDot color="bg-[#0f8b6d]" icon="+" />
          <ActionDot color="bg-[#f09c43]" icon="T" />
          <ActionDot color="bg-[#6954cc]" icon="Q" />
          <ActionDot color="bg-[#d95a78]" icon="P" />
        </div>
      </td>
    </tr>
  );
}

function TrafficBar({
  label,
  value,
  color,
  width,
}: {
  label: string;
  value: number | string;
  color: string;
  width: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#24415d]">{label}</p>
        <span className={`rounded-[0.55rem] px-2 py-1 text-[11px] font-semibold text-white ${color}`}>
          {value}
        </span>
      </div>
      <div className="h-[6px] rounded-full bg-[#e2e9f2]">
        <div className={`h-[6px] rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function ActionDot({
  color,
  icon,
}: {
  color: string;
  icon: string;
}) {
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-[0.45rem] text-[11px] font-bold text-white ${color}`}>
      {icon}
    </span>
  );
}

function getRowTone(status: LiveAgentStatus, index: number) {
  if (status === "in_call") return "bg-[#24b520]";
  if (status === "waiting") return "bg-[#3ccb2f]";
  if (status === "ringing") return "bg-[#ffd633]";
  if (status === "qualification") return "bg-[#f1a91d]";
  if (status === "hung_up") return "bg-[#f3f5f8]";
  if (status === "offline") return "bg-[#f3f5f8]";
  if (status === "paused") return index % 2 === 0 ? "bg-[#dde3ec]" : "bg-[#e5eaf1]";
  return "bg-white";
}

function getStatusTone(status: LiveAgentStatus) {
  if (status === "in_call") return "bg-[#11954a] text-white";
  if (status === "waiting") return "bg-[#3d9f4f] text-white";
  if (status === "ringing") return "bg-[#ffbf00] text-[#523b00]";
  if (status === "qualification") return "bg-[#ea8f10] text-white";
  if (status === "hung_up") return "bg-[#cc466d] text-white";
  if (status === "offline") return "bg-[#8e98a8] text-white";
  return "bg-[#8e98a8] text-white";
}

function getStatusIcon(status: LiveAgentStatus) {
  switch (status) {
    case "paused":
      return <PauseCircle className="h-3.5 w-3.5" />;
    case "waiting":
      return <BellRing className="h-3.5 w-3.5" />;
    case "ringing":
      return <Radio className="h-3.5 w-3.5" />;
    case "in_call":
      return <PhoneCall className="h-3.5 w-3.5" />;
    case "hung_up":
      return <PhoneOff className="h-3.5 w-3.5" />;
    case "qualification":
      return <ClipboardCheck className="h-3.5 w-3.5" />;
    case "offline":
      return <Users className="h-3.5 w-3.5" />;
  }
}
