"use client";

import { useEffect, useState } from "react";

export function useClientClock(enabled = true, intervalMs = 1000) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setNow(0);
      return;
    }

    const tick = () => setNow(Date.now());

    tick();

    const interval = window.setInterval(tick, intervalMs);

    return () => window.clearInterval(interval);
  }, [enabled, intervalMs]);

  return now;
}
