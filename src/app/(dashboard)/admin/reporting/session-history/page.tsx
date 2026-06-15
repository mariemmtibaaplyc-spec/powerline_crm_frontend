"use client";

import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountText } from "@/components/reporting/count-text";
import { DateRangePill } from "@/components/reporting/date-range-pill";
import { DurationText } from "@/components/reporting/duration-text";
import { KPIGrid } from "@/components/reporting/kpi-grid";
import { KPICard } from "@/components/reporting/kpi-card";
import { ReportingEmptyState } from "@/components/reporting/reporting-empty-state";
import { ReportingErrorState } from "@/components/reporting/reporting-error-state";
import { ReportingFilters } from "@/components/reporting/reporting-filters-panel";
import { ReportingLoadingState } from "@/components/reporting/reporting-loading-state";
import { ReportingPageLayout } from "@/components/reporting/reporting-page-layout";
import { ReportingTableCard } from "@/components/reporting/reporting-table-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useAgentsProductivity } from "@/features/reporting/hooks/use-agents-productivity";
import { REPORTING_SURFACE_CLASS } from "@/features/reporting/lib/colors";
import {
  extractReportingRowsSource,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import {
  normalizeReportingKey,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import { formatReportingDurationFromSeconds } from "@/features/reporting/lib/formatters";
import type {
  ReportingAgentsProductivityData,
  ReportingAgentsProductivityParams,
  ReportingPrimitive,
} from "@/types/reporting.types";

interface TimeTrackingRow {
  id: string;
  name: string;
  communicationSec: number;
  qualificationSec: number;
  waitingSec: number;
  pauseSec: number;
  workingDurationSec: number;
  handledCalls?: ReportingPrimitive;
}

const timeSegments = [
  {
    key: "communicationSec",
    label: "Communication",
    color: "bg-[#82a80f]",
    textColor: "text-[#6f930a]",
    bgSoft: "bg-[#f2f8d8]",
  },
  {
    key: "qualificationSec",
    label: "Qualification",
    color: "bg-[#2d6fcb]",
    textColor: "text-[#2d6fcb]",
    bgSoft: "bg-[#e9f3ff]",
  },
  {
    key: "waitingSec",
    label: "Attente",
    color: "bg-[#111827]",
    textColor: "text-[#111827]",
    bgSoft: "bg-[#eef2f7]",
  },
  {
    key: "pauseSec",
    label: "Pause",
    color: "bg-[#b63a16]",
    textColor: "text-[#b63a16]",
    bgSoft: "bg-[#fde8e1]",
  },
] as const;

function buildRows(data: ReportingAgentsProductivityData | null) {
  const rowsSource = extractReportingRowsSource(data);

  return toReportingRecordArray(rowsSource)
    .map((record) => {
      const id = String(pickReportingValueByAliases(record, ["agent_id", "id", "user_id"]) ?? "");
      const name = String(
        pickReportingValueByAliases(record, [
          "agent_name",
          "name",
          "full_name",
          "username",
          "agent",
          "agent_id",
        ]) ?? "",
      );

      const communicationSec =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_talk_time",
            "talk_time_seconds",
            "total_talk_time_seconds",
          ]),
        ) ?? 0;
      const pauseSec =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_pause_time",
            "pause_time_seconds",
            "total_pause_time_seconds",
          ]),
        ) ?? 0;
      const workingDurationSec =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "working_duration",
            "connected_time_seconds",
            "connection_time_seconds",
            "total_connected_time_seconds",
          ]),
        ) ?? 0;
      const qualificationSec = 0;
      const waitingSec = Math.max(
        workingDurationSec - communicationSec - pauseSec - qualificationSec,
        0,
      );

      return {
        id: id || normalizeReportingKey(name),
        name,
        communicationSec,
        qualificationSec,
        waitingSec,
        pauseSec,
        workingDurationSec,
        handledCalls: pickReportingValueByAliases(record, [
          "answered_calls",
          "handled_calls",
          "completed_calls",
          "processed_calls",
        ]),
      };
    })
    .filter((row) => row.name || row.communicationSec > 0 || row.workingDurationSec > 0);
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {timeSegments.map((segment) => (
        <div
          key={segment.key}
          className={`inline-flex items-center gap-2 rounded-full border border-[#dbe5ef] px-3 py-1.5 text-xs font-medium ${segment.bgSoft} ${segment.textColor}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
          <span>{segment.label}</span>
        </div>
      ))}
    </div>
  );
}

function VerticalStackedTimelineChart({ rows }: { rows: TimeTrackingRow[] }) {
  const chartHeight = 320;
  const maxValue = Math.max(...rows.map((row) => row.workingDurationSec), 1);
  const axisTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
    const value = maxValue * ratio;
    return {
      ratio,
      label: formatReportingDurationFromSeconds(value),
    };
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1100px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-[#102033]">Repartition du temps</p>
            <p className="text-sm text-[#607287]">
              Communication, qualification, attente et pause par agent.
            </p>
          </div>
          <Legend />
        </div>

        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            <p className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-[#607287]">
              Duree
            </p>
            {axisTicks.map((tick) => (
              <div
                key={tick.ratio}
                className="absolute left-7 right-0 flex -translate-y-1/2 items-center"
                style={{ top: `${tick.ratio * 100}%` }}
              >
                <span className="w-16 text-[11px] font-medium text-[#607287]">
                  {tick.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative" style={{ height: `${chartHeight + 70}px` }}>
            {axisTicks.map((tick) => (
              <div
                key={tick.ratio}
                className="absolute left-0 right-0 border-t border-dashed border-[#e4ebf3]"
                style={{ top: `${tick.ratio * chartHeight}px` }}
              />
            ))}

            <div className="absolute bottom-[70px] left-0 right-0 flex h-[320px] items-end gap-3 px-2">
              {rows.map((row) => {
                const orderedParts = [
                  { key: "pauseSec", value: row.pauseSec },
                  { key: "waitingSec", value: row.waitingSec },
                  { key: "qualificationSec", value: row.qualificationSec },
                  { key: "communicationSec", value: row.communicationSec },
                ] as const;

                return (
                  <div key={row.id} className="flex min-w-[28px] flex-1 flex-col items-center gap-2">
                    <div className="flex w-full max-w-[34px] flex-col justify-end overflow-hidden rounded-t-[0.45rem] border border-[#dfe7ef] bg-[#f4f7fb]">
                      {orderedParts.map((part) => {
                        const segment = timeSegments.find((item) => item.key === part.key);
                        const height = Math.max((part.value / maxValue) * chartHeight, 0);

                        if (!segment || height <= 0) {
                          return null;
                        }

                        return (
                          <div
                            key={part.key}
                            className={segment.color}
                            style={{ height: `${height}px` }}
                            title={`${row.name}: ${segment.label} ${formatReportingDurationFromSeconds(part.value)}`}
                          />
                        );
                      })}
                    </div>
                    <div className="w-16 -rotate-[28deg] origin-top-left pt-1 text-left text-[10px] leading-4 text-[#54677b]">
                      {row.name || row.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { agentsProductivityData, isLoading, error, loadAgentsProductivity } =
    useAgentsProductivity();
  const [filters, setFilters] = useState<ReportingAgentsProductivityParams>({
    from: "",
    to: "",
  });

  useEffect(() => {
    void loadAgentsProductivity().catch(() => undefined);
  }, [loadAgentsProductivity]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadAgentsProductivity(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters = { from: "", to: "" };
    setFilters(nextFilters);

    try {
      await loadAgentsProductivity();
    } catch {
      return;
    }
  }

  const rows = useMemo(() => buildRows(agentsProductivityData), [agentsProductivityData]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (accumulator, row) => {
          accumulator.communicationSec += row.communicationSec;
          accumulator.qualificationSec += row.qualificationSec;
          accumulator.waitingSec += row.waitingSec;
          accumulator.pauseSec += row.pauseSec;
          accumulator.workingDurationSec += row.workingDurationSec;
          return accumulator;
        },
        {
          communicationSec: 0,
          qualificationSec: 0,
          waitingSec: 0,
          pauseSec: 0,
          workingDurationSec: 0,
        },
      ),
    [rows],
  );

  const dateRangeLabel = useMemo(
    () => formatReportingDateRange(agentsProductivityData?.period, filters),
    [agentsProductivityData, filters],
  );

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Suivi du temps agents"
      description="Lecture V1 des temps agents inspiree Phingo, basee uniquement sur les durees reelles exposees par le backend."
      actions={<DateRangePill value={dateRangeLabel} />}
    >
      <ReportingFilters
        description="Recharge du suivi du temps agents sur la plage de dates souhaitee."
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

      {isLoading && !agentsProductivityData ? (
        <ReportingLoadingState message="Chargement du suivi du temps agents..." />
      ) : null}

      {agentsProductivityData ? (
        rows.length > 0 ? (
          <>
            <KPIGrid>
              <KPICard
                label="Agents"
                value={<CountText value={rows.length} />}
                caption="Agents exploitables remontes par le backend."
                icon={<span className="text-lg font-semibold">A</span>}
                tone="navy"
              />
              <KPICard
                label="Communication"
                value={<DurationText value={totals.communicationSec} />}
                caption="Temps cumule des appels agent."
                icon={<span className="text-lg font-semibold">C</span>}
                tone="teal"
              />
              <KPICard
                label="Qualification"
                value={<DurationText value={totals.qualificationSec} />}
                caption="Reserve pour WRAP_UP ou duree de qualification backend."
                icon={<span className="text-lg font-semibold">Q</span>}
                tone="blue"
              />
              <KPICard
                label="Attente"
                value={<DurationText value={totals.waitingSec} />}
                caption="Temps connecte hors communication, pause et qualification."
                icon={<span className="text-lg font-semibold">At</span>}
                tone="navy"
              />
              <KPICard
                label="Pause"
                value={<DurationText value={totals.pauseSec} />}
                caption="Duree cumulee des pauses agents."
                icon={<span className="text-lg font-semibold">P</span>}
                tone="amber"
              />
              <KPICard
                label="Temps connecte"
                value={<DurationText value={totals.workingDurationSec} />}
                caption="Base totale de connexion sur la periode."
                icon={<span className="text-lg font-semibold">T</span>}
                tone="blue"
              />
            </KPIGrid>

            <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
              <CardContent className="flex items-start gap-3 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#295086]">
                  <Info className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-[#102033]">Qualification a venir</p>
                  <p className="text-sm text-[#607287]">
                    Le temps de qualification sera disponible quand le backend exposera WRAP_UP ou une duree de qualification.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={REPORTING_SURFACE_CLASS}>
              <CardHeader>
                <CardTitle>Repartition du temps</CardTitle>
                <CardDescription>
                  Presentation inspiree Phingo avec barres empilees par agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <VerticalStackedTimelineChart rows={rows} />
              </CardContent>
            </Card>

            <ReportingTableCard
              title="Resume"
              description="Vue tabulaire des temps agents V1."
            >
              <TableWrapper className="shadow-none">
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Agent</TableHeadCell>
                        <TableHeadCell>Communication</TableHeadCell>
                        <TableHeadCell>Qualification</TableHeadCell>
                        <TableHeadCell>Attente</TableHeadCell>
                        <TableHeadCell>Pause</TableHeadCell>
                        <TableHeadCell>Temps connecte</TableHeadCell>
                        <TableHeadCell>Appels traites</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={`${row.id}-${index}`}>
                          <TableCell className="font-medium">
                            {row.name || row.id || <span className="text-[#7b8da0]">—</span>}
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.communicationSec} />
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.qualificationSec} />
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.waitingSec} />
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.pauseSec} />
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.workingDurationSec} />
                          </TableCell>
                          <TableCell>
                            <CountText value={row.handledCalls} />
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </TableWrapper>
            </ReportingTableCard>
          </>
        ) : (
          <ReportingEmptyState message="Aucun suivi de temps agent disponible sur cette periode." />
        )
      ) : null}
    </ReportingPageLayout>
  );
}
