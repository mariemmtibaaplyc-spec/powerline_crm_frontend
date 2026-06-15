"use client";

import {
  AlertCircle,
  BarChart3,
  CalendarCheck2,
  CalendarRange,
  DollarSign,
  PhoneCall,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatsCard } from "@/components/reporting/stats-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";
import { useReporting } from "@/features/reporting/hooks/use-reporting";
import type {
  ReportingDashboardData,
  ReportingDashboardParams,
  ReportingPrimitive,
  ReportingValue,
} from "@/types/reporting.types";

type ReportingRecord = Record<string, ReportingValue | undefined>;

interface MetricItem {
  key: string;
  label: string;
  value: ReportingPrimitive;
}

interface TopAgentRow {
  name: string;
  calls?: ReportingPrimitive;
  completedCalls?: ReportingPrimitive;
  averageDuration?: ReportingPrimitive;
  conversionRate?: ReportingPrimitive;
}

interface TopCampaignRow {
  name: string;
  calls?: ReportingPrimitive;
  averageDuration?: ReportingPrimitive;
  performance?: ReportingPrimitive;
}

const metricSectionConfig: Array<{
  key: keyof ReportingDashboardData;
  title: string;
  description: string;
}> = [
  {
    key: "calls",
    title: "Calls",
    description: "Volumetrie et qualite de traitement des appels.",
  },
  {
    key: "conversion",
    title: "Conversion",
    description: "Lecture du taux de transformation et des performances associees.",
  },
  {
    key: "funnel",
    title: "Funnel",
    description: "Parcours global du lead jusqu'a la vente.",
  },
  {
    key: "agents",
    title: "Agents",
    description: "Synthese des indicateurs lies aux agents.",
  },
  {
    key: "appointments",
    title: "Rendez-vous",
    description: "Suivi des rendez-vous planifies ou qualifies.",
  },
  {
    key: "leads",
    title: "Leads",
    description: "Qualite et disponibilite du stock de leads.",
  },
];

const statusKeywords = [
  "status",
  "statut",
  "state",
  "etat",
  "result",
  "resultat",
];
const durationKeywords = [
  "duration",
  "duree",
  "time",
  "temps",
  "talk",
  "communication",
  "wait",
  "attente",
  "pause",
  "handle",
];
const percentageKeywords = [
  "rate",
  "ratio",
  "percent",
  "percentage",
  "conversion",
  "performance",
  "success",
  "occupancy",
  "completion",
  "reachability",
  "joignabilite",
];
const amountKeywords = [
  "amount",
  "revenue",
  "sale_value",
  "sales_amount",
  "chiffre",
  "montant",
  "price",
];
const dateKeywords = [
  "date",
  "day",
  "month",
  "year",
  "from",
  "to",
  "at",
  "created",
  "updated",
  "period",
];
const countKeywords = [
  "call",
  "appel",
  "lead",
  "appointment",
  "meeting",
  "rdv",
  "sale",
  "vente",
  "count",
  "total",
  "volume",
];

function isPrimitive(value: ReportingValue | undefined): value is ReportingPrimitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isRecord(value: ReportingValue | undefined): value is ReportingRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function matchesKeyword(key: string, keywords: string[]) {
  const normalized = normalizeKey(key);
  return keywords.some((keyword) => normalized.includes(normalizeKey(keyword)));
}

function getKeySegments(key: string) {
  return key
    .split(/[._\s-]+/)
    .map((segment) => normalizeKey(segment))
    .filter(Boolean);
}

function hasSegment(key: string, candidate: string) {
  const normalizedCandidate = normalizeKey(candidate);
  return getKeySegments(key).includes(normalizedCandidate);
}

function parseNumericValue(value: ReportingPrimitive) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value.trim().replace(",", ".");

  if (!sanitized) {
    return null;
  }

  const numeric = Number(sanitized.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function scoreMetricAliasMatch(metricKey: string, alias: string) {
  const normalizedKey = normalizeKey(metricKey);
  const normalizedAlias = normalizeKey(alias);
  const segments = getKeySegments(metricKey);

  if (!normalizedAlias) {
    return -1;
  }

  if (normalizedKey === normalizedAlias) {
    return 500;
  }

  const lastSegment = segments[segments.length - 1];
  if (lastSegment === normalizedAlias) {
    return 450;
  }

  if (segments.includes(normalizedAlias)) {
    return 400;
  }

  if (normalizedKey.endsWith(normalizedAlias)) {
    return 300;
  }

  if (normalizedKey.includes(normalizedAlias)) {
    return 200;
  }

  return -1;
}

function formatPercentageValue(rawValue: number) {
  const percentage = Math.abs(rawValue) <= 1 ? rawValue * 100 : rawValue;
  return `${percentage.toLocaleString("fr-FR", {
    minimumFractionDigits: percentage % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  })}%`;
}

function formatDurationFromSeconds(totalSeconds: number) {
  const rounded = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }

  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}

