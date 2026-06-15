"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingAgentsProductivityData,
  ReportingAgentsProductivityParams,
} from "@/types/reporting.types";

export function useAgentsProductivity() {
  const [agentsProductivityData, setAgentsProductivityData] =
    useState<ReportingAgentsProductivityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgentsProductivity = useCallback(
    async (params: ReportingAgentsProductivityParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getAgentsProductivity(params);
        setAgentsProductivityData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger la productivite des agents.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    agentsProductivityData,
    isLoading,
    error,
    loadAgentsProductivity,
  };
}
