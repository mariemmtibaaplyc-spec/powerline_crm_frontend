import { CheckCircle2, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExportTemplateStatusLabel } from "@/features/admin-export-templates/mocks/admin-export-templates.mock";
import type { ExportTemplateStatus } from "@/types/export-template.types";

export function ExportTemplateStatusBadge({ status }: { status: ExportTemplateStatus }) {
  const Icon = status === "active" ? CheckCircle2 : PauseCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "active"
          ? "bg-[#eefaf7] text-[#0f6a66]"
          : "bg-[#eef5fb] text-[#5f738a]",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {getExportTemplateStatusLabel(status)}
    </span>
  );
}
