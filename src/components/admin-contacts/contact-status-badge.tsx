import { cn } from "@/lib/utils";
import {
  getContactStatusLabel,
} from "@/features/admin-contacts/mocks/admin-contacts.mock";

export function ContactStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        status === "qualified"
          ? "bg-[#eefaf7] text-[#0f6a66]"
          : status === "appointment"
            ? "bg-[#edf7ff] text-[#2d6fcb]"
            : status === "callback"
              ? "bg-[#fff3e7] text-[#8a5425]"
              : status === "blacklisted"
                ? "bg-[#fff0f3] text-[#9a4a5e]"
                : status === "unreachable"
                  ? "bg-[#f2efff] text-[#6448b5]"
                  : status === "in_progress"
                    ? "bg-[#eef5fb] text-[#295086]"
                    : "bg-[#f4f7fb] text-[#607287]",
      )}
    >
      {getContactStatusLabel(status)}
    </span>
  );
}
