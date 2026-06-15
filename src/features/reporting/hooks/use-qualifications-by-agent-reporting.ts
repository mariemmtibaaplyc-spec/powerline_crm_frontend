"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingDashboardParams,
  ReportingQualificationsByAgentData,
} from "@/types/reporting.types";

export function useQualificationsByAgentReporting() {
  const [qualificationsByAgentData, setQualificationsByAgentData] =
    useState<ReportingQualificationsByAgentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQualificationsByAgent = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getQualificationsByAgent(params);
        setQualificationsByAgentData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les qualifications par agent.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    qualificationsByAgentData,
    isLoading,
    error,
    loadQualificationsByAgent,
  };
}