function formatDurationString(value: string) {
  const match = value.trim().match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return value;
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const third = match[3] ? Number(match[3]) : null;

  if (third === null) {
    return `${first} min ${String(second).padStart(2, "0")} s`;
  }

  return formatDurationFromSeconds(first * 3600 + second * 60 + third);
}

function formatDateString(value: string) {
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

function formatCountValue(value: number) {
  return value.toLocaleString("fr-FR");
}

function formatAmountValue(value: number) {
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatCallsValue(value: number) {
  return `${formatCountValue(value)} appels`;
}

function getMetricFormat(key: string) {
  const normalized = normalizeKey(key);

  if (
    normalized.includes("avgdurationseconds") ||
    normalized.includes("totaldurationseconds") ||
    normalized.includes("maxdurationseconds") ||
    matchesKeyword(key, durationKeywords)
  ) {
    return "duration" as const;
  }

  if (
    normalized.includes("conversionratepct") ||
    normalized.includes("completionratepct") ||
    normalized.includes("showratepct") ||
    (matchesKeyword(key, percentageKeywords) &&
      !normalized.includes("completedcalls") &&
      !normalized.endsWith("completed"))
  ) {
    return "percentage" as const;
  }

  if (
    normalized.includes("completedcalls") ||
    normalized.includes("callscompleted") ||
    normalized.includes("answeredcalls") ||
    normalized.includes("totalsales") ||
    normalized.includes("salecount") ||
    normalized.includes("totalleads") ||
    normalized.includes("leadstotal")
  ) {
    return "count" as const;
  }

  if (
    normalized.includes("totalamount") ||
    normalized.includes("confirmedamount") ||
    normalized.includes("avgsaleamount") ||
    hasSegment(key, "ca") ||
    matchesKeyword(key, amountKeywords)
  ) {
    return "amount" as const;
  }

  if (
    hasSegment(key, "calls") ||
    hasSegment(key, "appels") ||
    normalized.endsWith("totalcalls") ||
    normalized.endsWith("callcount")
  ) {
    return "calls" as const;
  }

  if (
    matchesKeyword(key, countKeywords) ||
    hasSegment(key, "count")
  ) {
    return "count" as const;
  }

  if (matchesKeyword(key, dateKeywords)) {
    return "date" as const;
  }

  return "default" as const;
}

function formatPrimitiveValue(key: string, value: ReportingPrimitive) {
  if (value === null) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  const metricFormat = getMetricFormat(key);

  if (typeof value === "number") {
    if (metricFormat === "duration") {
      return formatDurationFromSeconds(value);
    }

    if (metricFormat === "percentage") {
      return formatPercentageValue(value);
    }

    if (metricFormat === "amount") {
      return formatAmountValue(value);
    }

    if (metricFormat === "calls") {
      return formatCallsValue(value);
    }

    if (metricFormat === "count") {
      return formatCountValue(value);
    }

    return formatCountValue(value);
  }

  if (metricFormat === "duration") {
    return formatDurationString(value);
  }

  if (metricFormat === "date") {
    return formatDateString(value);
  }

  const numeric = parseNumericValue(value);

  if (numeric !== null && metricFormat === "percentage") {
    return formatPercentageValue(numeric);
  }

  if (numeric !== null && metricFormat === "amount") {
    return formatAmountValue(numeric);
  }

  if (numeric !== null && metricFormat === "calls") {
    return formatCallsValue(numeric);
  }

  if (numeric !== null && metricFormat === "count") {
    return formatCountValue(numeric);
  }

  return value;
}

function statusTone(value: string) {
  const normalized = value.toLowerCase();

  if (
    normalized.includes("success") ||
    normalized.includes("vente") ||
    normalized.includes("won") ||
    normalized.includes("active") ||
    normalized.includes("confirme")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("pending") ||
    normalized.includes("pause") ||
    normalized.includes("attente")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized.includes("failed") ||
    normalized.includes("error") ||
    normalized.includes("inactive") ||
    normalized.includes("perdu")
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-[#d9e7f7] bg-[#f5f9ff] text-[#295086]";
}

function PrimitiveBadge({ metricKey, value }: { metricKey: string; value: ReportingPrimitive }) {
  if (typeof value !== "string" || !matchesKeyword(metricKey, statusKeywords)) {
    return (
      <span className="text-sm font-medium text-[#102033]">
        {formatPrimitiveValue(metricKey, value)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(value)}`}
    >
      {formatPrimitiveValue(metricKey, value)}
    </span>
  );
}

function collectPrimitiveMetrics(
  value: ReportingValue | undefined,
  path: string[] = [],
  depth = 0,
): MetricItem[] {
  if (value === undefined) {
    return [];
  }

  if (isPrimitive(value)) {
    const label = path.length > 0 ? formatLabel(path[path.length - 1] ?? "Valeur") : "Valeur";
    return [
      {
        key: path.join("."),
        label,
        value,
      },
    ];
  }

  if (Array.isArray(value)) {
    if (value.every((item) => isPrimitive(item))) {
      return value.map((item, index) => ({
        key: [...path, String(index)].join("."),
        label: `${formatLabel(path[path.length - 1] ?? "Valeur")} ${index + 1}`,
        value: item,
      }));
    }

    return [
      {
        key: [...path, "count"].join("."),
        label: `${formatLabel(path[path.length - 1] ?? "Elements")} total`,
        value: value.length,
      },
    ];
  }

  if (depth > 2) {
    return [];
  }

  return Object.entries(value).flatMap(([key, entryValue]) =>
    collectPrimitiveMetrics(entryValue, [...path, key], depth + 1),
  );
}

function dedupeMetrics(metrics: MetricItem[]) {
  const seen = new Set<string>();

  return metrics.filter((metric) => {
    if (seen.has(metric.key)) {
      return false;
    }

    seen.add(metric.key);
    return true;
  });
}

function getSectionMetrics(value: ReportingValue | undefined, limit = 6) {
  return dedupeMetrics(collectPrimitiveMetrics(value)).slice(0, limit);
}

function pickValueByAliases(
  source: ReportingValue | undefined,
  aliases: string[],
): ReportingPrimitive | undefined {
  const metrics = collectPrimitiveMetrics(source);
  let bestMatch: MetricItem | undefined;
  let bestScore = -1;

  for (const [aliasIndex, alias] of aliases.entries()) {
    for (const metric of metrics) {
      const score = scoreMetricAliasMatch(metric.key, alias);

      if (score < 0) {
        continue;
      }

      const weightedScore = score - aliasIndex;
      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestMatch = metric;
      }
    }
  }

  return bestMatch?.value;
}

function getDisplayText(
  source: ReportingValue | undefined,
  aliases: string[],
  fallback: string,
) {
  const value = pickValueByAliases(source, aliases);

  if (value === undefined || value === null) {
    return fallback;
  }

  return formatPrimitiveValue(aliases[0] ?? fallback, value);
}

function toRecordArray(value: ReportingValue | undefined): ReportingRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  const arrayContainerAliases = ["items", "rows", "data", "agents", "campaigns", "results", "list"];

  for (const alias of arrayContainerAliases) {
    const nested = value[alias];
    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
    }
  }

  const nestedObjectValues = Object.values(value).filter(isRecord);
  if (nestedObjectValues.length > 0) {
    return nestedObjectValues;
  }

  return [];
}

function buildTopAgentsRows(value: ReportingValue | undefined): TopAgentRow[] {
  return toRecordArray(value)
    .map((record) => ({
      name:
        String(
          pickValueByAliases(record, [
            "agent_name",
            "name",
            "full_name",
            "username",
            "agent",
          ]) ?? "Agent",
        ),
      calls: pickValueByAliases(record, ["total_calls", "call_count", "calls", "appels"]),
      completedCalls: pickValueByAliases(record, [
        "completed_calls",
        "calls_completed",
        "answered_calls",
      ]),
      averageDuration: pickValueByAliases(record, [
        "avg_duration",
        "average_duration",
        "duration_avg",
        "duree_moyenne",
        "average_call_duration",
      ]),
      conversionRate: pickValueByAliases(record, [
        "conversion_rate",
        "taux_conversion",
        "conversion",
        "performance",
      ]),
    }))
    .filter((row) => row.name !== "Agent" || row.calls !== undefined || row.completedCalls !== undefined);
}

function buildTopCampaignRows(value: ReportingValue | undefined): TopCampaignRow[] {
  return toRecordArray(value)
    .map((record) => ({
      name:
        String(
          pickValueByAliases(record, [
            "campaign_name",
            "campaign",
            "name",
            "title",
          ]) ?? "Campagne",
        ),
      calls: pickValueByAliases(record, ["total_calls", "call_count", "calls", "appels"]),
      averageDuration: pickValueByAliases(record, [
        "avg_duration",
        "average_duration",
        "duration_avg",
        "duree_moyenne",
      ]),
      performance: pickValueByAliases(record, [
        "performance",
        "conversion_rate",
        "taux_conversion",
        "rate",
      ]),
    }))
    .filter((row) => row.name !== "Campagne" || row.calls !== undefined || row.performance !== undefined);
}

function formatDateRange(period: ReportingValue | undefined) {
  const from = pickValueByAliases(period, ["from", "start_date", "start", "date_from"]);
  const to = pickValueByAliases(period, ["to", "end_date", "end", "date_to"]);

  if (typeof from === "string" && typeof to === "string") {
    return `${formatDateString(from)} - ${formatDateString(to)}`;
  }

  return "Periode courante";
}

function MetricGrid({
  title,
  description,
  metrics,
}: {
  title: string;
  description: string;
  metrics: MetricItem[];
}) {
  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.key}
                className="rounded-[1.25rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3"
              >
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                  {metric.label}
                </p>
                <div className="mt-2">
                  <PrimitiveBadge metricKey={metric.key} value={metric.value} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#607287]">Aucune metrique exploitable retournee.</p>
        )}
      </CardContent>
    </Card>
  );
}

function RankingTable({
  title,
  description,
  headers,
  rows,
}: {
  title: string;
  description: string;
  headers: string[];
  rows: Array<Array<{ key: string; value: ReportingPrimitive | string | undefined }>>;
}) {
  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <TableWrapper className="shadow-none">
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <TableHeadCell key={header}>{header}</TableHeadCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {row.map((cell) => (
                        <TableCell key={`${index}-${cell.key}`}>
                          {cell.value === undefined ? (
                            <span className="text-[#7b8da0]">—</span>
                          ) : isPrimitive(cell.value) ? (
                            <PrimitiveBadge metricKey={cell.key} value={cell.value} />
                          ) : (
                            <span className="text-sm font-medium text-[#102033]">
                              {String(cell.value)}
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </TableWrapper>
        ) : (
          <p className="text-sm text-[#607287]">Aucune donnee classee disponible.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const { dashboardData, isLoading, error, loadDashboard } = useReporting();
  const [filters, setFilters] = useState<ReportingDashboardParams>({
    from: "",
    to: "",
  });

  useEffect(() => {
    void loadDashboard().catch(() => undefined);
  }, [loadDashboard]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loadDashboard(filters);
    } catch {
      return;
    }
  }

  async function handleReset() {
    const nextFilters = { from: "", to: "" };
    setFilters(nextFilters);

    try {
      await loadDashboard();
    } catch {
      return;
    }
  }

  const topAgentsRows = useMemo(
    () => buildTopAgentsRows(dashboardData?.top_agents),
    [dashboardData?.top_agents],
  );
  const topCampaignRows = useMemo(
    () => buildTopCampaignRows(dashboardData?.top_campaigns),
    [dashboardData?.top_campaigns],
  );

  const funnelCards = useMemo(
    () => [
      {
        label: "Leads",
        value: getDisplayText(
          dashboardData?.funnel ?? dashboardData?.leads,
          ["leads", "lead_count", "total_leads", "count"],
          "—",
        ),
        caption: "Volume de leads suivi sur la periode.",
        icon: <Users className="h-5 w-5" />,
        tone: "blue" as const,
      },
      {
        label: "Calls",
        value: getDisplayText(
          dashboardData?.funnel ?? dashboardData?.calls,
          ["total_calls", "call_count", "calls", "appels"],
          "—",
        ),
        caption: "Interactions telephoniques detectees.",
        icon: <PhoneCall className="h-5 w-5" />,
        tone: "navy" as const,
      },
      {
        label: "Rendez-vous",
        value: getDisplayText(
          dashboardData?.funnel ?? dashboardData?.appointments,
          ["appointments", "rdv", "meetings", "appointment_count", "count"],
          "—",
        ),
        caption: "Rendez-vous qualifies ou planifies.",
        icon: <CalendarCheck2 className="h-5 w-5" />,
        tone: "teal" as const,
      },
      {
        label: "Ventes",
        value: getDisplayText(
          dashboardData?.funnel ?? dashboardData?.sales,
          ["sales", "vente", "sales_count", "count", "total_sales"],
          "—",
        ),
        caption: "Transformation finale du funnel.",
        icon: <DollarSign className="h-5 w-5" />,
        tone: "amber" as const,
      },
      {
        label: "Conversion globale",
        value: getDisplayText(
          dashboardData?.conversion ?? dashboardData?.funnel,
          ["conversion_rate", "taux_conversion", "conversion", "rate", "performance"],
          "—",
        ),
        caption: "Lecture consolidee du taux de conversion.",
        icon: <Target className="h-5 w-5" />,
        tone: "blue" as const,
      },
    ],
    [dashboardData],
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Rapports"
        description="Dashboard global CRM branche au backend reporting, avec une lecture metier plus claire des appels, de la conversion, des campagnes et des agents."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <BarChart3 className="h-4 w-4 text-[#2d6fcb]" />
              Vue globale
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#eef5fb] px-3 py-2 text-sm font-medium text-[#295086]">
              <CalendarRange className="h-4 w-4" />
              {formatDateRange(dashboardData?.period)}
            </span>
          </>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Recharge du dashboard global sur la plage de dates souhaitee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]"
            onSubmit={handleSubmit}
          >
            <label className="space-y-2">
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                From
              </span>
              <Input
                type="date"
                value={filters.from ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    from: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-2">
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                To
              </span>
              <Input
                type="date"
                value={filters.to ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    to: event.target.value,
                  }))
                }
              />
            </label>

            <Button className="mt-auto" type="submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : "Appliquer"}
            </Button>

            <Button
              className="mt-auto"
              type="button"
              variant="ghost"
              disabled={isLoading}
              onClick={() => {
                void handleReset();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border border-[#f3d1cb] bg-[#fff8f6] shadow-none">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="mt-0.5 h-5 w-5 text-[#c45f2d]" />
            <div className="space-y-1">
              <p className="font-medium text-[#8a3e24]">Chargement impossible</p>
              <p className="text-sm text-[#9e5a3a]">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading && !dashboardData ? (
        <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
          <CardContent className="py-12">
            <p className="text-sm text-[#607287]">
              Chargement du dashboard reporting...
            </p>
          </CardContent>
        </Card>
      ) : null}

      {dashboardData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {funnelCards.map((card) => (
              <StatsCard
                key={card.label}
                label={card.label}
                value={card.value}
                caption={card.caption}
                icon={card.icon}
                tone={card.tone}
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {metricSectionConfig.map((section) => (
              <MetricGrid
                key={section.key}
                title={section.title}
                description={section.description}
                metrics={getSectionMetrics(dashboardData[section.key], section.key === "funnel" ? 5 : 6)}
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <RankingTable
              title="Top agents"
              description="Vue operationnelle des meilleurs agents sans exposer la structure technique brute du backend."
              headers={[
                "Agent",
                "Appels",
                "Appels completes",
                "Duree moyenne",
                "Taux conversion",
              ]}
              rows={topAgentsRows.map((row) => [
                { key: "agent_name", value: row.name },
                { key: "calls", value: row.calls },
                { key: "completed_calls", value: row.completedCalls },
                { key: "avg_duration", value: row.averageDuration },
                { key: "conversion_rate", value: row.conversionRate },
              ])}
            />

            <RankingTable
              title="Top campagnes"
              description="Campagnes les plus visibles dans le reporting, avec lecture rapide de la volumetrie et de la performance."
              headers={["Campagne", "Appels", "Duree moyenne", "Performance"]}
              rows={topCampaignRows.map((row) => [
                { key: "campaign_name", value: row.name },
                { key: "calls", value: row.calls },
                { key: "avg_duration", value: row.averageDuration },
                { key: "performance", value: row.performance },
              ])}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <MetricGrid
              title="Periode"
              description="Cadre temporel applique au reporting courant."
              metrics={getSectionMetrics(dashboardData.period, 4)}
            />

            <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
              <CardHeader>
                <CardTitle>Lecture rapide</CardTitle>
                <CardDescription>
                  Synthese concise de la performance globale pour une lecture CRM plus immediate.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                    Conversion
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#102033]">
                    {getDisplayText(
                      dashboardData.conversion,
                      ["conversion_rate", "taux_conversion", "conversion", "rate"],
                      "—",
                    )}
                  </p>
                  <p className="mt-1 text-sm text-[#607287]">
                    Taux global exploitable immediatement.
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                    Appels
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#102033]">
                    {getDisplayText(
                      dashboardData.calls,
                      ["total_calls", "call_count", "calls", "appels"],
                      "—",
                    )}
                  </p>
                  <p className="mt-1 text-sm text-[#607287]">
                    Volume principal remonte par le backend.
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
                    Tendance
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[#102033]">
                    <TrendingUp className="h-4 w-4 text-[#2d6fcb]" />
                    Dashboard alimente
                  </p>
                  <p className="mt-1 text-sm text-[#607287]">
                    Les cartes ci-dessus lisent uniquement les champs backend reels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  );
}
