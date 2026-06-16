"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingDashboardParams,
  ReportingSessionsHistoryData,
} from "@/types/reporting.types";

export function useSessionsHistoryReporting() {
  const [sessionsHistoryData, setSessionsHistoryData] =
    useState<ReportingSessionsHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessionsHistory = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getSessionsHistory(params);
        setSessionsHistoryData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger l'historique des sessions.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
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
