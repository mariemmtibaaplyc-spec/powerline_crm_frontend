"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingDashboardParams,
  ReportingQualificationStatusItem,
} from "@/types/reporting.types";

export function useQualificationsStatusReporting() {
  const [qualificationsStatusData, setQualificationsStatusData] = useState<
    ReportingQualificationStatusItem[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQualificationsStatus = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getQualificationsStatus(params);
        setQualificationsStatusData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger l'etat des qualifications.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    qualificationsStatusData,
    isLoading,
    error,
    loadQualificationsStatus,
  };
}
