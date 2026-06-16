"use client";

import { useCallback, useState } from "react";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import type {
  ReportingProductionEvolutionParams,
  ReportingProductionEvolutionPoint,
} from "@/types/reporting.types";

export function useProductionEvolutionReporting() {
  const [productionEvolutionData, setProductionEvolutionData] = useState<
    ReportingProductionEvolutionPoint[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductionEvolution = useCallback(
    async (params: ReportingProductionEvolutionParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await reportingApi.getProductionEvolution(params);
        setProductionEvolutionData(data);
        return data;
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger l'evolution de la production.";

        setError(message);
        throw loadError;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    productionEvolutionData,
    isLoading,
    error,
    loadProductionEvolution,
  };
}
