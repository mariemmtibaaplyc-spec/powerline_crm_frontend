import { formatReportingDurationFromSeconds } from "@/features/reporting/lib/formatters";
import { parseReportingNumericValue } from "@/features/reporting/lib/parsers";
import type { ReportingPrimitive } from "@/types/reporting.types";

export function DurationText({
  value,
}: {
  value: ReportingPrimitive | number | null | undefined;
}) {
  const numeric = typeof value === "number" ? value : parseReportingNumericValue(value);
  return <>{numeric === null ? "—" : formatReportingDurationFromSeconds(numeric)}</>;
}
