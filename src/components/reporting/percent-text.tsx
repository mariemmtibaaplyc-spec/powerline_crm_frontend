import { formatReportingPercentage } from "@/features/reporting/lib/formatters";
import { parseReportingNumericValue } from "@/features/reporting/lib/parsers";
import type { ReportingPrimitive } from "@/types/reporting.types";

export function PercentText({
  value,
}: {
  value: ReportingPrimitive | number | null | undefined;
}) {
  const numeric = typeof value === "number" ? value : parseReportingNumericValue(value);
  return <>{numeric === null ? "—" : formatReportingPercentage(numeric)}</>;
}
