"use client";

import {
  Clock3,
  Coffee,
  PhoneCall,
  Timer,
  UserRoundCheck,
  Users,
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
import { ReportingPageLayout } from "@/components/reporting/reporting-page-layout";
import { ReportingTableCard } from "@/components/reporting/reporting-table-card";
import { StatusBadge } from "@/components/reporting/status-badge";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useAgentsProductivity } from "@/features/reporting/hooks/use-agents-productivity";
import {
  extractReportingRowsSource,
  extractReportingSummarySource,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import {
  averageReportingNumbers,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import {
  formatReportingCount,
  formatReportingDurationFromSeconds,
  formatReportingPercentage,
} from "@/features/reporting/lib/formatters";
import type {
  ReportingAgentsProductivityData,
  ReportingAgentsProductivityParams,
  ReportingPrimitive,
} from "@/types/reporting.types";

type MetricKind = "count" | "duration" | "percentage" | "text";

interface AgentProductivityRow {
  id?: string;
  name?: string;
  role?: string;
  status?: string;
  calls?: ReportingPrimitive;
  handledCalls?: ReportingPrimitive;
  talkTime?: ReportingPrimitive;
  connectedTime?: ReportingPrimitive;
  pauseTime?: ReportingPrimitive;
  dmc?: ReportingPrimitive;
  dmt?: ReportingPrimitive;
  sales?: ReportingPrimitive;
  productivityRate?: ReportingPrimitive;
  performanceRate?: ReportingPrimitive;
}

function formatMetricValue(value: ReportingPrimitive | undefined, kind: MetricKind) {
  if (value === undefined || value === null) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  if (kind === "text") {
    return String(value);
  }

  const numeric = parseReportingNumericValue(value);
  if (numeric === null) {
    return String(value);
  }

  if (kind === "duration") {
    return formatReportingDurationFromSeconds(numeric);
  }

  if (kind === "percentage") {
    return formatReportingPercentage(numeric);
  }

  return formatReportingCount(numeric);
}

function buildAgentRows(data: ReportingAgentsProductivityData | null) {
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
      role: String(
        pickReportingValueByAliases(record, ["role", "agent_role", "profile", "fonction"]) ?? "",
      ),
      status: String(
        pickReportingValueByAliases(record, ["status", "agent_status", "state", "etat"]) ?? "",
      ),
      calls: pickReportingValueByAliases(record, ["total_calls", "call_count", "calls"]),
      handledCalls: pickReportingValueByAliases(record, [
        "answered_calls",
        "handled_calls",
        "processed_calls",
        "treated_calls",
        "completed_calls",
      ]),
      talkTime: pickReportingValueByAliases(record, [
        "total_talk_time",
        "talk_time_seconds",
        "talk_duration_seconds",
        "total_talk_time_seconds",
        "talk_time",
      ]),
      connectedTime: pickReportingValueByAliases(record, [
        "working_duration",
        "connected_time_seconds",
        "connection_time_seconds",
        "total_connected_time_seconds",
        "login_time_seconds",
        "connected_time",
      ]),
      pauseTime: pickReportingValueByAliases(record, [
        "total_pause_time",
        "pause_time_seconds",
        "break_time_seconds",
        "total_pause_time_seconds",
        "pause_duration_seconds",
        "pause_time",
      ]),
      dmc: pickReportingValueByAliases(record, [
        "average_dmc",
        "avg_dmc_seconds",
        "dmc_seconds",
        "average_dmc_seconds",
        "avg_dmc",
        "dmc",
      ]),
      dmt: pickReportingValueByAliases(record, [
        "average_dmt",
        "avg_dmt_seconds",
        "dmt_seconds",
        "average_dmt_seconds",
        "avg_dmt",
        "dmt",
      ]),
      sales: pickReportingValueByAliases(record, ["sales_count", "total_sales", "sales"]),
      productivityRate: pickReportingValueByAliases(record, [
        "productivity_rate",
        "production_rate",
        "prod_rate",
        "taux_prod",
      ]),
      performanceRate: pickReportingValueByAliases(record, [
        "performance_rate",
        "perf_rate",
        "taux_perf",
      ]),
    }))
    .filter((row) => row.name || row.id || row.role || row.status || row.calls !== undefined);
}

