import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "blue" | "teal" | "amber" | "slate";

const toneStyles: Record<Tone, string> = {
  navy: "border-[#d9e2ec] bg-[#eef3f8] text-[#19314a]",
  blue: "border-[#d5e4fb] bg-[#edf4ff] text-[#24508c]",
  teal: "border-[#d5ece7] bg-[#edf8f6] text-[#116861]",
  amber: "border-[#f3dfd1] bg-[#fdf3ec] text-[#a35525]",
  slate: "border-[#e0e8f1] bg-[#f8fbfe] text-[#4d6278]",
};

interface ReportingMetricChipProps {
  label: string;
  value: ReactNode;
  tone?: Tone;
  className?: string;
  compact?: boolean;
}

export function ReportingMetricChip({
  label,
  value,
  tone = "slate",
  className,
  compact = false,
}: ReportingMetricChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border font-semibold tracking-[0.02em]",
        compact ? "gap-1 rounded-[0.5rem] px-1.5 py-[3px] text-[10px] leading-none" : "gap-1 rounded-[0.65rem] px-2 py-1 text-[11px]",
        toneStyles[tone],
        className,
      )}
    >
      <span className="uppercase opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
