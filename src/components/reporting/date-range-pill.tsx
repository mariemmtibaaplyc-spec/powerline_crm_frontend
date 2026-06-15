import { CalendarRange } from "lucide-react";
import { REPORTING_HEADER_PILL_CLASS } from "@/features/reporting/lib/colors";

export function DateRangePill({ value }: { value: string }) {
  return (
    <span className={REPORTING_HEADER_PILL_CLASS}>
      <CalendarRange className="h-4 w-4" />
      {value}
    </span>
  );
}
