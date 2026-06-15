"use client";

import type { ReactNode } from "react";
import {
  AGENT_STATUS_OPTIONS,
  getAgentStatusMeta,
  MOCK_AGENT_IDENTITY,
  PAUSE_OPTIONS,
} from "@/features/workspace/mocks/agent.mock";
import { DEFAULT_AGENT_PROSPECT } from "@/features/workspace/mocks/prospects.mock";
import { QUALIFICATION_GROUPS } from "@/features/workspace/mocks/qualifications.mock";
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
  QUALIFICATION_GROUPS,
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

export function AgentWorkspaceProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
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
    qualificationGroups: QUALIFICATION_GROUPS,
    agentIdentity: state.agentIdentity ?? MOCK_AGENT_IDENTITY,
    pauseAgent: () => state.setAgentStatus("paused" as AgentStatus),
    resumeAgent: state.resumeQueue,
    startReminderCall: state.openReminderCall,
  };
}
