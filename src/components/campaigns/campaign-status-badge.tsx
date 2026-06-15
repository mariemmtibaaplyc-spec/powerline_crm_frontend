import { cn } from "@/lib/utils";
import { getCampaignStatusLabel } from "@/features/campaigns/mocks/campaigns.mock";
import type { CampaignStatus } from "@/types/campaign.types";

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "active"
          ? "bg-[#eefaf7] text-[#0f6a66]"
          : status === "paused"
            ? "bg-[#fff3e7] text-[#8a5425]"
            : status === "inactive"
              ? "bg-[#eef5fb] text-[#295086]"
              : "bg-[#fff0f3] text-[#9a4a5e]",
      )}
    >
      {getCampaignStatusLabel(status)}
    </span>
  );
}
