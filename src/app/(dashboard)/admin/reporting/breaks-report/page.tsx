"use client";

import { Info, PauseCircle, Timer, Users } from "lucide-react";
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
import { StatusBadge } from "@/components/reporting/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useBreaksReporting } from "@/features/reporting/hooks/use-breaks-reporting";
import {
  extractReportingRowsSource,
  extractReportingSummarySource,
  formatReportingDate,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import {
  averageReportingNumbers,
  normalizeReportingKey,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import type {
  ReportingDashboardParams,
  ReportingPauseReportsData,
  ReportingSessionsHistoryData,
} from "@/types/reporting.types";

interface PauseReportRow {
  id: string;
  rowKey: string;
  name: string;
  status: string;
  pauseCount: number;
  pauseDurationSec: number;
  type: "PAUSED";
}

interface SessionHistoryRow {
  id: string;
  rowKey: string;
  name: string;
  sessionDate: string | null;
  loginAt: string | null;
  logoutAt: string | null;
  connectedDurationSec: number;
  pauseCount: number;
  pauseDurationSec: number;
}

function toDisplayDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return formatReportingDate(value);
}

function toDisplayDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatActiveStatus(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Actif" : "Inactif";
  }

  if (typeof value === "number") {
    return value > 0 ? "Actif" : "Inactif";
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return "—";
    }

    if (
      normalized === "1" ||
      normalized === "true" ||
      normalized.includes("active") ||
      normalized.includes("online") ||
      normalized.includes("connected")
    ) {
      return "Actif";
    }

    if (
      normalized === "0" ||
      normalized === "false" ||
      normalized.includes("inactive") ||
      normalized.includes("offline") ||
      normalized.includes("disconnected")
    ) {
      return "Inactif";
    }

    return value;
  }

  return "—";
}

function buildPauseReportRows(data: ReportingPauseReportsData | null) {
  const rowsSource = extractReportingRowsSource(data);

  return toReportingRecordArray(rowsSource)
    .map((record, index) => {
      const id = String(
        pickReportingValueByAliases(record, ["agent_id", "user_id", "id"]) ?? "",
      );
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
      const statusSource =
        pickReportingValueByAliases(record, [
          "status",
          "agent_status",
          "active_status",
          "state",
        ]) ??
        pickReportingValueByAliases(record, ["is_active", "active"]);
      const pauseCount =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_pauses",
            "pause_count",
            "pauses_count",
            "break_count",
            "breaks_count",
            "pauses",
          ]),
        ) ?? 0;
      const pauseDurationSec =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_pause_time",
            "total_pause_time_seconds",
            "pause_time_seconds",
            "pause_duration_seconds",
            "total_pause_duration_seconds",
            "break_time_seconds",
            "pause_time",
          ]),
        ) ?? 0;
      const fallbackId = normalizeReportingKey(name || "agent");
      const rowKey = [
        id || fallbackId || "agent",
        name || "unknown-agent",
        String(statusSource ?? ""),
        "PAUSED",
        String(index),
      ].join("-");

      return {
        id: id || `${fallbackId}-${index}`,
        rowKey,
        name: name || id || "—",
        status: formatActiveStatus(statusSource),
        pauseCount,
        pauseDurationSec,
        type: "PAUSED" as const,
      };
    })
    .filter((row) => row.name !== "—" || row.pauseCount > 0 || row.pauseDurationSec > 0);
}

