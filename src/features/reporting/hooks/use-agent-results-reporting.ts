"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingAgentPerformanceData,
  ReportingAppointmentsPerAgentData,
  ReportingDashboardParams,
} from "@/types/reporting.types";

interface AgentResultsReportingState {
  performance: ReportingAgentPerformanceData | null;
  appointments: ReportingAppointmentsPerAgentData | null;
}

export function useAgentResultsReporting() {
  const [data, setData] = useState<AgentResultsReportingState>({
    performance: null,
    appointments: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgentResultsReporting = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const [performance, appointments] = await Promise.all([
          reportingApi.getAgentsPerformance(params),
          reportingApi.getAppointmentsPerAgent(params),
        ]);

        const nextData = { performance, appointments };
        setData(nextData);
        return nextData;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les resultats des agents.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    performanceData: data.performance,
    appointmentsData: data.appointments,
    isLoading,
    error,
    loadAgentResultsReporting,
  };
}
