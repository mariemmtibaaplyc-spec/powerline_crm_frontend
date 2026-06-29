"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Coffee, PauseCircle, TimerReset } from "lucide-react";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 300_000; // 5 minutes

function formatFooterSyncTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function secondsToHms(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((p) => String(p).padStart(2, "0")).join(":");
}

interface DailyStats {
  communication_seconds: number;
  qualification_seconds: number;
  attente_seconds:       number;
  pause_seconds:         number;
  total_seconds:         number;
}

export function AgentSessionFooter() {
  const {
    agentStatus,
    currentStatusMeta,
    isPaused,
    userId,
  } = useAgentWorkspaceState();

  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState("--:--");
  const [syncError, setSyncError]   = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const { workspaceApi } = await import("@/features/workspace/api/workspace.api");
        const stats = await workspaceApi.getDailyStats(userId);
        setDailyStats(stats);
        setLastSyncAt(formatFooterSyncTime(Date.now()));
        setSyncError(false);
      } catch {
        setSyncError(true);
      }
    };

    fetchStats();
    const interval = window.setInterval(fetchStats, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [userId]);

  // RDV du jour — depuis daily-stats (même fuseau UTC que les 4 autres cartes)
  const totalAppointments = dailyStats?.appointments_today ?? 0;

  // Durées cumulées depuis le backend — figées entre deux polls
  const cumComm  = dailyStats ? secondsToHms(dailyStats.communication_seconds) : "00:00:00";
  const cumQual  = dailyStats ? secondsToHms(dailyStats.qualification_seconds) : "00:00:00";
  const cumAtt   = dailyStats ? secondsToHms(dailyStats.attente_seconds)       : "00:00:00";
  const cumPause = dailyStats ? secondsToHms(dailyStats.pause_seconds)         : "00:00:00";
  const cumTotal = dailyStats ? secondsToHms(dailyStats.total_seconds)         : "00:00:00";

  const footerItems = useMemo(
    () => [
      {
        label: "Communication",
        value: cumComm,
        badge:
          agentStatus === "in_call"
            ? "Active"
            : agentStatus === "ringing"
              ? "Sonnerie"
              : agentStatus === "hung_up"
                ? "Cloture"
                : isPaused
                  ? "Inactif"
                  : "Pret",
        tone:
          agentStatus === "in_call"
            ? "bg-[#17342f] text-[#bceee0]"
            : agentStatus === "ringing"
              ? "bg-[#14303a] text-[#bfefff]"
              : agentStatus === "hung_up"
                ? "bg-[#311a24] text-[#ffd7e1]"
                : isPaused
                  ? "bg-[#1d2c42] text-[#c7dcf8]"
                  : "bg-[#17342f] text-[#bceee0]",
        icon: Activity,
      },
      {
        label: "Qualification",
        value: cumQual,
        badge: agentStatus === "qualification" ? "Active" : "Suivi fiche",
        tone:
          agentStatus === "qualification"
            ? "bg-[#34231a] text-[#ffd8b5]"
            : "bg-[#2f2b1d] text-[#f2d38b]",
        icon: TimerReset,
      },
      {
        label: "Attente",
        value: cumAtt,
        badge: agentStatus === "waiting" ? "Active" : "File",
        tone:
          agentStatus === "waiting"
            ? "bg-[#322914] text-[#f2d38b]"
            : "bg-[#222e3d] text-[#c2d0e1]",
        icon: Clock3,
      },
      {
        label: "Pause",
        value: cumPause,
        badge: isPaused ? "Active" : "Levee",
        tone: isPaused
          ? "bg-[#241e4d] text-[#ddd3ff]"
          : "bg-[#17342f] text-[#bceee0]",
        icon: Coffee,
      },
      {
        label: "Total session",
        value: cumTotal,
        badge: syncError ? "Erreur sync" : `Sync ${lastSyncAt}`,
        tone: syncError
          ? "bg-[#311a24] text-[#ffd7e1]"
          : "bg-[#223650] text-[#d7ecff]",
        icon: PauseCircle,
      },
    ],
    [agentStatus, isPaused, lastSyncAt, syncError, cumComm, cumQual, cumAtt, cumPause, cumTotal],
  );

  return (
    <div className="fixed bottom-3 left-3 right-3 z-30 lg:left-[calc(1rem+17.875rem+1rem)] lg:right-4 xl:left-[calc(1rem+19rem+1.25rem)] 2xl:left-[calc(1rem+20rem+1.25rem)]">
      <div className="overflow-hidden rounded-[1.45rem] border border-[#102238] bg-[linear-gradient(180deg,rgba(13,27,42,0.96)_0%,rgba(9,20,33,0.98)_100%)] text-white shadow-[0_30px_80px_rgba(7,12,20,0.34)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-[linear-gradient(180deg,rgba(93,148,235,0.14),transparent)]" />
        <div className="relative flex flex-col gap-3 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-white/38">
                Footer production agent
              </p>
              <p className="mt-1 text-sm text-white/62">
                {syncError
                  ? "Erreur de synchronisation — derniere valeur connue affichee."
                  : `Statistiques journalieres — mise a jour toutes les 5 minutes. Sync ${lastSyncAt}.`}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.05] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
                    RDV aujourd'hui
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalAppointments}
                  </p>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium",
                currentStatusMeta.badgeDark,
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  currentStatusMeta.dotClass,
                )}
              />
              {currentStatusMeta.label}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {footerItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/8 bg-white/[0.045] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-white/48" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/46">
                        {item.label}
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                      item.tone,
                    )}
                  >
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
