"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock3,
  Delete,
  PauseCircle,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Play,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AGENT_STATUS_OPTIONS,
  formatAgentElapsedTime,
  useAgentWorkspaceState,
} from "@/components/workspace/agent-workspace-provider";
import { useClientClock } from "@/features/workspace/hooks/use-client-clock";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";
import { useSipPhone } from "@/features/workspace/sip/sip-phone.provider";

const actions = [
  {
    label: "Appel manuel",
    hint: "Composer un numero sortant",
    icon: PhoneCall,
    tone:
      "border-[#d9e8fb] bg-[linear-gradient(135deg,#2d6fcb_0%,#4b8ef0_100%)] text-white shadow-[0_18px_36px_rgba(45,111,203,0.18)]",
  },
  {
    label: "Raccrocher",
    hint: "Clore la communication",
    icon: PhoneOff,
    tone:
      "border-[#f3d3da] bg-[linear-gradient(135deg,#cc647d_0%,#e07a8f_100%)] text-white shadow-[0_18px_36px_rgba(204,100,125,0.18)]",
  },
] as const;

const dialPadKeys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
] as const;

const SIMULATED_AGENT_STATUS_OPTIONS = AGENT_STATUS_OPTIONS.filter(
  (option) => option.value !== "connected",
);

function sanitizeManualNumber(value: string) {
  return value.replace(/[^\d+*#()\-\s]/g, "");
}

export function AgentCallControlPanel() {
  const {
    agentStatus,
    currentStatusMeta,
    isEndingCall,
    isPaused,
    markAgentHungUp,
    openQualification,
    resumeQueue,
    setAgentStatus,
    startManualCall,
    statusStartedAt,
  } = useAgentWorkspaceState();

  // Log de rendu horodaté — mesure le délai entre update Zustand et render React
  const prevAgentStatusRef = useRef<string | null>(null);
  if (agentStatus !== prevAgentStatusRef.current) {
    const { callSession, currentCallId } = useWorkspaceStore.getState();
    console.log(
      `[TIMING] React render t=${Date.now()} agentStatus=${agentStatus} callId=${callSession.backendCallId ?? currentCallId ?? 'none'}`,
    );
    prevAgentStatusRef.current = agentStatus;
  }
  const { hangup: sipHangup, accept: sipAccept, hasIncomingCall } = useSipPhone();
  const [dialPadOpen, setDialPadOpen] = useState(false);
  const [manualNumber, setManualNumber] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const now = useClientClock();
  // Appel manuel uniquement en pause — "waiting" = file prédictive active, pas de manuel
  const canUseManualCall = agentStatus === "paused";

  const handleCallSubmit = useCallback(() => {
    if (!manualNumber || !canUseManualCall) return;
    startManualCall(manualNumber);
    setManualNumber("");
    setDialPadOpen(false);
  }, [canUseManualCall, manualNumber, startManualCall]);

  useEffect(() => {
    if (!dialPadOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (/^[0-9*#]$/.test(event.key)) {
        setManualNumber((current) => `${current}${event.key}`);
        return;
      }

      if (event.key === "Backspace") {
        setManualNumber((current) => current.slice(0, -1));
        return;
      }

      if (event.key === "Delete") {
        setManualNumber("");
        return;
      }

      if (event.key === "Escape") {
        setDialPadOpen(false);
        return;
      }

      if (event.key === "Enter" && manualNumber.length > 0) {
        handleCallSubmit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialPadOpen, handleCallSubmit, manualNumber]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!statusMenuRef.current?.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setStatusMenuOpen(false);
  }, [agentStatus]);

  const displayNumber = useMemo(() => manualNumber, [manualNumber]);
  const statusElapsed =
    now === 0 ? "00:00:00" : formatAgentElapsedTime(now - statusStartedAt);
  const canOpenQualificationFromHangup =
    !isEndingCall &&
    (agentStatus === "in_call" || agentStatus === "hung_up" || agentStatus === "ringing");
  const canPauseFromCurrentState = agentStatus === "waiting";

  useEffect(() => {
    const mode = agentStatus === "paused" ? "manual" : agentStatus === "waiting" ? "predictive" : "other";
    console.log(
      `[AgentCallControlPanel] agentStatus=${agentStatus} mode=${mode} canManualCall=${canUseManualCall}`,
    );
    if (canUseManualCall) return;
    setDialPadOpen(false);
    setManualNumber("");
  }, [agentStatus, canUseManualCall]);

  const availabilityAction = isPaused
    ? {
        label: "Reprendre la file",
        hint: "Rejoindre la file prédictive",
        icon: Play,
        tone:
          "border-[#cfeee4] bg-[linear-gradient(135deg,#14a57e_0%,#0f8b6d_100%)] text-white shadow-[0_18px_36px_rgba(15,139,109,0.2)]",
        disabled: false,
      }
    : {
        label: "Pause",
        hint: canPauseFromCurrentState
          ? "Basculer l'agent en pause"
          : "Disponible uniquement depuis l'etat En attente",
        icon: PauseCircle,
        tone:
          "border-[#d8e0e8] bg-[linear-gradient(135deg,#eff3f7_0%,#e3e9f0_100%)] text-[#203246] shadow-[0_18px_36px_rgba(20,32,53,0.08)]",
        disabled: !canPauseFromCurrentState,
      };
  // Quand l'agent a un appel entrant (manuel), remplacer "Appel manuel" par "Décrocher"
  const manualCallAction = hasIncomingCall
    ? {
        label: "Décrocher",
        hint: "Répondre à l'appel entrant",
        icon: PhoneIncoming,
        tone:
          "border-[#c9f0dd] bg-[linear-gradient(135deg,#14a57e_0%,#0f8b6d_100%)] text-white shadow-[0_18px_36px_rgba(15,139,109,0.22)]",
        disabled: false,
      }
    : {
        ...actions[0],
        disabled: !canUseManualCall,
      };

  const renderedActions = [
    availabilityAction,
    manualCallAction,
    {
      ...actions[1],
      disabled: !canOpenQualificationFromHangup || isEndingCall,
    },
  ];

  function appendKey(value: string) {
    setManualNumber((current) => `${current}${value}`);
  }

  function handleManualCallOpen() {
    setManualNumber("");
    setDialPadOpen(true);
  }

  function handleCloseDialPad() {
    setDialPadOpen(false);
  }

  return (
    <>
      <div
        className={cn(
          "relative overflow-visible rounded-[1.85rem] border p-5 shadow-[0_24px_56px_rgba(20,32,53,0.1)] sm:p-6",
          currentStatusMeta.shellTone,
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-24",
            currentStatusMeta.accentOverlay,
          )}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#607287]">
                Barre de controle agent
              </p>
            </div>

            <div ref={statusMenuRef} className="relative shrink-0">
              {/* Bouton "Simuler" retiré de l'UI agent V1 — state/logique conservés
                  (setStatusMenuOpen, SIMULATED_AGENT_STATUS_OPTIONS) au cas où
                  réutilisés ailleurs (ex: outil interne admin). */}
              {statusMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.7rem)] z-30 w-[220px] rounded-[1.2rem] border border-white/10 bg-[#0d1829] p-2.5 shadow-[0_22px_54px_rgba(7,12,20,0.34)]">
                  <p className="px-2 pb-2 pt-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Statut agent
                  </p>

                  <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1 overscroll-contain">
                    {SIMULATED_AGENT_STATUS_OPTIONS.map((option) => {
                      const active = agentStatus === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setAgentStatus(option.value);
                            setStatusMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[0.95rem] border px-3 py-2.5 text-left text-sm transition",
                            active
                              ? option.menuTone
                              : "border-transparent bg-white/4 text-white/72 hover:border-white/8 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                option.dotClass,
                              )}
                            />
                            <span>{option.label}</span>
                          </div>
                          {active ? <Check className="h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="mt-2 text-xl font-semibold text-[#102033]">
              Actions d'appel prioritaires
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#102033]">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  currentStatusMeta.dotClass,
                )}
              />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5",
                  currentStatusMeta.badgeLight,
                )}
              >
                {currentStatusMeta.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#607287]">
              {currentStatusMeta.description}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {renderedActions.map((action) => {
              const Icon = action.icon;
              const isManualCall = action.label === "Appel manuel";
              const isAvailabilityAction =
                action.label === "Reprendre la file" || action.label === "Pause";
              const isHangupAction = action.label === "Raccrocher";
              const isHighlighted =
                isAvailabilityAction
                  ? action.label === currentStatusMeta.emphasisAction
                  : action.label === currentStatusMeta.emphasisAction;
              const actionHint =
                isManualCall && !canUseManualCall
                  ? "Mettez-vous en pause pour passer un appel manuel"
                  : isHangupAction && canOpenQualificationFromHangup
                    ? agentStatus === "hung_up"
                      ? "Ouvrir la qualification de l'appel raccroche"
                      : "Clore l'appel puis ouvrir la qualification"
                    : action.hint;

              return (
                <button
                  key={action.label}
                  type="button"
                    disabled={action.disabled}
                    onClick={
                      isManualCall
                        ? hasIncomingCall
                          ? sipAccept
                          : canUseManualCall
                            ? handleManualCallOpen
                            : undefined
                        : isAvailabilityAction
                          ? action.label === "Reprendre la file"
                            ? resumeQueue
                            : canPauseFromCurrentState
                              ? () => setAgentStatus("paused")
                              : undefined
                          : isHangupAction
  ? canOpenQualificationFromHangup
    ? async () => {
        const {
          callSession,
          agentStatus: liveAgentStatus,
          activeCampaignId,
          qualificationPanelOpen,
          isEndingCall: liveIsEndingCall,
          endingCallId,
        } = useWorkspaceStore.getState();
        const callId = callSession.backendCallId;

        if (liveIsEndingCall && endingCallId === callId) {
          console.log(
            `[ManualHangup] click ignored if already ending callId=${callId ?? 'none'} campaignId=${activeCampaignId ?? 'none'} status=${liveAgentStatus}`,
          );
          return;
        }

        if (callId) {
          useWorkspaceStore.setState({
            isEndingCall: true,
            endingCallId: callId,
            currentCallId: callId,
          });
        }

        // Raccrocher le canal WebRTC local
        sipHangup();

        const isPredictive = callSession.direction === "predictive";
        const logPrefix = isPredictive ? "[PredictiveHangup]" : "[ManualHangup]";

        console.log(
          `${logPrefix} end start callId=${callId ?? 'none'} campaignId=${activeCampaignId ?? 'none'} status=${liveAgentStatus} direction=${callSession.direction ?? 'none'} qualificationPanelOpen=${qualificationPanelOpen}`,
        );

        if (
          liveAgentStatus === "hung_up" ||
          ((callSession.direction === "manual" || isPredictive) && callSession.active === false && callId)
        ) {
          // Le call est déjà terminé côté backend/UI → ouvrir la qualification localement
          openQualification();
          console.log(
            `${logPrefix} qualification opened source=local callId=${callId ?? 'none'} campaignId=${activeCampaignId ?? 'none'}`,
          );
          return;
        }

        if (callId) {
          try {
            const { workspaceApi } = await import("@/features/workspace/api/workspace.api");

            if (callSession.direction === "manual") {
              // Raccrocher le canal côté Asterisk via AMI (manuel uniquement)
              await workspaceApi.hangupCall(callId).catch((err) => {
                console.warn("[hangup] Asterisk hangup command failed (non-blocking):", err);
              });
            }

            // Pour le prédictif : sipHangup() ci-dessus a envoyé le BYE SIP →
            // Asterisk reçoit le raccroché → AMI envoie call.ended + OPEN_QUALIFICATION
            // On appelle aussi endCall pour marquer l'appel en DB (idempotent si AMI arrive en premier).
            await workspaceApi.endCall(callId, {});

            if (isPredictive) {
              // Prédictif : la qualification viendra via le WS call.ended (AMI flow)
              // On n'ouvre pas localement — évite le double
              console.log(
                `${logPrefix} endCall sent, waiting for call.ended WS callId=${callId} campaignId=${activeCampaignId ?? 'none'}`,
              );
            } else {
              // Manuel : ouvrir la qualification immédiatement (le WS n'est pas fiable pour tous les cas manuels)
              openQualification();
              console.log(
                `${logPrefix} qualification opened source=http callId=${callId} campaignId=${activeCampaignId ?? 'none'}`,
              );
            }
          } catch (err) {
            console.error("[hangup] endCall failed:", err);
            // Fallback : ouvrir la qualification localement
            markAgentHungUp();
            openQualification();
            console.log(
              `${logPrefix} qualification opened source=http_fallback callId=${callId} campaignId=${activeCampaignId ?? 'none'}`,
            );
          }
        } else {
          console.warn(
            `${logPrefix} skip qualification because no backend call exists callId=none campaignId=${activeCampaignId ?? 'none'} status=${liveAgentStatus}`,
          );
          // Pas de callId backend → ne pas ouvrir de qualification
          markAgentHungUp();
        }
      }
    : undefined
  : undefined
                    }
                    className={cn(
                      "min-h-[118px] rounded-[1.4rem] border px-5 py-5 text-left transition hover:-translate-y-0.5",
                      action.tone,
                      action.disabled &&
                        "cursor-not-allowed opacity-78 shadow-none hover:translate-y-0",
                      isHighlighted &&
                        cn(
                          "ring-2 ring-offset-2 ring-offset-[#f5f9fd]",
                        currentStatusMeta.actionRing,
                      ),
                  )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Icon className="h-5 w-5" />
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                          action.label === "Pause"
                            ? "bg-[#f8fbff] text-[#516579]"
                            : "bg-white/18 text-white",
                        )}
                      >
                        {isHighlighted ? "Priorite" : "Action"}
                      </span>
                    </div>
                    <p className="mt-5 text-lg font-semibold">{action.label}</p>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        action.label === "Pause"
                          ? "text-[#516579]"
                          : "text-white/78",
                      )}
                    >
                      {actionHint}
                    </p>
                  </button>
              );
            })}

            <div
              className={cn(
                "min-h-[118px] rounded-[1.4rem] border px-5 py-5 text-white shadow-[0_18px_36px_rgba(12,18,30,0.16)]",
                currentStatusMeta.panelTone,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <Clock3 className="h-5 w-5" />
                <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/88">
                  Statut
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold tabular-nums text-white">
                  {statusElapsed}
                </p>
                <div
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold",
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
            </div>
          </div>
        </div>
      </div>

      {dialPadOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(12,18,30,0.58)] px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-[#6b84a8] bg-[linear-gradient(180deg,#6e89af_0%,#587398_100%)] p-6 text-white shadow-[0_40px_100px_rgba(12,18,30,0.34)] sm:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 bg-[radial-gradient(circle,rgba(34,52,80,0.26),transparent_72%)] blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-white/62">
                  Appel manuel
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  Clavier telephonique
                </h3>
                <p className="mt-2 text-sm text-white/72">
                  Saisir un numero manuellement ou utiliser le clavier physique.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDialPad}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-white/12 text-white/88 shadow-[0_10px_24px_rgba(20,32,53,0.1)] transition hover:bg-white/18"
                aria-label="Fermer le clavier telephonique"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-6 rounded-[1.5rem] border border-white/16 bg-[rgba(255,255,255,0.1)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/66">
                Numero compose
              </p>
              <Input
                value={displayNumber}
                onChange={(event) =>
                  setManualNumber(sanitizeManualNumber(event.target.value))
                }
                onPaste={(event) => {
                  event.preventDefault();
                  const pastedText = event.clipboardData.getData("text");
                  setManualNumber((current) =>
                    sanitizeManualNumber(`${current}${pastedText}`),
                  );
                }}
                placeholder="Composer ou coller un numero"
                autoFocus
                className={cn(
                  "mt-3 h-auto rounded-[1.2rem] border-[#5f789b] bg-[#3f587a] px-4 py-4 text-white shadow-[0_10px_24px_rgba(20,32,53,0.16)] placeholder:text-white/48",
                  displayNumber
                    ? "text-2xl font-semibold tracking-[0.08em] sm:text-3xl"
                    : "text-sm font-medium tracking-normal sm:text-base",
                )}
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManualNumber((current) => current.slice(0, -1))}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/16 bg-white/12 px-4 text-sm font-medium text-white/88 transition hover:bg-white/18"
                >
                  <Delete className="h-4 w-4" />
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={() => setManualNumber("")}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/16 bg-white/12 px-4 text-sm font-medium text-white/88 transition hover:bg-white/18"
                >
                  Vider
                </button>
              </div>
            </div>

            <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
              {dialPadKeys.flat().map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => appendKey(key)}
                  className="flex min-h-[84px] flex-col items-center justify-center rounded-[1.4rem] border border-[#7892b7] bg-[linear-gradient(180deg,#6986ad_0%,#5a769b_100%)] text-center text-white shadow-[0_12px_24px_rgba(20,32,53,0.12)] transition hover:-translate-y-0.5 hover:border-[#9fb5d1] hover:bg-[linear-gradient(180deg,#7591b6_0%,#6380a3_100%)]"
                >
                  <span className="text-2xl font-semibold">{key}</span>
                  <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/62">
                    Touche
                  </span>
                </button>
              ))}
            </div>

            <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/72">
                `Backspace` efface, `Entree` lance l'appel, `Echap` ferme la fenetre.
              </p>
              <button
                type="button"
                onClick={handleCallSubmit}
                disabled={!manualNumber}
                className="inline-flex h-12 min-w-[190px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#2d6fcb_0%,#4b8ef0_100%)] px-5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(45,111,203,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Appeler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
