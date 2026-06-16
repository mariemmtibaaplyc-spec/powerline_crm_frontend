"use client";

import { CalendarClock, Clock3, PauseCircle, Timer, Users } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useSessionsHistoryReporting } from "@/features/reporting/hooks/use-sessions-history-reporting";
import {
  extractReportingRowsSource,
  formatReportingDate,
  formatReportingDateRange,
} from "@/features/reporting/lib/date-range";
import {
  normalizeReportingKey,
  parseReportingNumericValue,
  pickReportingValueByAliases,
  toReportingRecordArray,
} from "@/features/reporting/lib/parsers";
import { useUsers } from "@/features/users/hooks/use-users";
import type {
  ReportingDashboardParams,
  ReportingSessionHistoryRow,
  ReportingSessionsHistoryData,
} from "@/types/reporting.types";

interface SessionHistoryViewRow {
  id: string;
  rowKey: string;
  agentName: string;
  role: string | null;
  email: string | null;
  isActive: boolean | null;
  sessionDate: string | null;
  loginTime: string | null;
  logoutTime: string | null;
  totalConnectedTime: number;
  pausesCount: number;
  pauseDuration: number;
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

function buildSessionRows(data: ReportingSessionsHistoryData | null) {
  const rowsSource = extractReportingRowsSource(data);

  return toReportingRecordArray(rowsSource)
    .map((record, index) => {
      const row = record as Record<string, unknown> as Partial<ReportingSessionHistoryRow>;
      const agentId =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, ["agent_id", "user_id", "id"]),
        ) ?? index + 1;
      const agentName = String(
        pickReportingValueByAliases(record, [
          "agent_name",
          "name",
          "full_name",
          "username",
          "agent",
        ]) ?? "",
      );
      const roleValue = pickReportingValueByAliases(record, ["role", "agent_role"]);
      const emailValue = pickReportingValueByAliases(record, ["email", "agent_email"]);
      const activeValue = pickReportingValueByAliases(record, ["is_active", "active"]);
      const sessionDateValue = pickReportingValueByAliases(record, [
        "session_date",
        "date",
        "day",
      ]);
      const loginTimeValue = pickReportingValueByAliases(record, [
        "login_time",
        "login_at",
        "login",
        "started_at",
      ]);
      const logoutTimeValue = pickReportingValueByAliases(record, [
        "logout_time",
        "logout_at",
        "logout",
        "ended_at",
      ]);
      const totalConnectedTime =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "total_connected_time",
            "connected_time_seconds",
            "connected_duration_seconds",
            "total_connected_time_seconds",
          ]),
        ) ?? 0;
      const pausesCount =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "pauses_count",
            "pause_count",
            "total_pauses",
            "pauses",
          ]),
        ) ?? 0;
      const pauseDuration =
        parseReportingNumericValue(
          pickReportingValueByAliases(record, [
            "pause_duration",
            "pause_duration_seconds",
            "total_pause_time",
            "pause_time_seconds",
          ]),
        ) ?? 0;

      const fallbackId = normalizeReportingKey(agentName || `session-${agentId}`);
      const sessionDate = typeof sessionDateValue === "string" && sessionDateValue.trim()
        ? sessionDateValue
        : null;
      const loginTime = typeof loginTimeValue === "string" && loginTimeValue.trim()
        ? loginTimeValue
        : null;
      const logoutTime = typeof logoutTimeValue === "string" && logoutTimeValue.trim()
        ? logoutTimeValue
        : null;

      return {
        id: `${agentId}`,
        rowKey: [agentId, sessionDate ?? "no-date", loginTime ?? "no-login", index].join("-"),
        agentName: agentName || `Agent #${agentId}`,
        role: typeof roleValue === "string" ? roleValue : row.role ?? null,
        email: typeof emailValue === "string" ? emailValue : row.email ?? null,
        isActive:
          typeof activeValue === "boolean"
            ? activeValue
            : typeof activeValue === "number"
              ? activeValue > 0
              : row.is_active ?? null,
        sessionDate,
        loginTime,
        logoutTime,
        totalConnectedTime,
        pausesCount,
        pauseDuration,
      };
    })
    .filter(
      (row) =>
        row.agentName ||
        row.sessionDate !== null ||
        row.totalConnectedTime > 0 ||
        row.pausesCount > 0,
    );
}

