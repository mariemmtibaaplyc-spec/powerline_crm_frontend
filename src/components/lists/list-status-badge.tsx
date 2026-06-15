import { cn } from "@/lib/utils";
import { getListStatusLabel } from "@/features/lists/mocks/lists.mock";
import type { ListStatus } from "@/types/list.types";

export function ListStatusBadge({ status }: { status: ListStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "ready"
          ? "bg-[#eefaf7] text-[#0f6a66]"
          : status === "importing"
            ? "bg-[#fff3e7] text-[#8a5425]"
            : status === "review"
              ? "bg-[#eef5fb] text-[#295086]"
              : status === "attached"
                ? "bg-[#edf7ff] text-[#2d6fcb]"
                : "bg-[#fff0f3] text-[#9a4a5e]",
      )}
    >
      {getListStatusLabel(status)}
    </span>
  );
}
