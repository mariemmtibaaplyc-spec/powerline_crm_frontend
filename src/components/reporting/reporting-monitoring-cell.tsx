import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReportingMonitoringCellProps {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  unavailable?: boolean;
  className?: string;
  compact?: boolean;
  subtle?: boolean;
  centered?: boolean;
}

export function ReportingMonitoringCell({
  title,
  subtitle,
  badges,
  unavailable = false,
  className,
  compact = false,
  subtle = false,
  centered = false,
}: ReportingMonitoringCellProps) {
  return (
    <div
      className={cn(
        "min-w-[126px] transition-colors",
        compact ? "rounded-[0.8rem] px-1.5 py-1" : "rounded-[1rem] px-3 py-2",
        unavailable
          ? "border border-dashed border-[#e6edf5] bg-[#fbfdff] text-[#9aa9b8]"
          : subtle
            ? "border border-transparent bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbff_100%)] text-[#102033] shadow-none"
            : "border border-[#e2e9f1] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] text-[#102033] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
        className,
      )}
    >
      <div className={cn(compact ? "space-y-0.5" : "space-y-1", centered ? "text-center" : undefined)}>
        <div className={cn("flex items-start justify-between gap-2", centered ? "justify-center" : undefined)}>
          <p
            className={cn(
              "font-semibold uppercase tracking-[0.14em] text-[#75899d]",
              compact ? "text-[9px]" : "text-[11px]",
            )}
          >
            {title}
          </p>
        </div>
        {subtitle ? <p className={cn("text-[#71859a]", compact ? "text-[10px]" : "text-[11px]")}>{subtitle}</p> : null}
        {badges ? (
          <div
            className={cn(
              "flex flex-wrap",
              compact ? "gap-1" : "gap-1.5",
              centered ? "justify-center" : undefined,
            )}
          >
            {badges}
          </div>
        ) : null}
      </div>
    </div>
  );
}