function buildKpisFromRows(rows: AgentProductivityRow[]) {
  return {
    activeAgents: rows.length,
    totalCalls: rows.reduce((sum, row) => sum + (parseReportingNumericValue(row.calls) ?? 0), 0),
    totalTalkTime: rows.reduce(
      (sum, row) => sum + (parseReportingNumericValue(row.talkTime) ?? 0),
      0,
    ),
    totalPauseTime: rows.reduce(
      (sum, row) => sum + (parseReportingNumericValue(row.pauseTime) ?? 0),
      0,
    ),
    averageDmc: averageReportingNumbers(rows.map((row) => parseReportingNumericValue(row.dmc))),
    averageDmt: averageReportingNumbers(rows.map((row) => parseReportingNumericValue(row.dmt))),
  };
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

  const summarySource = useMemo(
    () => extractReportingSummarySource(agentsProductivityData),
    [agentsProductivityData],
  );
  const rows = useMemo(() => buildAgentRows(agentsProductivityData), [agentsProductivityData]);
  const fallbackKpis = useMemo(() => buildKpisFromRows(rows), [rows]);

  const kpis = useMemo(
    () => [
      {
        label: "Agents actifs",
        value: formatMetricValue(
          pickReportingValueByAliases(summarySource, [
            "active_agents",
            "agents_active",
            "active_agent_count",
            "connected_agents",
          ]) ?? fallbackKpis.activeAgents,
          "count",
        ),
        caption: "Agents actuellement remontes par le backend.",
        icon: <Users className="h-5 w-5" />,
        tone: "navy" as const,
      },
      {
        label: "Appels totaux",
        value: formatMetricValue(
          pickReportingValueByAliases(summarySource, ["total_calls", "call_count", "calls"]) ??
            fallbackKpis.totalCalls,
          "count",
        ),
        caption: "Volume brut d'appels sur la periode.",
        icon: <PhoneCall className="h-5 w-5" />,
        tone: "blue" as const,
      },
      {
        label: "Temps parole total",
        value: formatMetricValue(
          pickReportingValueByAliases(summarySource, [
            "total_talk_time",
            "total_talk_time_seconds",
            "talk_time_seconds",
            "total_talk_duration_seconds",
            "talk_time",
          ]) ?? fallbackKpis.totalTalkTime,
          "duration",
        ),
        caption: "Temps cumule passe en communication.",
        icon: <Clock3 className="h-5 w-5" />,
        tone: "teal" as const,
      },
      {
        label: "Temps pause total",
        value: formatMetricValue(
          pickReportingValueByAliases(summarySource, [
            "total_pause_time",
            "total_pause_time_seconds",
            "pause_time_seconds",
            "total_pause_duration_seconds",
            "pause_time",
          ]) ?? fallbackKpis.totalPauseTime,
          "duration",
        ),
        caption: "Temps cumule en pause ou indisponibilite.",
        icon: <Coffee className="h-5 w-5" />,
        tone: "amber" as const,
      },
      {
        label: "DMC moyen",
        value: formatMetricValue(
          pickReportingValueByAliases(summarySource, [
            "average_dmc",
            "avg_dmc_seconds",
            "average_dmc_seconds",
            "dmc_seconds",
            "avg_dmc",
            "dmc",
          ]) ?? fallbackKpis.averageDmc,
          "duration",
        ),
        caption: "Duree moyenne de communication.",
        icon: <Timer className="h-5 w-5" />,
        tone: "blue" as const,
      },
      {
        label: "DMT moyen",
        value: formatMetricValue(
          pickReportingValueByAliases(summarySource, [
            "average_dmt",
            "avg_dmt_seconds",
            "average_dmt_seconds",
            "dmt_seconds",
            "avg_dmt",
            "dmt",
          ]) ?? fallbackKpis.averageDmt,
          "duration",
        ),
        caption: "Duree moyenne de traitement.",
        icon: <UserRoundCheck className="h-5 w-5" />,
        tone: "navy" as const,
      },
    ],
    [fallbackKpis, summarySource],
  );

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Productivite des agents"
      description="Lecture operationnelle de la productivite des agents sur la base du backend reporting reel."
      actions={
        <DateRangePill
          value={formatReportingDateRange(agentsProductivityData?.period, filters)}
        />
      }
    >
      <ReportingFilters
        description="Recharge du reporting de productivite sur la plage de dates souhaitee."
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
        <ReportingLoadingState message="Chargement de la productivite des agents..." />
      ) : null}

      {agentsProductivityData ? (
        <>
          <KPIGrid>
            {kpis.map((card) => (
              <KPICard
                key={card.label}
                label={card.label}
                value={card.value}
                caption={card.caption}
                icon={card.icon}
                tone={card.tone}
              />
            ))}
          </KPIGrid>

          <ReportingTableCard
            title="Tableau agents"
            description="Productivite detaillee des agents retournee par le backend."
          >
            {rows.length > 0 ? (
              <TableWrapper className="shadow-none">
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Agent</TableHeadCell>
                        <TableHeadCell>Role</TableHeadCell>
                        <TableHeadCell>Statut</TableHeadCell>
                        <TableHeadCell>Appels</TableHeadCell>
                        <TableHeadCell>Appels traites</TableHeadCell>
                        <TableHeadCell>Temps parole</TableHeadCell>
                        <TableHeadCell>Temps connecte</TableHeadCell>
                        <TableHeadCell>Temps pause</TableHeadCell>
                        <TableHeadCell>DMC</TableHeadCell>
                        <TableHeadCell>DMT</TableHeadCell>
                        <TableHeadCell>Ventes</TableHeadCell>
                        <TableHeadCell>Taux prod</TableHeadCell>
                        <TableHeadCell>Taux perf</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={`${row.id ?? row.name ?? "agent"}-${index}`}>
                          <TableCell className="font-medium">
                            {row.name || row.id || <span className="text-[#7b8da0]">—</span>}
                          </TableCell>
                          <TableCell>{row.role || "—"}</TableCell>
                          <TableCell>
                            <StatusBadge value={row.status} />
                          </TableCell>
                          <TableCell><CountText value={row.calls} /></TableCell>
                          <TableCell><CountText value={row.handledCalls} /></TableCell>
                          <TableCell><DurationText value={row.talkTime} /></TableCell>
                          <TableCell><DurationText value={row.connectedTime} /></TableCell>
                          <TableCell><DurationText value={row.pauseTime} /></TableCell>
                          <TableCell><DurationText value={row.dmc} /></TableCell>
                          <TableCell><DurationText value={row.dmt} /></TableCell>
                          <TableCell><CountText value={row.sales} /></TableCell>
                          <TableCell><PercentText value={row.productivityRate} /></TableCell>
                          <TableCell><PercentText value={row.performanceRate} /></TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </TableWrapper>
            ) : (
              <ReportingEmptyState message="Aucune productivite agent sur cette periode." />
            )}
          </ReportingTableCard>
        </>
      ) : null}
    </ReportingPageLayout>
  );
}