function buildSessionHistoryRows(data: ReportingSessionsHistoryData | null) {
  const rowsSource = extractReportingRowsSource(data);

  return toReportingRecordArray(rowsSource)
    .map((record, index) => {
      const id = String(
        pickReportingValueByAliases(record, [
          "session_id",
          "id",
          "agent_status_id",
          "history_id",
        ]) ?? "",
      );
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
      const sessionDate = (() => {
        const explicitDate = pickReportingValueByAliases(record, [
          "session_date",
          "date",
          "day",
        ]);

        if (typeof explicitDate === "string" && explicitDate.trim()) {
          return explicitDate;
        }

        const loginAt = pickReportingValueByAliases(record, ["login_at", "started_at", "login"]);
        return typeof loginAt === "string" && loginAt.trim() ? loginAt : null;
      })();
      const loginAt = (() => {
        const value = pickReportingValueByAliases(record, [
          "login_at",
          "started_at",
          "login",
          "session_start",
        ]);

        return typeof value === "string" && value.trim() ? value : null;
      })();
      const logoutAt = (() => {
        const value = pickReportingValueByAliases(record, [
          "logout_at",
          "ended_at",
          "logout",
          "session_end",
        ]);

        return typeof value === "string" && value.trim() ? value : null;
      })();
      const connectedDurationSec =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "working_duration",
            "connected_time_seconds",
            "connection_time_seconds",
            "connected_duration_seconds",
            "total_connected_time_seconds",
            "login_time_seconds",
          ]),
        ) ?? 0;
      const pauseCount =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_pauses",
            "pause_count",
            "pauses_count",
            "break_count",
            "breaks_count",
            "pauses",
          ]),
        ) ?? 0;
      const pauseDurationSec =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_pause_time",
            "total_pause_time_seconds",
            "pause_time_seconds",
            "pause_duration_seconds",
            "total_pause_duration_seconds",
            "break_time_seconds",
            "pause_time",
          ]),
        ) ?? 0;
      const fallbackId = normalizeReportingKey(name || "session");
      const rowKey = [
        id || fallbackId || "session",
        name || "unknown-agent",
        sessionDate ?? "no-date",
        loginAt ?? "no-login",
        logoutAt ?? "no-logout",
        String(index),
      ].join("-");

      return {
        id: id || `${fallbackId}-${index}`,
        rowKey,
        name: name || "—",
        sessionDate,
        loginAt,
        logoutAt,
        connectedDurationSec,
        pauseCount,
        pauseDurationSec,
      };
    })
    .filter(
      (row) =>
        row.name !== "—" ||
        row.sessionDate !== null ||
        row.connectedDurationSec > 0 ||
        row.pauseCount > 0 ||
        row.pauseDurationSec > 0,
    );
}

function buildPauseKpis(
  pauseReportsData: ReportingPauseReportsData | null,
  pauseRows: PauseReportRow[],
) {
  const summarySource = extractReportingSummarySource(pauseReportsData);
  const totalAgentsFallback = pauseRows.length;
  const totalPausesFallback = pauseRows.reduce((sum, row) => sum + row.pauseCount, 0);
  const totalPauseDurationFallback = pauseRows.reduce(
    (sum, row) => sum + row.pauseDurationSec,
    0,
  );
  const averagePausePerAgentFallback =
    totalAgentsFallback > 0 ? totalPauseDurationFallback / totalAgentsFallback : 0;

  return {
    totalAgents:
      parseReportingNumericValue(
        pickReportingValueByAliases(summarySource, [
          "total_agents",
          "agents_count",
          "active_agents",
          "agent_count",
        ]),
      ) ?? totalAgentsFallback,
    totalPauses:
      parseReportingNumericValue(
        pickReportingValueByAliases(summarySource, [
          "total_pauses",
          "pause_count",
          "pauses_count",
          "break_count",
          "breaks_count",
        ]),
      ) ?? totalPausesFallback,
    totalPauseDurationSec:
      parseReportingNumericValue(
        pickReportingValueByAliases(summarySource, [
          "total_pause_time",
          "total_pause_time_seconds",
          "pause_time_seconds",
          "pause_duration_seconds",
          "total_pause_duration_seconds",
          "break_time_seconds",
          "pause_time",
        ]),
      ) ?? totalPauseDurationFallback,
    averagePausePerAgentSec:
      parseReportingNumericValue(
        pickReportingValueByAliases(summarySource, [
          "average_pause_time_per_agent",
          "avg_pause_time_per_agent",
          "average_pause_duration_per_agent_seconds",
          "avg_pause_duration_seconds",
        ]),
      ) ?? averagePausePerAgentFallback,
  };
}

