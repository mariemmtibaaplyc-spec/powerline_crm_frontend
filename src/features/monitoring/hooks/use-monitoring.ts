"use client";

import { useEffect, useState } from "react";
import {
  monitoringApi,
  type SupervisionAgentStatusRow,
  type SupervisionAlert,
  type SupervisionCampaignLiveStat,
  type SupervisionLiveCall,
  type SupervisionLiveSnapshot,
} from "@/features/monitoring/api/monitoring.api";

export interface MonitoringSnapshotState {
  snapshot: SupervisionLiveSnapshot | null;
  agents: SupervisionAgentStatusRow[];
  liveCalls: SupervisionLiveCall[];
  campaigns: SupervisionCampaignLiveStat[];
  alerts: SupervisionAlert[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MonitoringSnapshotState = {
  snapshot: null,
  agents: [],
  liveCalls: [],
  campaigns: [],
  alerts: [],
  isLoading: true,
  error: null,
};

export function useMonitoringSnapshot() {
  const [state, setState] = useState<MonitoringSnapshotState>(initialState);

  useEffect(() => {
    let active = true;

    async function loadMonitoringSnapshot() {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        error: null,
      }));

      try {
        const [snapshot, agents, liveCalls, campaigns, alerts] = await Promise.all([
          monitoringApi.getSupervisionLive(),
          monitoringApi.getSupervisionAgentsStatus(),
          monitoringApi.getSupervisionLiveCalls(),
          monitoringApi.getSupervisionCampaignsLive(),
          monitoringApi.getSupervisionAlerts(),
        ]);

        if (!active) {
          return;
        }

        setState({
          snapshot,
          agents,
          liveCalls,
          campaigns,
          alerts,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          snapshot: null,
          agents: [],
          liveCalls: [],
          campaigns: [],
          alerts: [],
          isLoading: false,
          error: error instanceof Error ? error.message : "Impossible de charger la supervision.",
        });
      }
    }

    void loadMonitoringSnapshot();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
