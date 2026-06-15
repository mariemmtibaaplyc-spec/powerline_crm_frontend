"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
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

  const loadBreaksReporting = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const [pauseReports, sessionsHistory] = await Promise.all([
          reportingApi.getPauseReports(params),
          reportingApi.getSessionsHistory(params),
        ]);

        const nextData = { pauseReports, sessionsHistory };
        setData(nextData);
        return nextData;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger le rapport des pauses.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
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
