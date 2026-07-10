"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import { hasValidAuthToken } from "@/lib/has-valid-auth-token";
import type {
  ReportingDashboardParams,
  ReportingSessionsHistoryData,
} from "@/types/reporting.types";

export function useSessionsHistoryReporting() {
  const [sessionsHistoryData, setSessionsHistoryData] =
    useState<ReportingSessionsHistoryData | null>(null);
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

  const loadSessionsHistory = useCallback(
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
        const data = await reportingApi.getSessionsHistory(params, controller.signal);
        setSessionsHistoryData(data);
        return data;
      } catch (loadError) {
        if (axios.isCancel(loadError)) return undefined;

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger l'historique des sessions.";

        setError(message);
        throw loadError;
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    },
    [],
  );

  return {
    sessionsHistoryData,
    isLoading,
    error,
    loadSessionsHistory,
  };
}