function ActiveStatusLabel({ value }: { value: boolean | null }) {
  if (value === null) {
    return <span className="text-sm text-[#7b8da0]">—</span>;
  }

  return <StatusBadge value={value ? "Actif" : "Inactif"} compact />;
}

export default function Page() {
  const { sessionsHistoryData, isLoading, error, loadSessionsHistory } =
    useSessionsHistoryReporting();
  const { users, hasLoadedUsers } = useUsers();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
    agent_id: "",
  });

  useEffect(() => {
    void loadSessionsHistory().catch(() => undefined);
  }, [loadSessionsHistory]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadSessionsHistory(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters: ReportingDashboardParams = {
      from: "",
      to: "",
      agent_id: "",
    };

    setFilters(nextFilters);

    try {
      await loadSessionsHistory(nextFilters);
    } catch {
      return;
    }
  }

  const agentOptions = useMemo(
    () =>
      users
        .filter((user) => user.role === "agent")
        .map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || user.username,
          isActive: user.status === "active",
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  const rows = useMemo(() => buildSessionRows(sessionsHistoryData), [sessionsHistoryData]);

  const metrics = useMemo(() => {
    const distinctAgents = new Set(rows.map((row) => row.id)).size;
    const sessionsCount = rows.length;
    const totalConnectedTime = rows.reduce((sum, row) => sum + row.totalConnectedTime, 0);
    const totalPauses = rows.reduce((sum, row) => sum + row.pausesCount, 0);
    const totalPauseDuration = rows.reduce((sum, row) => sum + row.pauseDuration, 0);

    return {
      distinctAgents,
      sessionsCount,
      totalConnectedTime,
      totalPauses,
      totalPauseDuration,
      averageConnectedTimePerSession:
        sessionsCount > 0 ? totalConnectedTime / sessionsCount : 0,
    };
  }, [rows]);

  const selectedAgentName = useMemo(() => {
    const selectedAgentId = filters.agent_id?.trim();
    if (!selectedAgentId) {
      return null;
    }

    return agentOptions.find((agent) => agent.id === selectedAgentId)?.name ?? null;
  }, [agentOptions, filters.agent_id]);

  const dateRangeLabel = useMemo(
    () => formatReportingDateRange(sessionsHistoryData?.period, filters),
    [filters, sessionsHistoryData?.period],
  );

  const isEmpty = !isLoading && !error && rows.length === 0;

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Historique des sessions"
      description="Lecture V1 des sessions agents basée sur l'endpoint backend sessions-history."
      actions={<DateRangePill value={dateRangeLabel} />}
    >
      <ReportingFilters
        description="Recharge l'historique réel des sessions agents sur la plage de dates souhaitée."
        from={filters.from ?? ""}
        to={filters.to ?? ""}
        extraFields={
          <label className="space-y-2">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
              Agent
            </span>
            <Select
              value={filters.agent_id ?? ""}
              className="h-10 rounded-xl border-[#dce6f0] bg-white px-3 text-sm text-[#102033]"
              disabled={!hasLoadedUsers}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  agent_id: event.target.value,
                }))
              }
            >
              <option value="">Tous les agents</option>
              {agentOptions.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                  {agent.isActive ? "" : " (inactif)"}
                </option>
              ))}
            </Select>
          </label>
        }
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

      {isLoading && !sessionsHistoryData ? (
        <ReportingLoadingState message="Chargement de l'historique des sessions..." />
      ) : null}

      {!isLoading && !error ? (
        <div className="space-y-6">
          <Card className="border border-[#dce6f0] bg-white/95 shadow-none">
            <CardContent className="flex flex-col gap-2 py-4 text-sm text-[#526277] md:flex-row md:items-center md:justify-between">
              <p>
                Version V1 : historique réel des sessions agents, sans reconstruction artificielle
                depuis la productivité.
              </p>
              <p className="font-medium text-[#102033]">
                {selectedAgentName ? selectedAgentName : "Tous les agents"}
              </p>
            </CardContent>
          </Card>

          {isEmpty ? (
            <ReportingEmptyState message="Aucune session agent disponible sur cette période." />
          ) : (
            <>
              <KPIGrid>
                <KPICard
                  label="Agents présents"
                  value={<CountText value={metrics.distinctAgents} />}
                  caption="Nombre d'agents distincts dans l'historique."
                  icon={<Users className="h-5 w-5" />}
                  tone="navy"
                />
                <KPICard
                  label="Sessions chargées"
                  value={<CountText value={metrics.sessionsCount} />}
                  caption="Nombre total de lignes sessions-history."
                  icon={<CalendarClock className="h-5 w-5" />}
                  tone="blue"
                />
                <KPICard
                  label="Temps connecté total"
                  value={<DurationText value={metrics.totalConnectedTime} />}
                  caption="Somme des temps connectés remontés par le backend."
                  icon={<Clock3 className="h-5 w-5" />}
                  tone="teal"
                />
                <KPICard
                  label="Pauses totales"
                  value={<CountText value={metrics.totalPauses} />}
                  caption="Nombre cumulé de pauses sur les sessions chargées."
                  icon={<PauseCircle className="h-5 w-5" />}
                  tone="amber"
                />
                <KPICard
                  label="Durée totale pause"
                  value={<DurationText value={metrics.totalPauseDuration} />}
                  caption="Temps cumulé en pause sur la période."
                  icon={<Timer className="h-5 w-5" />}
                  tone="blue"
                />
                <KPICard
                  label="Temps moyen / session"
                  value={<DurationText value={metrics.averageConnectedTimePerSession} />}
                  caption="Temps connecté moyen par session chargée."
                  icon={<Clock3 className="h-5 w-5" />}
                  tone="navy"
                />
              </KPIGrid>

              <ReportingTableCard
                title="Historique des sessions"
                description="Vue tabulaire des sessions réelles remontées par GET /reporting/sessions-history."
                contentClassName="pt-0"
              >
                <TableWrapper className="shadow-none">
                  <div className="overflow-x-auto">
                    <Table>
                      <thead>
                        <tr>
                          <TableHeadCell>Agent</TableHeadCell>
                          <TableHeadCell>Date</TableHeadCell>
                          <TableHeadCell>Login</TableHeadCell>
                          <TableHeadCell>Logout</TableHeadCell>
                          <TableHeadCell>Temps connecté</TableHeadCell>
                          <TableHeadCell>Nombre de pauses</TableHeadCell>
                          <TableHeadCell>Durée pause</TableHeadCell>
                          <TableHeadCell>Statut actif</TableHeadCell>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.rowKey}>
                            <TableCell className="font-medium">
                              <div className="space-y-0.5">
                                <p>{row.agentName}</p>
                                {row.role ? (
                                  <p className="text-xs text-[#6b7e92]">{row.role}</p>
                                ) : null}
                                {row.email ? (
                                  <p className="text-xs text-[#8a9bae]">{row.email}</p>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>{toDisplayDate(row.sessionDate)}</TableCell>
                            <TableCell>{toDisplayDateTime(row.loginTime)}</TableCell>
                            <TableCell>{toDisplayDateTime(row.logoutTime)}</TableCell>
                            <TableCell>
                              <DurationText value={row.totalConnectedTime} />
                            </TableCell>
                            <TableCell>
                              <CountText value={row.pausesCount} />
                            </TableCell>
                            <TableCell>
                              <DurationText value={row.pauseDuration} />
                            </TableCell>
                            <TableCell>
                              <ActiveStatusLabel value={row.isActive} />
                            </TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </TableWrapper>
              </ReportingTableCard>
            </>
          )}
        </div>
      ) : null}
    </ReportingPageLayout>
  );
}
