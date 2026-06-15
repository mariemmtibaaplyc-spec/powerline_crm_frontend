import { cn } from "@/lib/utils";
import { getExportStatusLabel } from "@/features/admin-exports/mocks/admin-exports.mock";
import type { ExportStatus } from "@/types/export.types";

export function ExportStatusBadge({ status }: { status: ExportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "completed"
          ? "bg-[#eefaf7] text-[#0f6a66]"
          : status === "processing"
            ? "bg-[#edf7ff] text-[#2d6fcb]"
            : status === "scheduled"
              ? "bg-[#fff3e7] text-[#8a5425]"
              : "bg-[#fff0f3] text-[#9a4a5e]",
      )}
    >
      {getExportStatusLabel(status)}
    </span>
  );
}
