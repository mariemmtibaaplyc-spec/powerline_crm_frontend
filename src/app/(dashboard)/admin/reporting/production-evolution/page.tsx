"use client";

import {
  CalendarRange,
  PhoneCall,
  Target,
  TrendingUp,
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
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { useProductionEvolutionReporting } from "@/features/reporting/hooks/use-production-evolution-reporting";
import { formatReportingDate, formatReportingDateRange } from "@/features/reporting/lib/date-range";
import { formatReportingPercentage } from "@/features/reporting/lib/formatters";
import type {
  ReportingProductionEvolutionParams,
  ReportingProductionEvolutionPoint,
} from "@/types/reporting.types";

const INTERVAL_OPTIONS = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
] as const;

function formatPeriodLabel(value: string, interval: ReportingProductionEvolutionParams["interval"]) {
  if (interval === "month") {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (interval === "week") {
    return `Semaine du ${formatReportingDate(value)}`;
  }

  return formatReportingDate(value);
}

function buildChartPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${point.y}`;
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function ProductionCallsChart({
  rows,
  interval,
}: {
  rows: ReportingProductionEvolutionPoint[];
  interval: ReportingProductionEvolutionParams["interval"];
}) {
  const width = 760;
  const height = 220;
  const padding = { top: 18, right: 18, bottom: 36, left: 18 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxCalls = Math.max(...rows.map((row) => row.total_calls), 1);

  const points = rows.map((row, index) => {
    const x =
      padding.left +
      (rows.length === 1 ? chartWidth / 2 : (index / (rows.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (row.total_calls / maxCalls) * chartHeight;

    return {
      ...row,
      x,
      y,
    };
  });

  const areaPath = `${buildChartPath(points)} L ${points.at(-1)?.x ?? padding.left} ${
    height - padding.bottom
  } L ${points[0]?.x ?? padding.left} ${height - padding.bottom} Z`;
  const linePath = buildChartPath(points);

  return (
    <ReportingTableCard
      title="Evolution des appels"
      description="Visualisation légère de l'évolution des appels sur la période sélectionnée."
      contentClassName="space-y-4"
    >
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] min-w-[640px] w-full"
          role="img"
          aria-label="Evolution des appels par période"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * ratio;

            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e8eef5"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill="rgba(47, 111, 203, 0.12)" />
          <path
            d={linePath}
            fill="none"
            stroke="#2f6fcb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={`${point.date}-${point.total_calls}`}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#2f6fcb" />
              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                className="fill-[#37506d] text-[11px] font-medium"
              >
                {point.total_calls}
              </text>
              <text
                x={point.x}
                y={height - 14}
                textAnchor="middle"
                className="fill-[#6b7e92] text-[10px]"
              >
                {interval === "month"
                  ? point.date.slice(5)
                  : interval === "week"
                    ? point.date.slice(5)
                    : point.date.slice(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {rows.slice(-3).map((row) => (
          <div
            key={row.date}
            className="rounded-[1.1rem] border border-[#e5edf5] bg-[#fbfdff] px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-[#7b8ea3]">
              {formatPeriodLabel(row.date, interval)}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#102033]">{row.total_calls}</p>
            <p className="text-sm text-[#526277]">appels sur la période</p>
          </div>
        ))}
      </div>
    </ReportingTableCard>
  );
}

export default function Page() {
  const { productionEvolutionData, isLoading, error, loadProductionEvolution } =
    useProductionEvolutionReporting();
  const {
    campaigns,
    campaignsError,
    hasLoadedCampaigns,
    isLoadingCampaigns,
    loadCampaigns,
  } = useCampaigns();
  const [filters, setFilters] = useState<ReportingProductionEvolutionParams>({
    from: "",
    to: "",
    campaign_id: "",
    interval: "day",
  });

  useEffect(() => {
    void loadProductionEvolution({ interval: "day" }).catch(() => undefined);
  }, [loadProductionEvolution]);

  useEffect(() => {
    if (!hasLoadedCampaigns) {
      void loadCampaigns().catch(() => undefined);
    }
  }, [hasLoadedCampaigns, loadCampaigns]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loadProductionEvolution(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters: ReportingProductionEvolutionParams = {
      from: "",
      to: "",
      campaign_id: "",
      interval: "day",
    };

    setFilters(nextFilters);

    try {
      await loadProductionEvolution(nextFilters);
    } catch {
      return;
    }
  }

  const rows = productionEvolutionData ?? [];
  const selectedCampaignName = useMemo(() => {
    const selectedCampaignId = filters.campaign_id?.trim();

    if (!selectedCampaignId) {
      return null;
    }

    return campaigns.find((campaign) => campaign.id === selectedCampaignId)?.name ?? null;
  }, [campaigns, filters.campaign_id]);

  const totals = useMemo(() => {
    const totalCalls = rows.reduce((sum, row) => sum + row.total_calls, 0);
    const totalAppointments = rows.reduce((sum, row) => sum + row.total_appointments, 0);
    const totalSales = rows.reduce((sum, row) => sum + row.total_sales, 0);
    const globalConversion = totalCalls > 0 ? (totalSales / totalCalls) * 100 : 0;

    return {
      totalCalls,
      totalAppointments,
      totalSales,
      globalConversion,
      periodsCount: rows.length,
    };
  }, [rows]);

  const isEmpty = !isLoading && !error && rows.length === 0;
  const dateRangeLabel = formatReportingDateRange(undefined, filters);

  return (
    <ReportingPageLayout
      eyebrow="Admin workspace"
      title="Evolution de la production"
      description="Lecture chronologique des volumes de production agrégés par période depuis le backend reporting."
      actions={<DateRangePill value={dateRangeLabel} />}
    >
      <ReportingFilters
        description="Recharge l'évolution des appels, rendez-vous et ventes selon la période, la campagne et la granularité choisie."
        from={filters.from ?? ""}
        to={filters.to ?? ""}
        extraFields={
          <>
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
                Intervalle
              </span>
              <Select
                value={filters.interval ?? "day"}
                className="h-10 rounded-xl border-[#dce6f0] bg-white px-3 text-sm text-[#102033]"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    interval: event.target.value as ReportingProductionEvolutionParams["interval"],
                  }))
                }
              >
                {INTERVAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </>
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
        <ReportingLoadingState message="Chargement de l'evolution de la production..." />
      ) : null}

      {!isLoading && !error && !campaignsError ? (
        <div className="space-y-6">
          <Card className="border border-[#dce6f0] bg-white/95 shadow-none">
            <CardContent className="flex flex-col gap-2 py-4 text-sm text-[#526277] md:flex-row md:items-center md:justify-between">
              <p>
                Version V1 : évolution agrégée par période. Les ventes, RDV et conversions
                dépendent des données actuellement présentes en base.
              </p>
              <p className="font-medium text-[#102033]">
                {selectedCampaignName ? `Campagne: ${selectedCampaignName}` : "Toutes les campagnes"}
              </p>
            </CardContent>
          </Card>

          {isEmpty ? (
            <ReportingEmptyState message="Aucune donnée de production disponible sur cette période." />
          ) : (
            <>
              <KPIGrid className="xl:grid-cols-5">
                <KPICard
                  label="Total appels"
                  value={<CountText value={totals.totalCalls} />}
                  caption="Somme des appels sur la période"
                  icon={<PhoneCall className="h-5 w-5" />}
                  tone="navy"
                />
                <KPICard
                  label="Total RDV"
                  value={<CountText value={totals.totalAppointments} />}
                  caption="Rendez-vous agrégés retournés par l'API"
                  icon={<CalendarRange className="h-5 w-5" />}
                  tone="blue"
                />
                <KPICard
                  label="Total ventes"
                  value={<CountText value={totals.totalSales} />}
                  caption="Ventes confirmées observées"
                  icon={<TrendingUp className="h-5 w-5" />}
                  tone="teal"
                />
                <KPICard
                  label="Conversion globale"
                  value={<PercentText value={totals.globalConversion} />}
                  caption="Ventes confirmées / appels"
                  icon={<Target className="h-5 w-5" />}
                  tone="amber"
                />
                <KPICard
                  label="Nombre de périodes"
                  value={<CountText value={totals.periodsCount} />}
                  caption="Points chronologiques retournés"
                  icon={<Users className="h-5 w-5" />}
                  tone="navy"
                />
              </KPIGrid>

              <ProductionCallsChart rows={rows} interval={filters.interval ?? "day"} />

              <ReportingTableCard
                title="Historique chronologique"
                description="Tableau détaillé de l'évolution retournée par le backend, sans extrapolation."
                contentClassName="pt-0"
              >
                <TableWrapper className="border-0 shadow-none">
                  <Table>
                    <thead>
                      <tr>
                        <TableHeadCell>Date</TableHeadCell>
                        <TableHeadCell>Appels</TableHeadCell>
                        <TableHeadCell>RDV</TableHeadCell>
                        <TableHeadCell>Ventes</TableHeadCell>
                        <TableHeadCell>Conversion</TableHeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.date}>
                          <TableCell className="font-medium">
                            {formatPeriodLabel(row.date, filters.interval ?? "day")}
                          </TableCell>
                          <TableCell>{row.total_calls}</TableCell>
                          <TableCell>{row.total_appointments}</TableCell>
                          <TableCell>{row.total_sales}</TableCell>
                          <TableCell>{formatReportingPercentage(row.conversion_rate)}</TableCell>
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
