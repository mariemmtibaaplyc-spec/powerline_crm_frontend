import { cn } from "@/lib/utils";
import type { RecordingStatus } from "@/types/recording.types";

const STATUS_META: Record<RecordingStatus, { label: string; className: string }> = {
  available: {
    label: "Disponible",
    className: "border-[#d3efe3] bg-[#effbf5] text-[#15795d]",
  },
  review: {
    label: "A revoir",
    className: "border-[#f5dfb7] bg-[#fff7e8] text-[#a76b18]",
  },
  flagged: {
    label: "Signale",
    className: "border-[#f2cbd5] bg-[#fff1f5] text-[#c04f6d]",
  },
  archived: {
    label: "Archive",
    className: "border-[#dce6f0] bg-[#f5f8fc] text-[#607287]",
  },
};

export function RecordingStatusBadge({
  status,
  className,
}: {
  status: RecordingStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
