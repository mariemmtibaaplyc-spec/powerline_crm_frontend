"use client";

import {
  CalendarCheck2,
  CalendarRange,
  PhoneCall,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountText } from "@/components/reporting/count-text";
import { DateRangePill } from "@/components/reporting/date-range-pill";
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
import { useAgentResultsReporting } from "@/features/reporting/hooks/use-agent-results-reporting";
import {
  extractReportingRowsSource,
  extractReportingSummarySource,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import {
  averageReportingNumbers,
  normalizeReportingKey,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  type ReportingRecord,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import type {
  ReportingAgentPerformanceData,
  ReportingAppointmentsPerAgentData,
  ReportingDashboardParams,
  ReportingPrimitive,
} from "@/types/reporting.types";

interface AgentResultRow {
  id: string;
  name: string;
  status?: string;
  calls?: ReportingPrimitive;
  completedCalls?: ReportingPrimitive;
  appointmentsTotal?: ReportingPrimitive;
  appointmentsDone?: ReportingPrimitive;
  showRate?: ReportingPrimitive;
  conversionRate?: ReportingPrimitive;
}

function getAgentIdentity(record: ReportingRecord) {
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

  return {
    id: id || normalizeReportingKey(name),
    name,
  };
}

function mergeRows(
  performanceData: ReportingAgentPerformanceData | null,
  appointmentsData: ReportingAppointmentsPerAgentData | null,
) {
  const merged = new Map<string, AgentResultRow>();

  const ensureRow = (identity: { id: string; name: string }) => {
    const key = identity.id || normalizeReportingKey(identity.name);
    const existing = merged.get(key);

    if (existing) {
      if (!existing.name && identity.name) {
        existing.name = identity.name;
      }

      return existing;
    }

    const created: AgentResultRow = {
      id: key,
      name: identity.name,
    };
    merged.set(key, created);
    return created;
  };

  for (const record of toReportingRecordArray(extractReportingRowsSource(performanceData))) {
    const row = ensureRow(getAgentIdentity(record));
    row.status = String(
      pickReportingValueByAliases(record, ["status", "agent_status", "state", "is_active"]) ?? "",
    );
    row.calls = pickReportingValueByAliases(record, ["total_calls", "call_count", "calls"]);
    row.completedCalls = pickReportingValueByAliases(record, [
      "completed_calls",
      "answered_calls",
      "handled_calls",
    ]);
    row.conversionRate = pickReportingValueByAliases(record, [
      "conversion_rate",
      "conversion_rate_pct",
      "taux_conversion",
      "performance_rate",
    ]);
  }

  for (const record of toReportingRecordArray(extractReportingRowsSource(appointmentsData))) {
    const row = ensureRow(getAgentIdentity(record));
    row.appointmentsTotal = pickReportingValueByAliases(record, [
      "total_appointments",
      "appointments_total",
      "appointments",
      "rdv_total",
    ]);
    row.appointmentsDone = pickReportingValueByAliases(record, [
      "completed_appointments",
      "done_appointments",
      "appointments_done",
      "appointments_completed",
      "rdv_faits",
      "realized_appointments",
    ]);
    row.showRate = pickReportingValueByAliases(record, [
      "show_rate_pct",
      "show_rate",
      "attendance_rate",
      "presence_rate",
    ]);
  }

  return Array.from(merged.values()).filter(
    (row) =>
      row.name ||
      row.calls !== undefined ||
      row.appointmentsTotal !== undefined ||
      row.completedCalls !== undefined,
  );
}

function buildKpis(
  performanceData: ReportingAgentPerformanceData | null,
  appointmentsData: ReportingAppointmentsPerAgentData | null,
  rows: AgentResultRow[],
) {
  const performanceSummary = extractReportingSummarySource(performanceData);
  const appointmentsSummary = extractReportingSummarySource(appointmentsData);

  return {
    totalAgents:
      pickReportingValueByAliases(performanceSummary, [
        "total_agents",
        "agents_count",
        "active_agent_count",
      ]) ?? rows.length,
    totalCalls:
      pickReportingValueByAliases(performanceSummary, [
        "total_calls",
        "call_count",
        "calls",
      ]) ?? rows.reduce((sum, row) => sum + (parseReportingNumericValue(row.calls) ?? 0), 0),
    appointmentsTotal:
      pickReportingValueByAliases(appointmentsSummary, [
        "total_appointments",
        "appointments_total",
        "appointments",
      ]) ??
      rows.reduce((sum, row) => sum + (parseReportingNumericValue(row.appointmentsTotal) ?? 0), 0),
    appointmentsDone:
      pickReportingValueByAliases(appointmentsSummary, [
        "completed_appointments",
        "done_appointments",
        "appointments_done",
        "appointments_completed",
        "realized_appointments",
      ]) ??
      rows.reduce((sum, row) => sum + (parseReportingNumericValue(row.appointmentsDone) ?? 0), 0),
    averageShowRate:
      pickReportingValueByAliases(appointmentsSummary, [
        "show_rate_pct",
        "show_rate",
        "attendance_rate",
        "presence_rate",
        "average_show_rate",
      ]) ?? averageReportingNumbers(rows.map((row) => parseReportingNumericValue(row.showRate))),
    averageConversion:
      pickReportingValueByAliases(performanceSummary, [
        "conversion_rate",
        "conversion_rate_pct",
        "average_conversion_rate",
        "avg_conversion_rate",
      ]) ??
      averageReportingNumbers(rows.map((row) => parseReportingNumericValue(row.conversionRate))),
  };
}

function getDisplayStatus(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (
    normalized === "true" ||
    normalized.includes("active") ||
    normalized.includes("online") ||
    normalized.includes("connecte")
  ) {
    return "Actif";
  }

  if (
    normalized === "false" ||
    normalized.includes("inactive") ||
    normalized.includes("offline") ||
    normalized.includes("deconnecte")
  ) {
    return "Inactif";
  }

  return value;
}

export default function Page() {
  const {
    performanceData,
    appointmentsData,
    isLoading,
    error,
    loadAgentResultsReporting,
  } = useAgentResultsReporting();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
  });

  useEffect(() => {
    void loadAgentResultsReporting().catch(() => undefined);
  }, [loadAgentResultsReporting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadAgentResultsReporting(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters = { from: "", to: "" };
    setFilters(nextFilters);

    try {
      await loadAgentResultsReporting();
    } catch {
      return;
    }
  }

  const rows = useMemo(
    () => mergeRows(performanceData, appointmentsData),
    [appointmentsData, performanceData],
  );
  const kpis = useMemo(
    () => buildKpis(performanceData, appointmentsData, rows),
    [appointmentsData, performanceData, rows],
  );
  const dateRangeLabel = useMemo(
    () => formatReportingDateRange(performanceData ?? appointmentsData, filters),
    [appointmentsData, filters, performanceData],
  );

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Resultat des agents"
      description="Lecture V1 des appels et rendez-vous par agent depuis le backend reporting reel."
      actions={<DateRangePill value={dateRangeLabel} />}
    >
      <ReportingFilters
        description="Recharge des resultats agents sur la plage de dates souhaitee."
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

      {isLoading && !performanceData && !appointmentsData ? (
        <ReportingLoadingState message="Chargement des resultats agents..." />
      ) : null}

      {performanceData || appointmentsData ? (
        rows.length > 0 ? (
          <>
            <KPIGrid>
              <KPICard
                label="Total agents"
                value={<CountText value={kpis.totalAgents} />}
                caption="Agents remontes sur la periode."
                icon={<Users className="h-5 w-5" />}
                tone="navy"
              />
              <KPICard
                label="Appels totaux"
                value={<CountText value={kpis.totalCalls} />}
                caption="Volume d'appels consolide."
                icon={<PhoneCall className="h-5 w-5" />}
                tone="blue"
              />
              <KPICard
                label="RDV totaux"
                value={<CountText value={kpis.appointmentsTotal} />}
                caption="Rendez-vous planifies ou qualifies."
                icon={<CalendarRange className="h-5 w-5" />}
                tone="teal"
              />
              <KPICard
                label="RDV realises"
                value={<CountText value={kpis.appointmentsDone} />}
                caption="Rendez-vous effectivement realises."
                icon={<CalendarCheck2 className="h-5 w-5" />}
                tone="amber"
              />
              <KPICard
                label="Taux presence moyen"
                value={<PercentText value={kpis.averageShowRate} />}
                caption="Moyenne de presence disponible."
                icon={<Target className="h-5 w-5" />}
                tone="blue"
              />
              <KPICard
                label="Taux conversion moyen"
                value={<PercentText value={kpis.averageConversion} />}
                caption="Affiche uniquement si la performance le fournit."
                icon={<Target className="h-5 w-5" />}
                tone="navy"
              />
            </KPIGrid>

            <ReportingTableCard
              title="Par agent"
              description="Resultats V1 bases uniquement sur les appels et les rendez-vous."
            >
              <TableWrapper className="shadow-none">
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Agent</TableHeadCell>
                        <TableHeadCell>Appels</TableHeadCell>
                        <TableHeadCell>Appels completes</TableHeadCell>
                        <TableHeadCell>RDV total</TableHeadCell>
                        <TableHeadCell>RDV faits</TableHeadCell>
                        <TableHeadCell>Taux presence</TableHeadCell>
                        <TableHeadCell>Taux conversion</TableHeadCell>
                        <TableHeadCell>Statut</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={`${row.id}-${index}`}>
                          <TableCell className="font-medium">
                            {row.name || row.id || <span className="text-[#7b8da0]">—</span>}
                          </TableCell>
                          <TableCell>
                            <CountText value={row.calls} />
                          </TableCell>
                          <TableCell>
                            <CountText value={row.completedCalls} />
                          </TableCell>
                          <TableCell>
                            <CountText value={row.appointmentsTotal} />
                          </TableCell>
                          <TableCell>
                            <CountText value={row.appointmentsDone} />
                          </TableCell>
                          <TableCell>
                            <PercentText value={row.showRate} />
                          </TableCell>
                          <TableCell>
                            <PercentText value={row.conversionRate} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge value={getDisplayStatus(row.status)} />
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
          <ReportingEmptyState message="Aucun resultat agent exploitable sur cette periode." />
        )
      ) : null}
    </ReportingPageLayout>
  );
}
