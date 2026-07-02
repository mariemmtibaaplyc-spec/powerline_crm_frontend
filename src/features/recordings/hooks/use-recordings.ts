"use client";

import { useCallback, useEffect, useState } from "react";
import { RECORDING_STATUS_OPTIONS, recordingsApi } from "@/features/recordings/api/recordings.api";
import type { RecordingRecord } from "@/types/recording.types";

export function useRecordings() {
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecordings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextRecordings = await recordingsApi.getRecordings();
      setRecordings(nextRecordings);
    } catch (loadError) {
      setRecordings([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les enregistrements.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecordings();
  }, [loadRecordings]);

  return {
    recordings,
    statusOptions: RECORDING_STATUS_OPTIONS,
    isLoading,
    error,
    reload: loadRecordings,
  };
}
