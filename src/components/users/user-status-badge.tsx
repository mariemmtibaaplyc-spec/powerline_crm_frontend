import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/features/users/mocks/users.mock";
import type { UserStatus } from "@/types/user.types";

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "active"
          ? "bg-[#eefaf7] text-[#0f6a66]"
          : status === "inactive"
            ? "bg-[#eef5fb] text-[#295086]"
            : "bg-[#fff0f3] text-[#9a4a5e]",
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
