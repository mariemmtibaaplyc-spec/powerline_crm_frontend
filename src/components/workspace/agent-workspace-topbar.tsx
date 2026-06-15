"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, Coffee, LogOut, Mic, MicOff, PauseCircle } from "lucide-react";
import { RolePreviewSwitcher } from "@/components/layout/role-preview-switcher";
import { cn } from "@/lib/utils";
import {
  formatAgentElapsedTime,
  useAgentWorkspaceState,
} from "@/components/workspace/agent-workspace-provider";
import { useClientClock } from "@/features/workspace/hooks/use-client-clock";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";

export function AgentWorkspaceTopbar() {
  const router = useRouter();
  const {
    activePause,
    agentIdentity,
    agentStatus,
    currentStatusMeta,
    endPause,
    pauseOptions,
    selectedPauseType,
    selectPauseType,
    startPause,
  } = useAgentWorkspaceState();
  const setAuthSession = useAuthStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [micEnabled, setMicEnabled] = useState(true);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const pauseMenuRef = useRef<HTMLDivElement>(null);
  const now = useClientClock(Boolean(activePause));

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!pauseMenuRef.current?.contains(event.target as Node)) {
        setPauseMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setPauseMenuOpen(false);
  }, [agentStatus]);

  const elapsedTime = activePause
    ? now === 0
      ? "00:00:00"
      : formatAgentElapsedTime(now - activePause.startedAt)
    : "00:00:00";

  function handleStartPause() {
    startPause(selectedPauseType.code);
    setPauseMenuOpen(false);
  }

  function handleEndPause() {
    endPause();
    setPauseMenuOpen(false);
  }

  function handleLogout() {
    setAuthSession(null);
    clearSession();
    document.cookie =
      "powerline_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  }

  return (
    <>
      <div className="sticky top-2 z-20 rounded-[1.5rem] border border-[#15263a]/8 bg-[#0d1b2a]/96 px-4 py-3 text-white shadow-[0_24px_60px_rgba(12,18,30,0.24)] backdrop-blur-xl sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.24em] text-white/38">
              Agent line
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold">
              {agentIdentity.fullName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/62">
              <span>{agentIdentity.campaign}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#9ee7e0]" />
              <span>{agentIdentity.group}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
                  currentStatusMeta.badgeDark,
                )}
              >
                <span
                  className={cn("h-2 w-2 rounded-full", currentStatusMeta.dotClass)}
                />
                {currentStatusMeta.label}
              </span>
              {activePause ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f0b57d]" />
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#f0b57d]/20 bg-[#fff8f1]/10 px-2.5 py-1 text-xs font-medium text-[#ffd8b5]">
                    <PauseCircle className="h-3.5 w-3.5" />
                    Pause active
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <RolePreviewSwitcher tone="dark" compact />

            <button
              type="button"
              onClick={() => setMicEnabled((value) => !value)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                micEnabled
                  ? "border-[#2b4e8e]/28 bg-[#1b3355] text-[#d7ecff] hover:bg-[#214166]"
                  : "border-[#8a4256]/32 bg-[#311a24] text-[#ffd7e1] hover:bg-[#45202f]",
              )}
              aria-pressed={micEnabled}
            >
              {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {micEnabled ? "Micro actif" : "Micro coupe"}
            </button>

            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/82 transition hover:bg-white/12"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {agentIdentity.notificationsCount > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#f0b57d]" />
              ) : null}
            </button>

            <div ref={pauseMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!activePause) {
                    setPauseMenuOpen((value) => !value);
                  }
                }}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                  activePause || agentStatus === "paused"
                    ? "border-[#f0b57d]/28 bg-[#fff8f1]/12 text-[#ffd8b5]"
                    : pauseMenuOpen
                      ? "border-[#f0b57d]/36 bg-[#fff8f1]/12 text-[#ffd8b5]"
                      : "border-white/10 bg-white/8 text-white/82 hover:bg-white/12",
                )}
                aria-expanded={pauseMenuOpen}
              >
                <Coffee className="h-4 w-4" />
                {activePause ? "Pause active" : "Pauses"}
              </button>

              {pauseMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[290px] rounded-[1.35rem] border border-white/10 bg-[#111e30] p-3 shadow-[0_26px_60px_rgba(8,12,22,0.38)]">
                  <div className="px-2 pb-3">
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-white/38">
                      Menu des pauses
                    </p>
                    <p className="mt-2 text-sm text-white/62">
                      Selectionner un motif avant de passer l'agent en pause.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {pauseOptions.map((item) => {
                      const active = selectedPauseType.code === item.code;

                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => selectPauseType(item.code)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[1rem] border px-3 py-3 text-left text-sm transition",
                            active
                              ? "border-[#f0b57d]/28 bg-[#fff8f1]/10 text-white"
                              : "border-transparent bg-white/4 text-white/72 hover:border-white/8 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "h-3 w-3 rounded-full border",
                                active
                                  ? "border-[#f0b57d] bg-[#f0b57d] shadow-[0_0_0_3px_rgba(240,181,125,0.12)]"
                                  : "border-white/28 bg-transparent",
                              )}
                            />
                            <span>{item.label}</span>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                              active
                                ? "bg-[#fff3e7] text-[#8a5425]"
                                : "bg-white/8 text-white/58",
                            )}
                          >
                            {item.durationLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartPause}
                    className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0b57d_0%,#d99154_100%)] px-4 text-sm font-semibold text-[#1a2533] shadow-[0_18px_36px_rgba(217,145,84,0.22)] transition hover:-translate-y-0.5"
                  >
                    Prendre une pause
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#8a4256]/22 bg-[#311a24] text-[#ffd7e1] transition hover:bg-[#45202f]"
              aria-label="Deconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {activePause ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(7,12,20,0.58)] px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-[540px] overflow-hidden rounded-[2rem] border border-[#1b2d43] bg-[linear-gradient(180deg,#122238_0%,#0d1829_100%)] p-6 text-white shadow-[0_40px_100px_rgba(7,12,20,0.4)] sm:p-8">
            <div className="pointer-events-none absolute left-1/2 top-0 h-36 w-36 -translate-x-1/2 bg-[radial-gradient(circle,rgba(240,181,125,0.22),transparent_72%)] blur-3xl" />
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-[#f0b57d]/24 bg-[#fff8f1]/10 text-[#ffd8b5]">
                <Coffee className="h-7 w-7" />
              </div>
              <p className="mt-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-white/40">
                Pause active
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {activePause.type.label}
              </h3>
              <p className="mt-2 text-sm text-white/62">
                ({activePause.type.durationLabel})
              </p>

              <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-white/6 px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-5xl font-semibold tracking-[0.08em] text-white sm:text-6xl">
                  {elapsedTime}
                </p>
                <p className="mt-4 text-sm text-white/54">
                  Commencee depuis
                  <span className="ml-2 font-medium text-white/78">
                    {new Date(activePause.startedAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="h-4 w-4 text-[#9ee7e0]" />
                Timer visuel actif tant que la pause n'est pas terminee.
              </div>

              <button
                type="button"
                onClick={handleEndPause}
                className="mt-8 inline-flex h-12 min-w-[220px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0b57d_0%,#d99154_100%)] px-6 text-sm font-semibold text-[#1a2533] shadow-[0_20px_40px_rgba(217,145,84,0.24)] transition hover:-translate-y-0.5"
              >
                Terminer la pause
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