export default function Page() {
  const { pauseReportsData, sessionsHistoryData, isLoading, error, loadBreaksReporting } =
    useBreaksReporting();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
  });

  useEffect(() => {
    void loadBreaksReporting().catch(() => undefined);
  }, [loadBreaksReporting]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadBreaksReporting(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters = { from: "", to: "" };
    setFilters(nextFilters);

    try {
      await loadBreaksReporting();
    } catch {
      return;
    }
  }

  const pauseRows = useMemo(
    () => buildPauseReportRows(pauseReportsData),
    [pauseReportsData],
  );
  const sessionRows = useMemo(
    () => buildSessionHistoryRows(sessionsHistoryData),
    [sessionsHistoryData],
  );
  const kpis = useMemo(
    () => buildPauseKpis(pauseReportsData, pauseRows),
    [pauseReportsData, pauseRows],
  );
  const dateRangeLabel = useMemo(
    () =>
      formatReportingDateRange(
        pauseReportsData?.period ?? sessionsHistoryData?.period,
        filters,
      ),
    [filters, pauseReportsData?.period, sessionsHistoryData?.period],
  );
  const averageSessionPauseSec = useMemo(
    () =>
      averageReportingNumbers(
        sessionRows.map((row) => (row.pauseDurationSec > 0 ? row.pauseDurationSec : 0)),
      ) ?? 0,
    [sessionRows],
  );

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Rapport des pauses"
      description="Lecture V1 des pauses agents sur la base des endpoints backend reels pause-reports et sessions-history."
      actions={<DateRangePill value={dateRangeLabel} />}
    >
      <ReportingFilters
        description="Recharge du rapport des pauses sur la plage de dates souhaitee."
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

      {isLoading && !pauseReportsData && !sessionsHistoryData ? (
        <ReportingLoadingState message="Chargement du rapport des pauses..." />
      ) : null}

      {pauseReportsData || sessionsHistoryData ? (
        <>
          <KPIGrid>
            <KPICard
              label="Total agents"
              value={<CountText value={kpis.totalAgents} />}
              caption="Agents remontes dans le rapport de pauses."
              icon={<Users className="h-5 w-5" />}
              tone="navy"
            />
            <KPICard
              label="Total pauses"
              value={<CountText value={kpis.totalPauses} />}
              caption="Nombre cumule de pauses sur la periode."
              icon={<PauseCircle className="h-5 w-5" />}
              tone="amber"
            />
            <KPICard
              label="Temps total pause"
              value={<DurationText value={kpis.totalPauseDurationSec} />}
              caption="Temps cumule en statut PAUSED."
              icon={<Timer className="h-5 w-5" />}
              tone="blue"
            />
            <KPICard
              label="Moyenne pause / agent"
              value={<DurationText value={kpis.averagePausePerAgentSec} />}
              caption="Moyenne de duree de pause par agent."
              icon={<Info className="h-5 w-5" />}
              tone="teal"
            />
          </KPIGrid>

          <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
            <CardContent className="flex items-start gap-3 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#295086]">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-[#102033]">Types de pause a venir</p>
                <p className="text-sm text-[#607287]">
                  Les types de pause detailles seront disponibles quand le backend exposera
                  {" "}`pause_type`.
                </p>
              </div>
            </CardContent>
          </Card>

          <ReportingTableCard
            title="Rapport pauses par agent"
            description="Vue V1 par agent basee sur le backend pause-reports, sans typologie detaillee de pause."
          >
            {pauseRows.length > 0 ? (
              <TableWrapper className="shadow-none">
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Agent</TableHeadCell>
                        <TableHeadCell>Statut</TableHeadCell>
                        <TableHeadCell>Nombre pauses</TableHeadCell>
                        <TableHeadCell>Temps total pause</TableHeadCell>
                        <TableHeadCell>Type</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {pauseRows.map((row) => (
                        <tr key={row.rowKey}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>
                            <StatusBadge value={row.status} />
                          </TableCell>
                          <TableCell>
                            <CountText value={row.pauseCount} />
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.pauseDurationSec} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge value={row.type} compact />
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </TableWrapper>
            ) : (
              <ReportingEmptyState message="Aucune pause agent disponible sur cette periode." />
            )}
          </ReportingTableCard>

          <ReportingTableCard
            title="Historique des sessions"
            description="Lecture de controle depuis sessions-history pour recouper connexion et temps de pause."
          >
            {sessionRows.length > 0 ? (
              <TableWrapper className="shadow-none">
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Agent</TableHeadCell>
                        <TableHeadCell>Date</TableHeadCell>
                        <TableHeadCell>Login</TableHeadCell>
                        <TableHeadCell>Logout</TableHeadCell>
                        <TableHeadCell>Temps connecte</TableHeadCell>
                        <TableHeadCell>Pauses</TableHeadCell>
                        <TableHeadCell>Duree pause</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionRows.map((row) => (
                        <tr key={row.rowKey}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{toDisplayDate(row.sessionDate)}</TableCell>
                          <TableCell>{toDisplayDateTime(row.loginAt)}</TableCell>
                          <TableCell>{toDisplayDateTime(row.logoutAt)}</TableCell>
                          <TableCell>
                            <DurationText value={row.connectedDurationSec} />
                          </TableCell>
                          <TableCell>
                            <CountText value={row.pauseCount} />
                          </TableCell>
                          <TableCell>
                            <DurationText value={row.pauseDurationSec} />
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </TableWrapper>
            ) : (
              <ReportingEmptyState message="Aucune session agent disponible sur cette periode." />
            )}
          </ReportingTableCard>

          {sessionRows.length > 0 ? (
            <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
              <CardContent className="flex flex-wrap items-center gap-6 pt-6 text-sm text-[#607287]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#102033]">Sessions chargees</span>
                  <CountText value={sessionRows.length} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#102033]">Pause moyenne / session</span>
                  <DurationText value={averageSessionPauseSec} />
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </ReportingPageLayout>
  );
}
