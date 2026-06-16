"use client";

import {
  BarChart3,
  Crown,
  Layers3,
  PhoneCall,
  PieChart,
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
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { useQualificationsStatusReporting } from "@/features/reporting/hooks/use-qualifications-status-reporting";
import { formatReportingDateRange } from "@/features/reporting/lib/date-range";
import { formatReportingPercentage } from "@/features/reporting/lib/formatters";
import { useUsers } from "@/features/users/hooks/use-users";
import type {
  ReportingDashboardParams,
  ReportingQualificationStatusItem,
} from "@/types/reporting.types";

function normalizeQualificationType(value: string | null) {
  if (!value) {
    return "NON DEFINI";
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === "POSITIVE" || normalized === "NEGATIVE" || normalized === "NEUTRAL") {
    return normalized;
  }

  return normalized || "NON DEFINI";
}

function buildTypeBreakdown(rows: ReportingQualificationStatusItem[]) {
  const breakdown = new Map<string, number>();

  for (const row of rows) {
    const key = normalizeQualificationType(row.qualification_type);
    breakdown.set(key, (breakdown.get(key) ?? 0) + row.total);
  }

  return Array.from(breakdown.entries())
    .map(([type, total]) => ({
      type,
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

function TypeBreakdownCard({
  rows,
  totalQualifiedCalls,
}: {
  rows: ReportingQualificationStatusItem[];
  totalQualifiedCalls: number;
}) {
  const breakdown = buildTypeBreakdown(rows);

  return (
    <KPICard
      label="Répartition des types"
      value={
        <div className="flex flex-wrap gap-2">
          {breakdown.length > 0 ? (
            breakdown.map((item) => (
              <StatusBadge
                key={item.type}
                value={`${item.type} ${item.total}`}
                compact
              />
            ))
          ) : (
            <span className="text-sm text-[#7b8da0]">Aucun type détecté</span>
          )}
        </div>
      }
      caption={
        totalQualifiedCalls > 0
          ? "Répartition par type sur les appels qualifiés."
          : "Aucune qualification observée sur la période."
      }
      icon={<PieChart className="h-5 w-5" />}
      tone="blue"
    />
  );
}

function QualificationBars({
  rows,
}: {
  rows: ReportingQualificationStatusItem[];
}) {
  const topRows = rows.slice(0, 6);

  return (
    <ReportingTableCard
      title="Lecture rapide"
      description="Visualisation légère des qualifications les plus présentes sur la période."
      contentClassName="space-y-4"
    >
      <div className="space-y-4">
        {topRows.map((row) => (
          <div key={`${row.qualification_id}-${row.qualification_name}`} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-[#102033]">{row.qualification_name}</p>
                <p className="text-sm text-[#6b7e92]">
                  {normalizeQualificationType(row.qualification_type)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-[#102033]">{row.total}</p>
                <p className="text-sm text-[#6b7e92]">{formatReportingPercentage(row.percentage)}</p>
              </div>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#edf3f8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2f6fcb] via-[#4b88dc] to-[#83b3ff]"
                style={{ width: `${Math.max(4, Math.min(100, row.percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ReportingTableCard>
  );
}

export default function Page() {
  const { qualificationsStatusData, isLoading, error, loadQualificationsStatus } =
    useQualificationsStatusReporting();
  const {
    campaigns,
    campaignsError,
    hasLoadedCampaigns,
    isLoadingCampaigns,
    loadCampaigns,
  } = useCampaigns();
  const { users, hasLoadedUsers } = useUsers();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
    campaign_id: "",
    agent_id: "",
  });

  useEffect(() => {
    void loadQualificationsStatus().catch(() => undefined);
  }, [loadQualificationsStatus]);

  useEffect(() => {
    if (!hasLoadedCampaigns) {
      void loadCampaigns().catch(() => undefined);
    }
  }, [hasLoadedCampaigns, loadCampaigns]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadQualificationsStatus(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters: ReportingDashboardParams = {
      from: "",
      to: "",
      campaign_id: "",
      agent_id: "",
    };

    setFilters(nextFilters);

    try {
      await loadQualificationsStatus(nextFilters);
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

  const selectedCampaignName = useMemo(() => {
    const selectedCampaignId = filters.campaign_id?.trim();
    if (!selectedCampaignId) {
      return null;
    }

    return campaigns.find((campaign) => campaign.id === selectedCampaignId)?.name ?? null;
  }, [campaigns, filters.campaign_id]);

  const selectedAgentName = useMemo(() => {
    const selectedAgentId = filters.agent_id?.trim();
    if (!selectedAgentId) {
      return null;
    }

    return agentOptions.find((agent) => agent.id === selectedAgentId)?.name ?? null;
  }, [agentOptions, filters.agent_id]);

  const rows = qualificationsStatusData ?? [];
  const dominantQualification = rows[0] ?? null;
  const totalQualifiedCalls = rows.reduce((sum, row) => sum + row.total, 0);
  const isEmpty = !isLoading && !error && rows.length === 0;

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Etat des qualifications"
      description="Répartition globale des qualifications observées sur les appels qualifiés de la période."
      actions={<DateRangePill value={formatReportingDateRange(undefined, filters)} />}
    >
      <ReportingFilters
        description="Recharge la répartition des qualifications par plage de dates, campagne et agent."
        from={filters.from ?? ""}
        to={filters.to ?? ""}
        extraFields={
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                Campagne
              </span>
              <Select
                value={filters.campaign_id ?? ""}
                className="h-10 rounded-xl border-[#dce6f0] bg-white px-3 text-sm text-[#102033]"
                disabled={isLoadingCampaigns}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    campaign_id: event.target.value,
                  }))
                }
              >
                <option value="">Toutes les campagnes</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </label>

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
          </div>
        }
        isLoading={isLoading || isLoadingCampaigns}
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
      {campaignsError ? <ReportingErrorState message={campaignsError} /> : null}

      {isLoading ? (
        <ReportingLoadingState message="Chargement de l'etat des qualifications..." />
      ) : null}

      {!isLoading && !error && !campaignsError ? (
        <div className="space-y-6">
          <Card className="border border-[#dce6f0] bg-white/95 shadow-none">
            <CardContent className="flex flex-col gap-2 py-4 text-sm text-[#526277] md:flex-row md:items-center md:justify-between">
              <p>
                Version V1 : répartition globale des qualifications observées sur les appels
                qualifiés de la période.
              </p>
              <p className="font-medium text-[#102033]">
                {selectedCampaignName || selectedAgentName
                  ? [selectedCampaignName, selectedAgentName].filter(Boolean).join(" • ")
                  : "Toutes les campagnes • Tous les agents"}
              </p>
            </CardContent>
          </Card>

          {isEmpty ? (
            <ReportingEmptyState message="Aucune qualification observée sur cette période." />
          ) : (
            <>
              <KPIGrid className="xl:grid-cols-5">
                <KPICard
                  label="Total appels qualifiés"
                  value={<CountText value={totalQualifiedCalls} />}
                  caption="Somme de tous les appels avec qualification."
                  icon={<PhoneCall className="h-5 w-5" />}
                  tone="navy"
                />
                <KPICard
                  label="Qualifications observées"
                  value={<CountText value={rows.length} />}
                  caption="Nombre de qualifications présentes sur la période."
                  icon={<Layers3 className="h-5 w-5" />}
                  tone="blue"
                />
                <KPICard
                  label="Qualification dominante"
                  value={dominantQualification?.qualification_name ?? "—"}
                  caption="Qualification avec le volume le plus élevé."
                  icon={<Crown className="h-5 w-5" />}
                  tone="teal"
                />
                <KPICard
                  label="Part dominante"
                  value={<PercentText value={dominantQualification?.percentage ?? null} />}
                  caption="Poids de la qualification dominante."
                  icon={<BarChart3 className="h-5 w-5" />}
                  tone="amber"
                />
                <TypeBreakdownCard rows={rows} totalQualifiedCalls={totalQualifiedCalls} />
              </KPIGrid>

              <QualificationBars rows={rows} />

              <ReportingTableCard
                title="Tableau des qualifications"
                description="Vue détaillée des qualifications retournées par l'API, sans transformation métier supplémentaire."
                contentClassName="pt-0"
              >
                <TableWrapper className="border-0 shadow-none">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Qualification</TableHeadCell>
                        <TableHeadCell>Type</TableHeadCell>
                        <TableHeadCell>Total</TableHeadCell>
                        <TableHeadCell>Pourcentage</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={`${row.qualification_id}-${row.qualification_name}`}>
                          <TableCell className="font-medium">{row.qualification_name}</TableCell>
                          <TableCell>
                            <StatusBadge value={normalizeQualificationType(row.qualification_type)} compact />
                          </TableCell>
                          <TableCell>{row.total}</TableCell>
                          <TableCell>{formatReportingPercentage(row.percentage)}</TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </ReportingTableCard>
            </>
          )}
        </div>
      ) : null}
    </ReportingPageLayout>
  );
}
