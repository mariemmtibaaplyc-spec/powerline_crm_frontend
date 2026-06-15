import type { ReactNode } from "react";
import { getReportingStatusTone } from "@/features/reporting/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  value,
  suffix,
  compact = false,
  className,
}: {
  value?: string;
  suffix?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  if (!value) {
    return <span className="text-sm text-[#7b8da0]">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        compact ? "gap-1 px-2 py-0.5 text-[11px]" : "gap-1.5 px-2.5 py-1 text-xs",
        getReportingStatusTone(value),
        className,
      )}
    >
      {value}
      {suffix ? <span className="opacity-90">{suffix}</span> : null}
    </span>
  );
}
