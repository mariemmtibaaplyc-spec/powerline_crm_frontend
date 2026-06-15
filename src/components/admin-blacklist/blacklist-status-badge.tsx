import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlacklistStatus } from "@/types/blacklist.types";

export function BlacklistStatusBadge({ status }: { status: BlacklistStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "active"
          ? "bg-[#fff0f3] text-[#b54f67]"
          : "bg-[#eff8f3] text-[#16735f]",
      )}
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      {status === "active" ? "Blackliste" : "Non blackliste"}
    </span>
  );
}
