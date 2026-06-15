import { cn } from "@/lib/utils";
import type { SalesAppointmentStatus } from "@/types/appointment.types";

const STATUS_STYLES: Record<
  SalesAppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Planifie",
    className: "border-[#dce7f8] bg-[#eef5ff] text-[#295086]",
  },
  confirmed: {
    label: "Confirme",
    className: "border-[#d3efe3] bg-[#effbf5] text-[#15795d]",
  },
  pending: {
    label: "En attente",
    className: "border-[#f5dfb7] bg-[#fff7e8] text-[#a76b18]",
  },
  cancelled: {
    label: "Annule",
    className: "border-[#f2cbd5] bg-[#fff1f5] text-[#c04f6d]",
  },
};

export function SalesStatusBadge({
  status,
  className,
}: {
  status: SalesAppointmentStatus;
  className?: string;
}) {
  const meta = STATUS_STYLES[status];

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
