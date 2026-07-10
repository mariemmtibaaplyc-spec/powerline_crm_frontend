"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import { hasValidAuthToken } from "@/lib/has-valid-auth-token";
import type {
  ReportingDashboardParams,
  ReportingPauseReportsData,
  ReportingSessionsHistoryData,
} from "@/types/reporting.types";

interface BreaksReportingState {
  pauseReports: ReportingPauseReportsData | null;
  sessionsHistory: ReportingSessionsHistoryData | null;
}

export function useBreaksReporting() {
  const [data, setData] = useState<BreaksReportingState>({
    pauseReports: null,
    sessionsHistory: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Annule toute requête en vol si le composant se démonte (ex: déconnexion
  // qui redirige immédiatement) — évite les 401 fantômes dans la console.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const loadBreaksReporting = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      // Pas de token (ex: déconnexion) → ne pas envoyer la requête du tout,
      // quelle que soit la raison du (re)déclenchement de cet appel.
      if (!hasValidAuthToken()) return undefined;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const [pauseReports, sessionsHistory] = await Promise.all([
          reportingApi.getPauseReports(params, controller.signal),
          reportingApi.getSessionsHistory(params, controller.signal),
        ]);

        const nextData = { pauseReports, sessionsHistory };
        setData(nextData);
        return nextData;
      } catch (loadError) {
        if (axios.isCancel(loadError)) return undefined;

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger le rapport des pauses.";

        setError(message);
        throw loadError;
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    },
    [],
  );

  return {
    pauseReportsData: data.pauseReports,
    sessionsHistoryData: data.sessionsHistory,
    isLoading,
    error,
    loadBreaksReporting,
  };
}
