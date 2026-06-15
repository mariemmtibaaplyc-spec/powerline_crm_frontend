"use client";

import { useMemo } from "react";
import { MOCK_RECORDINGS, RECORDING_STATUS_OPTIONS } from "@/features/recordings/mocks/recordings.mock";

export function useRecordings() {
  const recordings = useMemo(() => {
    return [...MOCK_RECORDINGS].sort((left, right) => {
      const leftKey = `${left.date}T${left.time}:00`;
      const rightKey = `${right.date}T${right.time}:00`;
      return rightKey.localeCompare(leftKey);
    });
  }, []);

  return {
    recordings,
    statusOptions: RECORDING_STATUS_OPTIONS,
  };
}
