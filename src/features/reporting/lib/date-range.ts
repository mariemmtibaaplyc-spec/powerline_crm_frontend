import type {
  ReportingAgentsProductivityData,
  ReportingAgentPerformanceData,
  ReportingAgentsProductivityParams,
  ReportingAppointmentsPerAgentData,
  ReportingCallsOverviewData,
  ReportingCallsPerAgentData,
  ReportingPauseReportsData,
  ReportingQualificationsByAgentData,
  ReportingSessionsHistoryData,
  ReportingValue,
} from "@/types/reporting.types";
import { pickReportingValueByAliases } from "./parsers";

type ReportingDataLike =
  | ReportingAgentsProductivityData
  | ReportingAgentPerformanceData
  | ReportingAppointmentsPerAgentData
  | ReportingCallsOverviewData
  | ReportingCallsPerAgentData
  | ReportingPauseReportsData
  | ReportingQualificationsByAgentData
  | ReportingSessionsHistoryData
  | null;

export function formatReportingDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatReportingDateRange(
  period: ReportingValue | undefined,
  filters: Pick<ReportingAgentsProductivityParams, "from" | "to">,
) {
  if (filters.from && filters.to) {
    return `${formatReportingDate(filters.from)} - ${formatReportingDate(filters.to)}`;
  }

  const from = pickReportingValueByAliases(period, ["from", "start_date", "start", "date_from"]);
  const to = pickReportingValueByAliases(period, ["to", "end_date", "end", "date_to"]);

  if (typeof from === "string" && typeof to === "string") {
    return `${formatReportingDate(from)} - ${formatReportingDate(to)}`;
  }

  return "Periode courante";
}

export function extractReportingSummarySource(data: ReportingDataLike) {
  if (!data) {
    return undefined;
  }

  const summaryAliases = ["summary", "stats", "metrics", "kpis", "overview", "totals"];
  for (const alias of summaryAliases) {
    const nested = data[alias];
    if (nested !== undefined) {
      return nested;
    }
  }

  return data;
}

export function extractReportingRowsSource(data: ReportingDataLike) {
  if (!data) {
    return undefined;
  }

  const rowsAliases = ["agents", "rows", "items", "results", "list", "data"];
  for (const alias of rowsAliases) {
    const nested = data[alias];
    if (nested !== undefined) {
      return nested;
    }
  }

  return undefined;
}
