"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingContactReachabilityData,
  ReportingDashboardParams,
} from "@/types/reporting.types";

export function useContactReachabilityReporting() {
  const [contactReachabilityData, setContactReachabilityData] =
    useState<ReportingContactReachabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContactReachability = useCallback(
    async (params: ReportingDashboardParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getContactReachability(params);
        setContactReachabilityData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger la joignabilite des contacts.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    contactReachabilityData,
    isLoading,
    error,
    loadContactReachability,
  };
}
