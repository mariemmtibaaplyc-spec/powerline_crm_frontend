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

// Rafraîchissement temps réel demandé (mini-tâche 4) — 1 à 2s. Pas de socket
// dédié câblé sur ce module côté frontend (le gateway dashboard existe côté
// backend mais n'est pas consommé ici) : on couvre l'exigence par polling REST.
const REFRESH_INTERVAL_MS = 2000;

export function useMonitoringSnapshot() {
  const [state, setState] = useState<MonitoringSnapshotState>(initialState);

  useEffect(() => {
    let active = true;
    let isFirstLoad = true;

    async function loadMonitoringSnapshot() {
      // Ne montre le spinner qu'au tout premier chargement — les refetch
      // périodiques suivants doivent rafraîchir les données silencieusement,
      // sans faire clignoter l'UI toutes les 2 secondes.
      if (isFirstLoad) {
        setState((currentState) => ({
          ...currentState,
          isLoading: true,
          error: null,
        }));
      }

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

        // Un refetch périodique qui échoue ponctuellement (ex: coupure réseau
        // d'une seconde) ne doit pas vider un état déjà affiché avec succès —
        // seul l'échec du tout premier chargement réinitialise tout à vide.
        setState((currentState) =>
          isFirstLoad
            ? {
                snapshot: null,
                agents: [],
                liveCalls: [],
                campaigns: [],
                alerts: [],
                isLoading: false,
                error: error instanceof Error ? error.message : "Impossible de charger la supervision.",
              }
            : {
                ...currentState,
                isLoading: false,
                error: error instanceof Error ? error.message : "Impossible de charger la supervision.",
              },
        );
      } finally {
        isFirstLoad = false;
      }
    }

    void loadMonitoringSnapshot();
    const interval = setInterval(() => {
      void loadMonitoringSnapshot();
    }, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return state;
}
