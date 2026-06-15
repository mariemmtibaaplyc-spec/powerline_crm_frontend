"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Coffee, PauseCircle, TimerReset } from "lucide-react";
import {
  formatAgentElapsedTime,
  useAgentWorkspaceState,
} from "@/components/workspace/agent-workspace-provider";
import { useClientClock } from "@/features/workspace/hooks/use-client-clock";
import { cn } from "@/lib/utils";

const footerSnapshots = [
  {
    communication: "00:00:00",
    qualification: "00:48:47",
    attente: "00:00:00",
    pause: "00:46:13",
    totalSession: "02:05:29",
  },
  {
    communication: "00:00:00",
    qualification: "00:53:12",
    attente: "00:02:14",
    pause: "00:51:03",
    totalSession: "02:10:29",
  },
  {
    communication: "00:00:00",
    qualification: "00:58:41",
    attente: "00:01:09",
    pause: "00:56:04",
    totalSession: "02:15:29",
  },
] as const;

function formatFooterSyncTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgentSessionFooter() {
  const {
    agentStatus,
    appointments,
    currentStatusMeta,
    isPaused,
    sessionStartedAt,
    statusStartedAt,
  } = useAgentWorkspaceState();
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const now = useClientClock();
  const [lastSyncAt, setLastSyncAt] = useState("--:--");

  useEffect(() => {
    setLastSyncAt(formatFooterSyncTime(Date.now()));

    const interval = window.setInterval(() => {
      setSnapshotIndex((current) => (current + 1) % footerSnapshots.length);
      setLastSyncAt(formatFooterSyncTime(Date.now()));
    }, 300000);

    return () => window.clearInterval(interval);
  }, []);

  const snapshot = footerSnapshots[snapshotIndex];
  const totalAppointments = appointments.length;
  const sessionElapsed =
    now === 0 ? "00:00:00" : formatAgentElapsedTime(now - sessionStartedAt);
  const stateElapsed =
    now === 0 ? "00:00:00" : formatAgentElapsedTime(now - statusStartedAt);

  const footerItems = useMemo(
    () => [
      {
        label: "Communication",
        value:
          agentStatus === "in_call" ||
          agentStatus === "ringing" ||
          agentStatus === "hung_up"
            ? stateElapsed
            : snapshot.communication,
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
        value:
          agentStatus === "qualification" ? stateElapsed : snapshot.qualification,
        badge: agentStatus === "qualification" ? "Active" : "Suivi fiche",
        tone:
          agentStatus === "qualification"
            ? "bg-[#34231a] text-[#ffd8b5]"
            : "bg-[#2f2b1d] text-[#f2d38b]",
        icon: TimerReset,
      },
      {
        label: "Attente",
        value: agentStatus === "waiting" ? stateElapsed : snapshot.attente,
        badge: agentStatus === "waiting" ? "Active" : "File",
        tone:
          agentStatus === "waiting"
            ? "bg-[#322914] text-[#f2d38b]"
            : "bg-[#222e3d] text-[#c2d0e1]",
        icon: Clock3,
      },
      {
        label: "Pause",
        value: isPaused ? stateElapsed : snapshot.pause,
        badge: isPaused ? "Active" : "Levee",
        tone: isPaused
          ? "bg-[#241e4d] text-[#ddd3ff]"
          : "bg-[#17342f] text-[#bceee0]",
        icon: Coffee,
      },
      {
        label: "Total session",
        value: sessionElapsed,
        badge: `Sync ${lastSyncAt}`,
        tone: "bg-[#223650] text-[#d7ecff]",
        icon: PauseCircle,
      },
    ],
    [agentStatus, isPaused, lastSyncAt, sessionElapsed, snapshot, stateElapsed],
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
                Lecture continue de la session et mise a jour mockee toutes les
                5 minutes.
              </p>
              <div className="mt-3 inline-flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.05] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
                    RDV totaux
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalAppointments}
                  </p>
                </div>
                <span className="rounded-full bg-[#effbf5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#15795d]">
                  Store live
                </span>
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
