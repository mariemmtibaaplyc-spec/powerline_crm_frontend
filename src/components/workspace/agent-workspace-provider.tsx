"use client";

import type { ReactNode } from "react";
import {
  AGENT_STATUS_OPTIONS,
  getAgentStatusMeta,
  MOCK_AGENT_IDENTITY,
  PAUSE_OPTIONS,
} from "@/features/workspace/mocks/agent.mock";
import { DEFAULT_AGENT_PROSPECT } from "@/features/workspace/mocks/prospects.mock";
import { useWorkspace } from "@/features/workspace/hooks/use-workspace";
import type {
  AgentStatus,
  AgentStatusMeta,
  HistoryEntry,
  PauseType,
  ProspectSheet,
  QualificationCode,
  Reminder,
} from "@/types/workspace.types";
import { useWorkspaceSocket } from "@/features/workspace/hooks/use-workspace-socket";
import { useSessionStore } from "@/store/session.store";
import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "@/features/workspace/store/workspace.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authApi } from "@/features/auth/api/auth.api";
import { SipPhoneProvider, useSipPhone } from "@/features/workspace/sip/sip-phone.provider";


// Connecteur WS avec SIP (agents avec sipExtension)
function WorkspaceSocketConnectorWithSip({ children }: { children: ReactNode }) {
  const { triggerAutoAnswer } = useSipPhone();
  useWorkspaceSocket(triggerAutoAnswer);
  return <>{children}</>;
}

// Connecteur WS sans SIP (admin/superviseur sans extension)
function WorkspaceSocketConnectorNoSip({ children }: { children: ReactNode }) {
  useWorkspaceSocket(undefined);
  return <>{children}</>;
}

export type AgentProspect = ProspectSheet;
export type {
  AgentStatus,
  AgentStatusMeta,
  HistoryEntry,
  PauseType,
  QualificationCode,
  Reminder,
  ProspectSheet,
};

export {
  AGENT_STATUS_OPTIONS,
  DEFAULT_AGENT_PROSPECT,
  MOCK_AGENT_IDENTITY,
  PAUSE_OPTIONS,
};

export function formatAgentElapsedTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function AgentWorkspaceProvider({ children }: { children: ReactNode }) {
  const session     = useSessionStore((s) => s.session);
  const authSession = useAuthStore((s) => s.session);

  // SipPhoneProvider est monté uniquement si l'utilisateur a une extension SIP.
  // Admin et superviseur sans sipExtension ne déclenchent pas /webrtc-credentials.
  const effectiveUser = session?.user ?? authSession?.user;
  const hasSipExtension = Boolean(effectiveUser?.sip_extension);
  const setSession  = useSessionStore((s) => s.setSession);
  const setAuthSession = useAuthStore((s) => s.setSession);
  const initFromSession    = useWorkspaceStore((s) => s.initFromSession);
  const fetchDailyStats    = useWorkspaceStore((s) => s.fetchDailyStats);
  const initializedUserIdRef = useRef<number | null>(null);

  // Identifiant effectif : sessionStore en priorité, puis authStore (après refresh)
  const effectiveUserId =
    (session?.user?.numericId  ?? 0) > 0 ? session?.user?.numericId  :
    (authSession?.user?.numericId ?? 0) > 0 ? authSession?.user?.numericId :
    null;

  // Fix refresh : authStore survit grâce à persist(localStorage),
  // sessionStore est vide → on le resynchronise immédiatement
  useEffect(() => {
    if (!session && authSession) {
      setSession(authSession);
    }
  }, [authSession?.user?.numericId]);

  // Récupération d'urgence : si numericId=0 dans le cache localStorage
  // (bug de session passée), on rappelle getMe() pour recalculer l'ID
  // sans forcer l'agent à se reconnecter.
  useEffect(() => {
    if (effectiveUserId) return;                     // déjà OK
    const token = authSession?.accessToken ?? session?.accessToken;
    if (!token) return;                              // pas connecté

    authApi.getMe().then((meData) => {
      if (!meData.numericId || meData.numericId === 0) {
        console.error("[AgentWorkspaceProvider] getMe() returned numericId=0 — vérifier /auth/me");
        return;
      }

      const base = authSession ?? session;
      if (!base) return;

      const refreshed = {
        ...base,
        user: { ...base.user, ...meData },
      };
      setAuthSession(refreshed);
      setSession(refreshed);
    }).catch((err) => {
      console.error("[AgentWorkspaceProvider] getMe() recovery failed:", err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Une seule fois au montage

  // Appelle initFromSession dès qu'on dispose d'un userId valide
  // (que ce soit via sessionStore normal ou via authStore après refresh)
  useEffect(() => {
    const user = session?.user ?? authSession?.user;
    const numericId = user?.numericId ?? 0;
    if (numericId <= 0) return;  // guard : 0 = non résolu
    if (initializedUserIdRef.current === numericId) return;
    initializedUserIdRef.current = numericId;
    initFromSession({
      userId:       numericId,
      sipExtension: user!.sip_extension ?? null,
      firstName:    user!.firstName,
      lastName:     user!.lastName,
      role:         user!.role ?? null,
      activeCampaignId: user?.activeCampaignId ?? null,
      activeCampaignName: user?.activeCampaignName ?? null,
    }).catch(console.error);

    // Poll daily-stats toutes les 5 minutes depuis le provider (toujours monté),
    // indépendamment de la page visitée. Alimente dailyStatsCache → sidebar + footer.
    fetchDailyStats();
    const statsInterval = window.setInterval(fetchDailyStats, 300_000);
    return () => window.clearInterval(statsInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  if (hasSipExtension) {
    return (
      <SipPhoneProvider>
        <WorkspaceSocketConnectorWithSip>
          {children}
        </WorkspaceSocketConnectorWithSip>
      </SipPhoneProvider>
    );
  }

  return (
    <WorkspaceSocketConnectorNoSip>
      {children}
    </WorkspaceSocketConnectorNoSip>
  );
}

export function useAgentWorkspaceState() {
  const state = useWorkspace();
  const currentStatusMeta = getAgentStatusMeta(state.agentStatus);
  const selectedPauseType =
    PAUSE_OPTIONS.find((option) => option.code === state.selectedPauseTypeCode) ??
    PAUSE_OPTIONS[0];

  return {
    ...state,
    currentStatusMeta: currentStatusMeta as AgentStatusMeta,
    isPaused: state.agentStatus === "paused",
    isCallActive: state.callSession.active,
    currentNumber: state.callSession.currentNumber,
    activeReminderId: state.callSession.activeReminderId,
    selectedPauseType,
    pauseOptions: PAUSE_OPTIONS,
    agentIdentity: state.agentIdentity ?? MOCK_AGENT_IDENTITY,
    backendQualifications: state.backendQualifications,
    selectedQualificationId: state.selectedQualificationId,
    selectBackendQualification: state.selectBackendQualification,
    appointmentError: state.appointmentError,
    dismissAppointmentError: state.dismissAppointmentError,
    fetchAppointments: state.fetchAppointments,
    fetchDailyStats: state.fetchDailyStats,
    dailyStatsCache: state.dailyStatsCache,
    pauseAgent: () => state.setAgentStatus("paused" as AgentStatus),
    resumeAgent: state.resumeQueue,
    startReminderCall: state.openReminderCall,
  };
}
