"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingDashboardData,
  ReportingDashboardParams,
} from "@/types/reporting.types";

export function useReporting() {
  const [dashboardData, setDashboardData] =
    useState<ReportingDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getReportingDashboard(params);
        setDashboardData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger le dashboard reporting.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    dashboardData,
    isLoading,
    error,
    loadDashboard,
  };
}
