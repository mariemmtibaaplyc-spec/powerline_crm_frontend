"use client";

import {
  Clock3,
  Info,
  PhoneCall,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountText } from "@/components/reporting/count-text";
import { DateRangePill } from "@/components/reporting/date-range-pill";
import { DurationText } from "@/components/reporting/duration-text";
import { KPIGrid } from "@/components/reporting/kpi-grid";
import { KPICard } from "@/components/reporting/kpi-card";
import { PercentText } from "@/components/reporting/percent-text";
import { ReportingEmptyState } from "@/components/reporting/reporting-empty-state";
import { ReportingErrorState } from "@/components/reporting/reporting-error-state";
import { ReportingFilters } from "@/components/reporting/reporting-filters-panel";
import { ReportingLoadingState } from "@/components/reporting/reporting-loading-state";
import { ReportingMetricChip } from "@/components/reporting/reporting-metric-chip";
import { ReportingMonitoringCell } from "@/components/reporting/reporting-monitoring-cell";
import { ReportingPageLayout } from "@/components/reporting/reporting-page-layout";
import { ReportingTableCard } from "@/components/reporting/reporting-table-card";
import { StatusBadge } from "@/components/reporting/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useDmcDmtReporting } from "@/features/reporting/hooks/use-dmc-dmt-reporting";
import {
  extractReportingRowsSource,
  extractReportingSummarySource,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import { REPORTING_SURFACE_CLASS } from "@/features/reporting/lib/colors";
import {
  averageReportingNumbers,
  isReportingPrimitive,
  isReportingRecord,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  type ReportingRecord,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import {
  formatReportingCompactDurationFromSeconds,
  formatReportingCount,
  formatReportingPercentage,
} from "@/features/reporting/lib/formatters";
import type {
  ReportingCallsOverviewData,
  ReportingCallsPerAgentData,
  ReportingCallsPerAgentHourlyData,
  ReportingDashboardParams,
} from "@/types/reporting.types";

interface AgentCallRow {
  id?: string;
  name?: string;
  totalCalls?: string | number | boolean | null;
  completedCalls?: string | number | boolean | null;
  averageDuration?: string | number | boolean | null;
  totalDuration?: string | number | boolean | null;
  completionRate?: string | number | boolean | null;
  statusBreakdown?: Array<{ label: string; value: number }>;
}

interface MonitoringBucket {
  key: string;
  label: string;
  available: boolean;
  averageDuration?: number | null;
  totalCalls?: number | null;
  completedCalls?: number | null;
  completionRate?: number | null;
  empty?: boolean;
}

interface MonitoringAgentRow {
  id: string;
  name: string;
  totalDuration?: number | null;
  buckets: MonitoringBucket[];
  statusBreakdown?: Array<{ label: string; value: number }>;
}

const FUTURE_HOUR_BUCKETS = ["09H", "10H", "11H", "12H", "13H", "14H", "15H", "16H", "17H"];

function formatStatusLabel(value: string) {
  return value.replace(/_/g, " ").toUpperCase();
}

function buildStatusBreakdown(record: ReportingRecord) {
  const breakdownSource =
    (isReportingRecord(record.by_status) ? record.by_status : undefined) ??
    (isReportingRecord(record.status_breakdown) ? record.status_breakdown : undefined) ??
    (isReportingRecord(record.breakdown) ? record.breakdown : undefined) ??
    (isReportingRecord(record.statuses) ? record.statuses : undefined);

  if (!breakdownSource) {
    return undefined;
  }

  const parts = Object.entries(breakdownSource)
    .map(([key, value]) => {
      const numeric = parseReportingNumericValue(isReportingPrimitive(value) ? value : null);

      if (numeric === null) {
        return null;
      }

      return {
        label: formatStatusLabel(key),
        value: numeric,
      };
    })
    .filter((part): part is { label: string; value: number } => part !== null);

  return parts.length > 0 ? parts : undefined;
}

function buildAgentRows(data: ReportingCallsPerAgentData | null) {
  const rowsSource = extractReportingRowsSource(data);

  return toReportingRecordArray(rowsSource)
    .map((record) => ({
      id: String(pickReportingValueByAliases(record, ["agent_id", "id"]) ?? ""),
      name: String(
        pickReportingValueByAliases(record, [
          "agent_name",
          "name",
          "full_name",
          "username",
          "agent",
          "agent_id",
        ]) ?? "",
      ),
      totalCalls: pickReportingValueByAliases(record, ["total_calls", "call_count", "calls"]),
      completedCalls: pickReportingValueByAliases(record, [
        "completed_calls",
        "answered_calls",
        "handled_calls",
      ]),
      averageDuration: pickReportingValueByAliases(record, [
        "avg_duration_seconds",
        "average_duration",
        "average_dmc",
      ]),
      totalDuration: pickReportingValueByAliases(record, [
        "total_duration_seconds",
        "total_duration",
      ]),
      completionRate: pickReportingValueByAliases(record, [
        "completion_rate_pct",
        "completion_rate",
        "completed_rate",
      ]),
      statusBreakdown: buildStatusBreakdown(record),
    }))
    .filter((row) => row.name || row.id || row.totalCalls !== undefined);
}

function buildOverviewKpis(
  overviewData: ReportingCallsOverviewData | null,
  rows: AgentCallRow[],
) {
  const source = extractReportingSummarySource(overviewData);

  const fallbackTotalCalls = rows.reduce(
    (sum, row) => sum + (parseReportingNumericValue(row.totalCalls) ?? 0),
    0,
  );
  const fallbackTotalDuration = rows.reduce(
    (sum, row) => sum + (parseReportingNumericValue(row.totalDuration) ?? 0),
    0,
  );
  const fallbackAvgDuration = averageReportingNumbers(
    rows.map((row) => parseReportingNumericValue(row.averageDuration)),
  );
  const fallbackMaxDuration = averageReportingNumbers(
    rows.map((row) => parseReportingNumericValue(row.totalCalls)).map((calls, index) => {
      const totalDuration = parseReportingNumericValue(rows[index]?.totalDuration);
      if (calls === null || totalDuration === null || calls <= 0) {
        return null;
      }

      return totalDuration / calls;
    }),
  );
  const fallbackCompletionRate = (() => {
    const completed = rows.reduce(
      (sum, row) => sum + (parseReportingNumericValue(row.completedCalls) ?? 0),
      0,
    );

    if (fallbackTotalCalls <= 0) {
      return null;
    }

    return completed / fallbackTotalCalls;
  })();

  return {
    totalCalls:
      pickReportingValueByAliases(source, ["total_calls", "call_count", "calls"]) ??
      fallbackTotalCalls,
    completedCalls:
      pickReportingValueByAliases(source, [
        "completed_calls",
        "answered_calls",
        "handled_calls",
      ]) ??
      rows.reduce((sum, row) => sum + (parseReportingNumericValue(row.completedCalls) ?? 0), 0),
    averageDuration:
      pickReportingValueByAliases(source, [
        "avg_duration_seconds",
        "average_duration",
        "average_dmc",
      ]) ?? fallbackAvgDuration,
    totalDuration:
      pickReportingValueByAliases(source, ["total_duration_seconds", "total_duration"]) ??
      fallbackTotalDuration,
    maxDuration:
      pickReportingValueByAliases(source, ["max_duration_seconds", "max_duration"]) ??
      fallbackMaxDuration,
    completionRate:
      pickReportingValueByAliases(source, [
        "completion_rate_pct",
        "completion_rate",
        "completed_rate",
      ]) ?? fallbackCompletionRate,
  };
}

function buildMonitoringRows(data: ReportingCallsPerAgentHourlyData | null): MonitoringAgentRow[] {
  const rowsSource = extractReportingRowsSource(data);

  return toReportingRecordArray(rowsSource)
    .map((record) => {
      const rowId = String(pickReportingValueByAliases(record, ["agent_id", "id"]) ?? "");
      const rowName = String(
        pickReportingValueByAliases(record, [
          "agent_name",
          "name",
          "full_name",
          "username",
          "agent",
          "agent_id",
        ]) ?? "",
      );

      const totalsSource = isReportingRecord(record.totals) ? record.totals : undefined;
      const hourlyRows = Array.isArray(record.hours)
        ? record.hours.filter(isReportingRecord)
        : [];
      const hourlyMap = new Map(
        hourlyRows.map((hourRecord) => {
          const hourLabel = String(
            pickReportingValueByAliases(hourRecord, ["hour_label", "label"]) ?? "",
          );

          const bucket: MonitoringBucket = {
            key: String(pickReportingValueByAliases(hourRecord, ["hour_key", "key"]) ?? hourLabel),
            label: hourLabel || `${pickReportingValueByAliases(hourRecord, ["hour_key", "key"]) ?? ""}H`,
            available: true,
            averageDuration: parseReportingNumericValue(
              pickReportingValueByAliases(hourRecord, ["avg_dmc_seconds", "average_duration"]),
            ),
            totalCalls: parseReportingNumericValue(
              pickReportingValueByAliases(hourRecord, ["total_calls", "call_count", "calls"]),
            ),
            completedCalls: parseReportingNumericValue(
              pickReportingValueByAliases(hourRecord, [
                "completed_calls",
                "answered_calls",
                "handled_calls",
              ]),
            ),
            completionRate: parseReportingNumericValue(
              pickReportingValueByAliases(hourRecord, [
                "completion_rate_pct",
                "completion_rate",
                "completed_rate",
              ]),
            ),
            empty: false,
          };

          return [bucket.label, bucket] as const;
        }),
      );

      const summaryBucket: MonitoringBucket = {
        key: "period",
        label: "Periode",
        available: true,
        averageDuration: parseReportingNumericValue(
          pickReportingValueByAliases(totalsSource, ["avg_dmc_seconds", "average_duration", "average_dmc"]),
        ),
        totalCalls: parseReportingNumericValue(
          pickReportingValueByAliases(totalsSource, ["total_calls", "call_count", "calls"]),
        ),
        completedCalls: parseReportingNumericValue(
          pickReportingValueByAliases(totalsSource, [
            "completed_calls",
            "answered_calls",
            "handled_calls",
          ]),
        ),
        completionRate: parseReportingNumericValue(
          pickReportingValueByAliases(totalsSource, [
            "completion_rate_pct",
            "completion_rate",
            "completed_rate",
          ]),
        ),
        empty: false,
      };

      return {
        id: rowId || rowName || "agent",
        name: rowName || rowId || "Agent",
        totalDuration: parseReportingNumericValue(
          pickReportingValueByAliases(totalsSource, ["total_duration_seconds", "total_duration"]),
        ),
        statusBreakdown: totalsSource ? buildStatusBreakdown(totalsSource) : undefined,
        buckets: [
          summaryBucket,
          ...FUTURE_HOUR_BUCKETS.map((label) => {
            const existing = hourlyMap.get(label);
            if (existing) {
              return existing;
            }

            return {
              key: label.replace("H", ""),
              label,
              available: false,
              empty: true,
            } satisfies MonitoringBucket;
          }),
        ],
      };
    })
    .filter((row) => row.name || row.id);
}

function renderBucketBadges(bucket: MonitoringBucket) {
  if (!bucket.available) {
    return <span className="text-[10px] font-medium text-[#a1afbd]">—</span>;
  }

  const hasCompletionRate =
    bucket.completionRate !== null && bucket.completionRate !== undefined;
  const completionRateValue: number | null = hasCompletionRate
    ? (bucket.completionRate ?? 0)
    : null;

  return (
    <>
      <ReportingMetricChip
        label="DMC"
        tone="teal"
        compact
        value={
          bucket.averageDuration === null || bucket.averageDuration === undefined
            ? "—"
            : formatReportingCompactDurationFromSeconds(bucket.averageDuration)
        }
      />
      <ReportingMetricChip
        label="Appels"
        tone="navy"
        compact
        value={
          bucket.totalCalls === null || bucket.totalCalls === undefined
            ? "—"
            : formatReportingCount(bucket.totalCalls)
        }
      />
      <ReportingMetricChip
        label="OK"
        tone="blue"
        compact
        value={
          bucket.completedCalls === null || bucket.completedCalls === undefined
            ? "—"
            : formatReportingCount(bucket.completedCalls)
        }
      />
      {hasCompletionRate ? (
        <ReportingMetricChip
          label="Tx"
          tone="slate"
          compact
          value={formatReportingPercentage(completionRateValue!)}
        />
      ) : null}
    </>
  );
}

export default function Page() {
  const {
    overviewData,
    perAgentData,
    perAgentHourlyData,
    isLoading,
    error,
    loadDmcDmtReporting,
  } =
    useDmcDmtReporting();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
  });

  useEffect(() => {
    void loadDmcDmtReporting().catch(() => undefined);
  }, [loadDmcDmtReporting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadDmcDmtReporting(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters = { from: "", to: "" };
    setFilters(nextFilters);

    try {
      await loadDmcDmtReporting();
    } catch {
      return;
    }
  }

  const rows = useMemo(() => buildAgentRows(perAgentData), [perAgentData]);
  const kpis = useMemo(() => buildOverviewKpis(overviewData, rows), [overviewData, rows]);
  const monitoringRows = useMemo(
    () => buildMonitoringRows(perAgentHourlyData),
    [perAgentHourlyData],
  );
  const dateRangeLabel = useMemo(
    () => formatReportingDateRange(overviewData?.period, filters),
    [overviewData, filters],
  );
  const maxDurationValue = useMemo(
    () => parseReportingNumericValue(kpis.maxDuration),
    [kpis.maxDuration],
  );

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Statistiques DMC/DMT"
      description="Vue de supervision dense pour suivre les agents, leurs DMC et leurs volumes sur la periode selectionnee."
      actions={<DateRangePill value={dateRangeLabel} />}
    >
      <ReportingFilters
        compact
        className="shadow-[0_12px_26px_rgba(20,32,53,0.05)]"
        description="Recharge des statistiques d'appels sur la plage de dates souhaitee."
        from={filters.from ?? ""}
        to={filters.to ?? ""}
        isLoading={isLoading}
        onFromChange={(value) =>
          setFilters((current) => ({
            ...current,
            from: value,
          }))
        }
        onToChange={(value) =>
          setFilters((current) => ({
            ...current,
            to: value,
          }))
        }
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      {error ? <ReportingErrorState message={error} /> : null}

      {isLoading && !overviewData && !perAgentData && !perAgentHourlyData ? (
        <ReportingLoadingState message="Chargement des statistiques DMC/DMT..." />
      ) : null}

      {overviewData || perAgentData || perAgentHourlyData ? (
        <>
          <KPIGrid className="gap-3 xl:grid-cols-5">
            <KPICard
              density="compact"
              label="Total appels"
              value={<CountText value={kpis.totalCalls} />}
              caption="Volume d'appels sur la periode."
              icon={<PhoneCall className="h-4 w-4" />}
              tone="navy"
            />
            <KPICard
              density="compact"
              label="Appels completes"
              value={<CountText value={kpis.completedCalls} />}
              caption="Appels finalises et repondus."
              icon={<TrendingUp className="h-4 w-4" />}
              tone="blue"
            />
            <KPICard
              density="compact"
              label="DMC moyenne"
              value={<DurationText value={kpis.averageDuration} />}
              caption="Duree moyenne de communication."
              icon={<Timer className="h-4 w-4" />}
              tone="blue"
            />
            <KPICard
              density="compact"
              label="Duree totale"
              value={<DurationText value={kpis.totalDuration} />}
              caption="Somme des durees completes."
              icon={<Clock3 className="h-4 w-4" />}
              tone="teal"
            />
            <KPICard
              density="compact"
              label="Taux completion"
              value={<PercentText value={kpis.completionRate} />}
              caption="Part d'appels completes."
              icon={<TrendingUp className="h-4 w-4" />}
              tone="amber"
            />
          </KPIGrid>

          <Card className={`${REPORTING_SURFACE_CLASS} bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbfe_100%)]`}>
            <CardContent className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-[#eef5ff] text-[#295086]">
                  <Info className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-[#102033]">
                    {perAgentHourlyData
                      ? "Grille horaire active sur les appels reels"
                      : "Structure horaire prete, donnees horaires en attente"}
                  </p>
                  <p className="text-[12px] leading-5 text-[#607287]">
                    {perAgentHourlyData
                      ? `La colonne "Periode consolidee" reste basee sur les totaux backend, et les colonnes 09H-17H affichent les heures reelles lorsqu'elles existent.`
                      : `La colonne "Periode consolidee" affiche les vraies donnees backend. Les colonnes 09H-17H sont deja preparees pour un futur endpoint horaire, sans chiffres fictifs.`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ReportingMetricChip
                  label="Max"
                  tone="amber"
                  compact
                  value={
                    maxDurationValue === null ? "—" : (
                      formatReportingCompactDurationFromSeconds(maxDurationValue)
                    )
                  }
                />
                <ReportingMetricChip label="Plage" tone="slate" compact value={dateRangeLabel} />
              </div>
            </CardContent>
          </Card>

          <ReportingTableCard
            title="Monitoring agents"
            description="Lecture dense des agents avec structure de matrice horaire operationnelle."
            className="overflow-hidden"
            contentClassName="px-0 pb-0"
          >
            {monitoringRows.length > 0 ? (
              <TableWrapper className="rounded-none border-x-0 border-b-0 border-t border-[#e8eef5] bg-[linear-gradient(180deg,#fcfdff_0%,#f8fbfe_100%)] shadow-none">
                <div className="overflow-x-auto scroll-smooth">
                  <Table className="min-w-[1620px] text-[12px]">
                    <thead>
                      <tr className="bg-[#f6fafe]">
                        <TableHeadCell className="sticky left-0 z-20 min-w-[190px] bg-[#f6fafe] px-4 py-2 text-[#5f7489]">
                          Agent
                        </TableHeadCell>
                        <TableHeadCell className="min-w-[176px] px-2 py-2 text-center text-[#5f7489]">
                          Periode consolidee
                        </TableHeadCell>
                        {FUTURE_HOUR_BUCKETS.map((hour) => (
                          <TableHeadCell
                            key={hour}
                            className="min-w-[108px] px-2 py-2 text-center text-[#526780]"
                          >
                            {hour}
                          </TableHeadCell>
                        ))}
                        <TableHeadCell className="min-w-[148px] px-2 py-2 text-center text-[#5f7489]">
                          Total periode
                        </TableHeadCell>
                        <TableHeadCell className="min-w-[210px] px-3 py-2 text-[#5f7489]">
                          Statuts
                        </TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {monitoringRows.map((row, index) => (
                        <tr
                          key={`${row.id}-${index}`}
                          className="transition-colors duration-150 hover:bg-[#f8fbfe]"
                        >
                          <TableCell className="sticky left-0 z-10 border-b border-[#edf2f7] bg-white px-4 py-2 align-top">
                            <div className="space-y-0.5">
                              <p className="text-[13px] font-semibold text-[#102033]">
                                {row.name || row.id || <span className="text-[#7b8da0]">—</span>}
                              </p>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-[#7d91a5]">
                                Supervision agent
                              </p>
                            </div>
                          </TableCell>

                          {row.buckets.map((bucket) => (
                            <TableCell
                              key={`${row.id}-${bucket.key}`}
                              className="border-b border-[#edf2f7] px-1.5 py-1.5 align-top"
                            >
                              <ReportingMonitoringCell
                                title={bucket.key === "period" ? "Periode" : bucket.label}
                                subtitle={undefined}
                                unavailable={!bucket.available}
                                compact
                                subtle={bucket.available}
                                centered={bucket.key !== "period"}
                                className={
                                  bucket.available
                                    ? "min-h-[50px]"
                                    : "min-h-[50px] border-transparent bg-transparent opacity-70"
                                }
                                badges={renderBucketBadges(bucket)}
                              />
                            </TableCell>
                          ))}

                          <TableCell className="border-b border-[#edf2f7] px-1.5 py-1.5 align-top">
                            <ReportingMonitoringCell
                              title="Total periode"
                              subtitle="Duree et production"
                              compact
                              badges={
                                <>
                                  <ReportingMetricChip
                                    label="Duree"
                                    tone="teal"
                                    compact
                                    value={
                                      row.totalDuration === null || row.totalDuration === undefined
                                        ? "—"
                                        : formatReportingCompactDurationFromSeconds(row.totalDuration)
                                    }
                                  />
                                  <ReportingMetricChip
                                    label="Comp"
                                    tone="blue"
                                    compact
                                    value={
                                      row.buckets[0]?.completedCalls === null ||
                                      row.buckets[0]?.completedCalls === undefined
                                        ? "—"
                                        : formatReportingCount(row.buckets[0].completedCalls)
                                    }
                                  />
                                </>
                              }
                              className="min-h-[50px]"
                            />
                          </TableCell>

                          <TableCell className="border-b border-[#edf2f7] px-3 py-1.5 align-top">
                            {row.statusBreakdown && row.statusBreakdown.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {row.statusBreakdown.map((status) => (
                                  <StatusBadge
                                    key={`${row.id}-${status.label}`}
                                    value={status.label}
                                    suffix={formatReportingCount(status.value)}
                                    compact
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-[#7b8da0]">—</span>
                            )}
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </TableWrapper>
            ) : (
              <div className="px-6 pb-6">
                <ReportingEmptyState message="Aucune statistique d'appel par agent sur cette periode." />
              </div>
            )}
          </ReportingTableCard>
        </>
      ) : null}
    </ReportingPageLayout>
  );
}
