"use client";

import { CalendarCheck2, CalendarClock, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SALES_STATUS_OPTIONS } from "@/features/admin-sales/mocks/admin-sales.mock";
import { useAdminSales } from "@/features/admin-sales/hooks/use-admin-sales";
import { SalesTable } from "@/components/admin-sales/sales-table";
import type { SalesAppointmentStatus } from "@/types/appointment.types";

function formatToday() {
  const value = new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrentMonth() {
  const value = new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDisplayMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function SalesModule({
  workspace = "admin",
}: {
  workspace?: "admin" | "supervisor";
}) {
  const today = formatToday();
  const currentMonth = formatCurrentMonth();
  const [periodMode, setPeriodMode] = useState<"day" | "month">("day");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [agentFilter, setAgentFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SalesAppointmentStatus>("all");
  const [search, setSearch] = useState("");

  const apiFilters = useMemo(
    () => ({
      periodMode,
      selectedDate,
      selectedMonth,
      agentFilter,
      campaignFilter,
      statusFilter,
    }),
    [agentFilter, campaignFilter, periodMode, selectedDate, selectedMonth, statusFilter],
  );

  const { salesAppointments, agents, campaigns, loading, error } = useAdminSales(apiFilters, workspace);

  const teams = useMemo(
    () => Array.from(new Set(agents.map((item) => item.team))).sort((left, right) => left.localeCompare(right)),
    [agents],
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return salesAppointments.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.clientName.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.agentName.toLowerCase().includes(query) ||
        item.campaign.toLowerCase().includes(query) ||
        item.note.toLowerCase().includes(query);

      const matchesTeam = teamFilter === "all" || item.team === teamFilter;

      return matchesSearch && matchesTeam;
    });
  }, [salesAppointments, search, teamFilter]);

  const displayedPeriodLabel = useMemo(() => {
    if (periodMode === "day") {
      return selectedDate === today ? "Aujourd'hui" : formatDisplayDate(selectedDate);
    }

    return formatDisplayMonth(selectedMonth);
  }, [periodMode, selectedDate, selectedMonth, today]);

  const kpis = useMemo(() => {
    const scheduled = filteredAppointments.filter((item) => item.status === "SCHEDULED").length;
    const done = filteredAppointments.filter((item) => item.status === "DONE").length;
    const periodCount =
      periodMode === "day"
        ? filteredAppointments.filter((item) => item.date === selectedDate).length
        : filteredAppointments.length;
    const agentsWithAppointment = new Set(filteredAppointments.map((item) => item.agentId)).size;

    return {
      total: filteredAppointments.length,
      periodCount,
      scheduled,
      done,
      agentsWithAppointment,
    };
  }, [filteredAppointments, periodMode, selectedDate]);

  const perAgent = useMemo(() => {
    return Array.from(
      filteredAppointments.reduce((map, item) => {
        const current = map.get(item.agentId);
        map.set(item.agentId, {
          agentName: item.agentName,
          team: item.team,
          count: (current?.count ?? 0) + 1,
        });
        return map;
      }, new Map<string, { agentName: string; team: string; count: number }>()),
    )
      .map(([, value]) => value)
      .sort((left, right) => right.count - left.count || left.agentName.localeCompare(right.agentName));
  }, [filteredAppointments]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Rendez-vous"
        description="Suivi operationnel des rendez-vous programmes dans le CRM, avec filtres actifs relies au backend et detail par agent."
      />

      <div className="grid gap-4 xl:grid-cols-5">
        {[
          {
            label: "Total RDV",
            value: kpis.total,
            note: "Vue consolidee",
            tone: "bg-[linear-gradient(135deg,#eef5ff_0%,#ffffff_100%)] text-[#295086]",
            icon: CalendarCheck2,
          },
          {
            label: periodMode === "day" ? "RDV aujourd'hui" : "RDV du mois",
            value: kpis.periodCount,
            note: periodMode === "day" ? "Journee selectionnee" : "Mois selectionne",
            tone: "bg-[linear-gradient(135deg,#effbf5_0%,#ffffff_100%)] text-[#15795d]",
            icon: CalendarClock,
          },
          {
            label: "RDV planifies",
            value: kpis.scheduled,
            note: "Statut SCHEDULED",
            tone: "bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] text-[#a76b18]",
            icon: CalendarClock,
          },
          {
            label: "RDV realises",
            value: kpis.done,
            note: "Statut DONE",
            tone: "bg-[linear-gradient(135deg,#eefbf7_0%,#ffffff_100%)] text-[#15795d]",
            icon: CalendarCheck2,
          },
          {
            label: "Agents actifs",
            value: kpis.agentsWithAppointment,
            note: "Avec au moins 1 RDV",
            tone: "bg-[linear-gradient(135deg,#f5f1ff_0%,#ffffff_100%)] text-[#5c4cb0]",
            icon: Users,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-[1.5rem] border border-[#dce6f0] p-5 shadow-[0_18px_42px_rgba(20,32,53,0.08)] ${item.tone}`}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-current/70">
                  LIVE
                </span>
              </div>
              <div className="mt-5 space-y-1">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-current/70">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold text-[#102033]">{item.value}</p>
                <p className="text-sm text-[#607287]">{item.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-3 xl:grid-cols-[1.15fr_140px_180px_repeat(3,180px)]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8da3]" />
              <Input
                value={search}
                className="pl-11"
                placeholder="Rechercher client, agent, campagne ou numero..."
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <Select
              value={periodMode}
              onChange={(event) => setPeriodMode(event.target.value as "day" | "month")}
            >
              <option value="day">Jour</option>
              <option value="month">Mois</option>
            </Select>
            {periodMode === "day" ? (
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            ) : (
              <Input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            )}
            <Select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)}>
              <option value="all">Tous les agents</option>
              {agents.map((agent) => (
                <option key={`${agent.id}-${agent.label}`} value={agent.id}>
                  {agent.label}
                </option>
              ))}
            </Select>
            <Select
              value={campaignFilter}
              onChange={(event) => setCampaignFilter(event.target.value)}
            >
              <option value="all">Toutes les campagnes</option>
              {campaigns.map((campaign) => (
                <option key={`${campaign.id}-${campaign.label}`} value={campaign.id}>
                  {campaign.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | SalesAppointmentStatus)
              }
            >
              <option value="all">Tous les statuts</option>
              {SALES_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#607287]">
                <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
                  {filteredAppointments.length} RDV affiches
                </span>
                <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
                  Periode affichee : {displayedPeriodLabel}
                </span>
                {teamFilter !== "all" ? (
                  <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#24415d]">
                    Equipe : {teamFilter}
                  </span>
                ) : null}
                {loading ? (
                  <span className="rounded-full border border-[#e6edf6] bg-[#fbfdff] px-3 py-1.5 font-medium text-[#607287]">
                    Synchronisation backend...
                  </span>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-[1.2rem] border border-[#f2cbd5] bg-[#fff7fa] px-4 py-6 text-sm text-[#9b3554]">
                  {error}
                </div>
              ) : (
                <SalesTable
                  items={filteredAppointments}
                  basePath={workspace === "supervisor" ? "/supervisor/sales" : "/admin/sales"}
                />
              )}
            </div>

            <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)] shadow-[0_18px_42px_rgba(20,32,53,0.06)]">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#6c7f93]">
                    Synthese par agent
                  </p>
                  <h2 className="text-lg font-semibold text-[#102033]">
                    RDV pris par agent
                  </h2>
                  <p className="text-sm leading-6 text-[#607287]">
                    Vue backend consolidee des agents qui alimentent le plus le volume de rendez-vous.
                  </p>
                </div>

                <Select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
                  <option value="all">Toutes les equipes</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </Select>

                <div className="space-y-3">
                  {perAgent.length > 0 ? (
                    perAgent.map((item) => (
                      <div
                        key={`${item.agentName}-${item.team}`}
                        className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(20,32,53,0.04)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold text-[#102033]">{item.agentName}</p>
                            <p className="text-sm text-[#607287]">{item.team}</p>
                          </div>
                          <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-[#eef5ff] px-3 py-1 text-sm font-semibold text-[#295086]">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-[#d7e2ee] bg-white px-4 py-8 text-center text-sm text-[#607287]">
                      Aucun rendez-vous ne correspond aux filtres selectionnes.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
