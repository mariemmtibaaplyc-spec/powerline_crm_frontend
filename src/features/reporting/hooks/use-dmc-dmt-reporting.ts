"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingCallsOverviewData,
  ReportingCallsPerAgentData,
  ReportingCallsPerAgentHourlyData,
  ReportingDashboardParams,
} from "@/types/reporting.types";

interface DmcDmtReportingState {
  overview: ReportingCallsOverviewData | null;
  perAgent: ReportingCallsPerAgentData | null;
  perAgentHourly: ReportingCallsPerAgentHourlyData | null;
}

export function useDmcDmtReporting() {
  const [data, setData] = useState<DmcDmtReportingState>({
    overview: null,
    perAgent: null,
    perAgentHourly: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDmcDmtReporting = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const [overview, perAgent, perAgentHourly] = await Promise.all([
          reportingApi.getCallsOverview(params),
          reportingApi.getCallsPerAgent(params),
          reportingApi.getCallsPerAgentHourly(params),
        ]);

        const nextData = { overview, perAgent, perAgentHourly };
        setData(nextData);
        return nextData;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les statistiques DMC/DMT.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    overviewData: data.overview,
    perAgentData: data.perAgent,
    perAgentHourlyData: data.perAgentHourly,
    isLoading,
    error,
    loadDmcDmtReporting,
  };
}
