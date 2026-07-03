"use client";

import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  PhoneCall,
  RefreshCw,
  TimerReset,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { campaignQualificationsApi } from "@/features/campaign-qualifications/api/campaign-qualifications.api";
import { monitoringApi, type SupervisionCampaignLiveStat, type SupervisionLiveSnapshot } from "@/features/monitoring/api/monitoring.api";
import { reportingApi } from "@/features/reporting/api/reporting.api";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "@/components/reporting/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";
import type { CampaignQualificationRecord } from "@/types/campaign-qualification.types";
import type {
  ReportingCallsOverviewData,
  ReportingDashboardData,
  ReportingProductionEvolutionPoint,
  ReportingQualificationStatusItem,
  ReportingValue,
} from "@/types/reporting.types";

type Primitive = string | number | boolean | null;
type RecordValue = Record<string, ReportingValue | undefined>;

type TopCampaignRow = {
  key: string;
  campaignId: number;
  name: string;
  calls: number;
  appointments: number;
  answerRate: number;
  abandonRate: number;
  status: string;
};

type WorkdayDescriptor = {
  key: string;
  label: string;
  date: Date;
  fromIso: string;
  toIso: string;
};

type WorkdayProductionPoint = {
  key: string;
  label: string;
  calls: number;
  appointments: number;
  answerRate: number;
};

type HourlyProductionPoint = {
  key: string;
  label: string;
  calls: number;
  appointments: number;
  total: number;
};

type DashboardState = {
  dashboard: ReportingDashboardData | null;
  production: WorkdayProductionPoint[];
  hourlyProduction: HourlyProductionPoint[];
  liveSnapshot: SupervisionLiveSnapshot | null;
  campaigns: SupervisionCampaignLiveStat[];
  topCampaignAppointments: Record<string, number>;
  qualifications: QualificationDistributionItem[];
};

type QualificationDistributionItem = {
  qualificationId: number | null;
  qualificationName: string;
  qualificationType: string | null;
  total: number;
  percentage: number;
  color: string;
};

const QUALIFICATION_COLORS = [
  "#41c6a1",
  "#4f86f7",
  "#ff9f2d",
  "#9b5de5",
  "#f45b69",
  "#14b8a6",
  "#7c3aed",
];

function isPrimitive(value: ReportingValue | undefined): value is Primitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isRecord(value: ReportingValue | undefined): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatNumber(value: number) {
  return value.toLocaleString("fr-FR");
}

function formatPercentage(value: number) {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })} %`;
}

function formatDurationSeconds(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} s`;
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function toNumber(value: Primitive | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toRecordArray(value: ReportingValue | undefined): RecordValue[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["items", "rows", "data", "campaigns", "results", "list"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
    }
  }

  return [];
}

function getMetricValue(
  source: ReportingValue | undefined,
  aliases: string[],
): Primitive | undefined {
  if (isPrimitive(source)) {
    return source;
  }

  if (Array.isArray(source) || !isRecord(source)) {
    return undefined;
  }

  for (const alias of aliases) {
    const directMatch = Object.entries(source).find(
      ([key]) => normalizeKey(key) === normalizeKey(alias),
    );

    if (directMatch && isPrimitive(directMatch[1])) {
      return directMatch[1];
    }
  }

  for (const alias of aliases) {
    const nestedMatch = Object.entries(source).find(([key]) =>
      normalizeKey(key).includes(normalizeKey(alias)),
    );

    if (nestedMatch && isPrimitive(nestedMatch[1])) {
      return nestedMatch[1];
    }
  }

  for (const nestedValue of Object.values(source)) {
    const result = getMetricValue(nestedValue, aliases);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function getMondayForDate(date: Date) {
  const today = startOfDay(date);
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  return monday;
}

function getWeekdaysForOffset(weekOffset: number) {
  const now = new Date();
  const monday = getMondayForDate(now);
  monday.setDate(monday.getDate() - weekOffset * 7);

  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven"];

  return labels.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      key: getLocalDateKey(date),
      label,
      date,
      fromIso: startOfDay(date).toISOString(),
      toIso: endOfDay(date).toISOString(),
    };
  });
}

function getAvailablePreviousWeeksInMonth() {
  const now = new Date();
  const currentMonday = getMondayForDate(now);
  const firstDayOfMonth = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const firstMondayOfCalendar = getMondayForDate(firstDayOfMonth);
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekIndex = Math.floor(
    (currentMonday.getTime() - firstMondayOfCalendar.getTime()) / millisecondsPerWeek,
  );

  return Math.min(3, Math.max(0, weekIndex));
}

function getCurrentWeekRangeLabel(days: WorkdayDescriptor[]) {
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;

  if (!first || !last) {
    return "Semaine courante";
  }

  return `${new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(first)} - ${new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(last)}`;
}

function buildTopCampaignRows(
  campaigns: SupervisionCampaignLiveStat[],
  appointmentsByCampaign: Record<string, number>,
): TopCampaignRow[] {
  return [...campaigns]
    .sort((left, right) => right.calls_today - left.calls_today)
    .map((campaign, index) => ({
      key: `campaign-${campaign.campaign_id}-${normalizeKey(campaign.campaign_name)}-${index}`,
      campaignId: campaign.campaign_id,
      name: campaign.campaign_name,
      calls: campaign.calls_today,
      appointments: appointmentsByCampaign[String(campaign.campaign_id)] ?? 0,
      answerRate: campaign.answer_rate,
      abandonRate: campaign.abandon_rate,
      status: campaign.dialer_speed_mode,
    }))
    .filter((row) => row.name.trim().length > 0);
}

function getAnswerRateFromOverview(overview: ReportingCallsOverviewData) {
  const totalCalls = isRecord(overview)
    ? toNumber(getMetricValue(overview, [
        "displayed_calls",
        "handled_calls",
        "total_calls",
        "calls",
        "call_count",
      ]))
    : null;

  const byStatus = isRecord(overview.by_status)
    ? overview.by_status
    : isRecord(overview.stats) && isRecord(overview.stats.by_status)
      ? overview.stats.by_status
      : undefined;

  if (!totalCalls || totalCalls <= 0 || !byStatus) {
    return 0;
  }

  const answered = toNumber(
    isPrimitive(byStatus.ANSWERED) ? byStatus.ANSWERED : undefined,
  ) ?? 0;
  const completed = toNumber(
    isPrimitive(byStatus.COMPLETED) ? byStatus.COMPLETED : undefined,
  ) ?? 0;

  return roundToOneDecimal(((answered + completed) / totalCalls) * 100);
}

function mapWorkdayProduction(
  days: WorkdayDescriptor[],
  production: ReportingProductionEvolutionPoint[],
  dailyOverviews: ReportingCallsOverviewData[],
) {
  const productionByDay = new Map(production.map((point) => [point.date, point]));

  return days.map((day, index) => {
    const productionPoint = productionByDay.get(day.key);
    const overview = dailyOverviews[index];

    return {
      key: day.key,
      label: day.label,
      calls: productionPoint?.total_calls ?? 0,
      appointments: productionPoint?.total_appointments ?? 0,
      answerRate: overview ? getAnswerRateFromOverview(overview) : 0,
    };
  });
}

function getTodayRange() {
  const now = new Date();
  return {
    fromIso: startOfDay(now).toISOString(),
    toIso: endOfDay(now).toISOString(),
  };
}

function getHourKey(value: string) {
  const match = value.match(/T(\d{2}):| (\d{2}):|^(\d{2})$/);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function mapHourlyProduction(
  production: ReportingProductionEvolutionPoint[],
): HourlyProductionPoint[] {
  const availableHours = production
    .map((point) => Number(getHourKey(point.date)))
    .filter((hour) => Number.isFinite(hour));
  const startHour = availableHours.length > 0 ? Math.min(8, ...availableHours) : 8;
  const endHour = availableHours.length > 0 ? Math.max(17, ...availableHours) : 17;
  const productionByHour = new Map(
    production.map((point) => [getHourKey(point.date), point]),
  );

  return Array.from({ length: endHour - startHour + 1 }, (_, index) => {
    const hour = startHour + index;
    const key = String(hour).padStart(2, "0");
    const point = productionByHour.get(key);
    const calls = point?.total_calls ?? 0;
    const appointments = point?.total_appointments ?? 0;

    return {
      key,
      label: `${key}h`,
      calls,
      appointments,
      total: calls + appointments,
    };
  });
}

function getNiceAxisMax(value: number) {
  if (value <= 0) {
    return 10;
  }

  const roughStep = value / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return step * magnitude * 5;
}

function aggregateQualificationsByActiveCampaign(
  groups: ReportingQualificationStatusItem[][],
  qualificationDefinitions: CampaignQualificationRecord[][],
) {
  const merged = new Map<string, QualificationDistributionItem>();

  for (const campaignQualifications of qualificationDefinitions) {
    for (const qualification of campaignQualifications) {
      if (qualification.isActive === false) {
        continue;
      }

      const qualificationName = qualification.name?.trim();
      if (!qualificationName) {
        continue;
      }

      const key = normalizeKey(qualificationName);
      if (!merged.has(key)) {
        merged.set(key, {
          qualificationId: Number(qualification.id) || null,
          qualificationName,
          qualificationType: qualification.type ?? null,
          total: 0,
          percentage: 0,
          color: "",
        });
      }
    }
  }

  for (const campaignItems of groups) {
    for (const item of campaignItems) {
      const key = normalizeKey(item.qualification_name);
      const current = merged.get(key);

      if (current) {
        current.total += item.total;
        current.qualificationType = current.qualificationType ?? item.qualification_type;
      } else {
        merged.set(key, {
          qualificationId: item.qualification_id,
          qualificationName: item.qualification_name,
          qualificationType: item.qualification_type,
          total: item.total,
          percentage: 0,
          color: "",
        });
      }
    }
  }

  const total = Array.from(merged.values()).reduce((sum, item) => sum + item.total, 0);

  return Array.from(merged.values())
    .sort((left, right) => right.total - left.total || left.qualificationName.localeCompare(right.qualificationName, "fr"))
    .map((item, index) => ({
      ...item,
      percentage: total > 0 ? roundToOneDecimal((item.total / total) * 100) : 0,
      color: QUALIFICATION_COLORS[index % QUALIFICATION_COLORS.length] ?? "#4f86f7",
    }));
}

function isAppointmentQualification(item: QualificationDistributionItem) {
  const normalizedType = item.qualificationType?.trim().toUpperCase() ?? "";
  if (normalizedType === "APPOINTMENT" || normalizedType === "RDV") {
    return true;
  }

  const normalizedName = normalizeKey(item.qualificationName);
  return normalizedName.includes("rdv") || normalizedName.includes("rendezvous");
}

function getSmoothLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0]?.x} ${points[0]?.y}`;
  }

  return points.reduce((path, point, index, collection) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = collection[index - 1];
    const next = collection[index + 1] ?? point;
    const tension = (point.x - previous.x) * 0.18;
    const controlPoint1X = previous.x + tension;
    const controlPoint1Y = previous.y;
    const controlPoint2X = point.x - tension;
    const controlPoint2Y = next ? point.y : point.y;

    return `${path} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${point.x} ${point.y}`;
  }, "");
}

export default function Page() {
  const [weekOffset, setWeekOffset] = useState(0);
  const maxWeekOffset = useMemo(() => getAvailablePreviousWeeksInMonth(), []);
  const currentWeekdays = useMemo(() => getWeekdaysForOffset(weekOffset), [weekOffset]);
  const [state, setState] = useState<DashboardState>({
    dashboard: null,
    production: [],
    hourlyProduction: [],
    liveSnapshot: null,
    campaigns: [],
    topCampaignAppointments: {},
    qualifications: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const todayRange = getTodayRange();
        const [
          dashboard,
          production,
          hourlyProduction,
          liveSnapshot,
          campaigns,
          dailyOverviews,
        ] = await Promise.all([
            reportingApi.getReportingDashboard(),
            reportingApi.getProductionEvolution({
              from: currentWeekdays[0]?.fromIso,
              to: currentWeekdays[currentWeekdays.length - 1]?.toIso,
              interval: "day",
            }),
            reportingApi.getProductionEvolution({
              from: todayRange.fromIso,
              to: todayRange.toIso,
              interval: "hour",
            }),
            monitoringApi.getSupervisionLive(),
            monitoringApi.getSupervisionCampaignsLive(),
            Promise.all(
              currentWeekdays.map((day) =>
                reportingApi.getCallsOverview({
                  from: day.fromIso,
                  to: day.toIso,
                }),
              ),
            ),
          ]);

        const qualificationGroups = campaigns.length > 0
          ? await Promise.all(
              campaigns.map((campaign) =>
                reportingApi.getQualificationsStatus({
                  campaign_id: String(campaign.campaign_id),
                  from: todayRange.fromIso,
                  to: todayRange.toIso,
                }),
              ),
            )
          : [];
        const topCampaignAppointments = campaigns.length > 0
          ? Object.fromEntries(
              await Promise.all(
                campaigns.map(async (campaign) => {
                  const productionByCampaign = await reportingApi.getProductionEvolution({
                    campaign_id: String(campaign.campaign_id),
                    from: todayRange.fromIso,
                    to: todayRange.toIso,
                    interval: "day",
                  });

                  const appointments =
                    productionByCampaign[0]?.total_appointments ?? 0;

                  return [String(campaign.campaign_id), appointments] as const;
                }),
              ),
            )
          : {};
        const qualificationDefinitions = campaigns.length > 0
          ? await Promise.all(
              campaigns.map((campaign) =>
                campaignQualificationsApi
                  .getCampaignQualifications(String(campaign.campaign_id))
                  .catch(() => []),
              ),
            )
          : [];

        if (!mounted) {
          return;
        }

        setState({
          dashboard,
          production: mapWorkdayProduction(currentWeekdays, production, dailyOverviews),
          hourlyProduction: mapHourlyProduction(hourlyProduction),
          liveSnapshot,
          campaigns,
          topCampaignAppointments,
          qualifications: aggregateQualificationsByActiveCampaign(
            qualificationGroups,
            qualificationDefinitions,
          ),
        });
        setLastSync(
          new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date()),
        );
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger le dashboard admin.",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, [currentWeekdays]);

  const topCampaigns = useMemo(
    () => buildTopCampaignRows(state.campaigns, state.topCampaignAppointments).slice(0, 5),
    [state.campaigns, state.topCampaignAppointments],
  );
  const totalCalls =
    toNumber(getMetricValue(state.dashboard?.calls, ["total_calls", "calls", "call_count"])) ?? 0;
  const totalAppointments =
    toNumber(
      getMetricValue(state.dashboard?.appointments, ["total_appointments", "appointments", "count"]),
    ) ?? 0;
  const conversionRate =
    toNumber(
      getMetricValue(state.dashboard?.conversion, ["conversion_rate", "rate", "performance"]),
    ) ?? 0;
  const answerRate = state.liveSnapshot?.answer_rate ?? 0;
  const abandonRate = state.liveSnapshot?.abandon_rate ?? 0;
  const contactsAvailable = state.liveSnapshot?.contacts_available ?? 0;
  const avgWaitTime = state.liveSnapshot?.avg_duration ?? 0;

  const kpis = [
    {
      label: "Joignabilite",
      value: formatPercentage(answerRate),
      caption: `${formatNumber(totalCalls)} appels retournes par le reporting`,
      delta: `${formatNumber(state.liveSnapshot?.answered_today ?? 0)} decroches`,
      icon: <PhoneCall className="h-5 w-5" />,
      tone: "blue" as const,
    },
    {
      label: "Taux d abandon",
      value: formatPercentage(abandonRate),
      caption: "Lecture live du plateau de supervision",
      delta: `${formatNumber(state.liveSnapshot?.abandoned_today ?? 0)} appels abandonnes`,
      icon: <TimerReset className="h-5 w-5" />,
      tone: "navy" as const,
    },
    {
      label: "Fiches disponibles",
      value: formatNumber(contactsAvailable),
      caption: "Contacts disponibles dans les campagnes actives",
      delta: `${formatNumber(totalAppointments)} rendez-vous sur la periode`,
      icon: <Activity className="h-5 w-5" />,
      tone: "amber" as const,
    },
    {
      label: "Delai d attente moyen",
      value: formatDurationSeconds(avgWaitTime),
      caption: `${formatNumber(totalAppointments)} rendez-vous sur la periode`,
      delta: formatPercentage(conversionRate),
      icon: <Clock3 className="h-5 w-5" />,
      tone: "teal" as const,
    },
  ];

  return (
    <section className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Admin workspace"
        title="Tableau de bord admin"
        description="Pilotage connecte au backend pour suivre la production, la disponibilite du plateau et les campagnes actives."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_8px_18px_rgba(20,32,53,0.05)]">
              <BarChart3 className="h-4 w-4 text-[#2d6fcb]" />
              Reporting + supervision
            </span>
            <span className="rounded-full bg-[#eef5fb] px-3 py-2 text-sm font-medium text-[#295086]">
              Sync {lastSync || "--/-- --:--"}
            </span>
          </>
        }
      />

      {error ? (
        <Card className="border border-[#f0d8de] bg-[#fff8fa] shadow-none">
          <CardContent className="flex items-center gap-3 px-5 py-4 text-sm text-[#8a5a67]">
            <RefreshCw className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <StatsCard
            key={`kpi-${normalizeKey(item.label)}`}
            label={item.label}
            value={item.value}
            caption={item.caption}
            delta={item.delta}
            tone={item.tone}
            icon={item.icon}
            density="compact"
          />
        ))}
      </div>

      <ProductionEvolutionCard
        data={state.production}
        isLoading={isLoading}
        weekLabel={getCurrentWeekRangeLabel(currentWeekdays)}
        canGoPrevious={weekOffset < maxWeekOffset}
        canGoNext={weekOffset > 0}
        onPreviousWeek={() => setWeekOffset((current) => Math.min(current + 1, maxWeekOffset))}
        onNextWeek={() => setWeekOffset((current) => Math.max(current - 1, 0))}
      />

      <HourlyProductionCard
        data={state.hourlyProduction}
        isLoading={isLoading}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <QualificationDistributionCard
          items={state.qualifications}
          isLoading={isLoading}
        />

        <div className="grid gap-4">
        <Card className="border border-[#e5edf5] bg-white shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-[1.02rem]">Campagnes actives</CardTitle>
            <CardDescription>
              Vue live issue de `GET /supervision/campaigns-live`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-0">
            {isLoading ? (
              <p className="text-sm text-[#607287]">Chargement des campagnes live...</p>
            ) : state.campaigns.length > 0 ? (
              state.campaigns.slice(0, 5).map((campaign) => (
                <div
                  key={`campaign-live-${campaign.campaign_id}-${normalizeKey(campaign.campaign_name)}`}
                  className="rounded-[1rem] border border-[#eef3f8] bg-[#fcfdff] px-3.5 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#102033]">
                        {campaign.campaign_name}
                      </p>
                      <p className="mt-1 text-sm text-[#607287]">
                        {formatNumber(campaign.contacts_available)} contacts disponibles
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f4f7fb] px-3 py-1.5 text-xs font-semibold text-[#607287]">
                      {campaign.dialer_speed_mode}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <MiniMetric label="Appels du jour" value={formatNumber(campaign.calls_today)} />
                    <MiniMetric label="Agents en appel" value={formatNumber(campaign.agents_in_call)} />
                    <MiniMetric label="Taux reponse" value={formatPercentage(campaign.answer_rate)} />
                    <MiniMetric label="Taux abandon" value={formatPercentage(campaign.abandon_rate)} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#607287]">Aucune campagne live disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#e5edf5] bg-white shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-[1.02rem]">Top campagnes</CardTitle>
            <CardDescription>
              Classement construit a partir de `GET /reporting/dashboard`.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topCampaigns.length > 0 ? (
              <TableWrapper className="shadow-none">
                <Table>
                  <thead>
                    <tr>
                      <TableHeadCell>Campagne</TableHeadCell>
                      <TableHeadCell>Appels</TableHeadCell>
                      <TableHeadCell>Rendez-vous</TableHeadCell>
                      <TableHeadCell>Taux de reponse</TableHeadCell>
                      <TableHeadCell>Taux d abandon</TableHeadCell>
                      <TableHeadCell>Statut</TableHeadCell>
                    </tr>
                  </thead>
                  <tbody>
                    {topCampaigns.map((campaign) => (
                      <tr key={`top-campaign-${campaign.campaignId}-${normalizeKey(campaign.name)}`}>
                        <TableCell>{campaign.name}</TableCell>
                        <TableCell>{formatNumber(campaign.calls)}</TableCell>
                        <TableCell>{formatNumber(campaign.appointments)}</TableCell>
                        <TableCell>{formatPercentage(campaign.answerRate)}</TableCell>
                        <TableCell>{formatPercentage(campaign.abandonRate)}</TableCell>
                        <TableCell>
                          {campaign.status || "—"}
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            ) : (
              <p className="text-sm text-[#607287]">Aucun classement campagne disponible.</p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </section>
  );
}

function HourlyProductionCard({
  data,
  isLoading,
}: {
  data: HourlyProductionPoint[];
  isLoading: boolean;
}) {
  const totalCalls = data.reduce((sum, item) => sum + item.calls, 0);
  const totalAppointments = data.reduce((sum, item) => sum + item.appointments, 0);
  const maxTotal = Math.max(...data.map((item) => item.total), 0);
  const axisMax = getNiceAxisMax(maxTotal);
  const axisTicks = Array.from({ length: 6 }, (_, slot) => ({
    slot,
    value: Math.round((axisMax / 5) * slot),
  }));

  if (isLoading) {
    return (
      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[1.14rem] text-[#102033]">
            Appels et rendez-vous par heure
          </CardTitle>
          <CardDescription>Chargement de la répartition horaire d&apos;aujourd&apos;hui...</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-[1rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-5 py-10 text-center text-sm text-[#607287]">
            Préparation de l&apos;histogramme horaire du jour.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2f6fe3]">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-[1.18rem] text-[#102033]">
                Appels et rendez-vous par heure (aujourd&apos;hui)
              </CardTitle>
              <CardDescription>
                Répartition réelle du jour, avec une échelle adaptée aux gros volumes.
              </CardDescription>
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-[0.95rem] border border-[#dce6f0] bg-[#fbfdff] px-3 py-2 text-sm font-semibold text-[#24415d]">
          <Clock3 className="h-3.5 w-3.5 text-[#295086]" />
          Aujourd&apos;hui
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-[#24415d]">
          <LegendDot color="#2f6fe3" label="Appels" />
          <LegendDot color="#8b4ce6" label="Rendez-vous" />
        </div>

        <div className="rounded-[1.35rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-4 sm:p-5">
          <div className="grid grid-cols-[52px_minmax(0,1fr)_54px] items-end gap-3 px-1 pb-2 text-[12px] font-medium text-[#70839a]">
            <span />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${axisTicks.length}, minmax(0, 1fr))` }}>
              {axisTicks.map((tick) => (
                <span key={`hour-axis-tick-${tick.slot}-${tick.value}`} className="text-center last:text-right">
                  {formatNumber(tick.value)}
                </span>
              ))}
            </div>
            <span className="text-right">Total</span>
          </div>

          <div className="space-y-3">
            {data.map((item) => {
              const callsWidth = axisMax > 0 ? (item.calls / axisMax) * 100 : 0;
              const appointmentsWidth = axisMax > 0 ? (item.appointments / axisMax) * 100 : 0;
              const callsVisibleWidth = item.calls > 0 ? Math.max(callsWidth, 2.2) : 0;
              const appointmentsVisibleWidth =
                item.appointments > 0 ? Math.max(appointmentsWidth, 1.6) : 0;
              const callsLabelInside = callsWidth >= 8;
              const appointmentsLabelInside = appointmentsWidth >= 5;

              return (
                <div
                  key={item.key}
                  className="grid grid-cols-[52px_minmax(0,1fr)_54px] items-center gap-3"
                >
                  <span className="text-[13px] font-semibold text-[#334861]">{item.label}</span>
                  <div className="relative">
                    <div
                      className="absolute inset-y-0 left-0 right-0 grid"
                      style={{ gridTemplateColumns: `repeat(${axisTicks.length - 1}, minmax(0, 1fr))` }}
                    >
                      {axisTicks.slice(1).map((tick) => (
                        <span
                          key={`hour-gridline-${item.key}-${tick.slot}-${tick.value}`}
                          className="border-l border-dashed border-[#e6edf6]"
                        />
                      ))}
                    </div>
                    <div className="relative flex h-8 items-center rounded-full">
                      <div
                        className="relative flex h-6 items-center justify-center rounded-[0.45rem] bg-[linear-gradient(180deg,#5d99ff_0%,#2f6fe3_100%)] px-2 text-[12px] font-semibold text-white"
                        style={{ width: `${callsVisibleWidth}%` }}
                      >
                        {item.calls > 0 ? (
                          callsLabelInside ? item.calls : null
                        ) : null}
                      </div>
                      <div
                        className="relative ml-[2px] flex h-6 items-center justify-center rounded-[0.45rem] bg-[linear-gradient(180deg,#b47cff_0%,#8b4ce6_100%)] px-2 text-[12px] font-semibold text-white"
                        style={{ width: `${appointmentsVisibleWidth}%` }}
                      >
                        {item.appointments > 0 ? (
                          appointmentsLabelInside ? item.appointments : null
                        ) : null}
                      </div>
                      {!callsLabelInside && item.calls > 0 ? (
                        <span
                          className="absolute top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#2f6fe3]"
                          style={{ left: `calc(${callsVisibleWidth}% + 10px)` }}
                        >
                          {item.calls}
                        </span>
                      ) : null}
                      {!appointmentsLabelInside && item.appointments > 0 ? (
                        <span
                          className="absolute top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#8b4ce6]"
                          style={{ left: `calc(${callsVisibleWidth + appointmentsVisibleWidth}% + 14px)` }}
                        >
                          {item.appointments}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-right text-[13px] font-semibold text-[#102033]">
                    {formatNumber(item.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[640px] gap-0 overflow-hidden rounded-[1.25rem] border border-[#e7eef5] bg-white md:grid-cols-2">
          <div className="flex items-center gap-3 px-5 py-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6fe3]">
              <PhoneCall className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#607287]">Total appels</p>
              <p className="text-[1.9rem] font-semibold leading-none text-[#2f6fe3]">
                {formatNumber(totalCalls)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-[#e7eef5] px-5 py-4 md:border-l md:border-t-0">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f4ebff] text-[#8b4ce6]">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#607287]">Total rendez-vous</p>
              <p className="text-[1.9rem] font-semibold leading-none text-[#8b4ce6]">
                {formatNumber(totalAppointments)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QualificationDistributionCard({
  items,
  isLoading,
}: {
  items: QualificationDistributionItem[];
  isLoading: boolean;
}) {
  const size = 210;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;
  const totalQualifications = items.reduce((sum, item) => sum + item.total, 0);
  const totalAppointmentsToday = items
    .filter(isAppointmentQualification)
    .reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className="border border-[#e5edf5] bg-white shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-[1.02rem]">
              Répartition des qualifications
            </CardTitle>
            <CardDescription>
              Donut à gauche, détail des qualifications à droite, sur les campagnes actives.
            </CardDescription>
          </div>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f7fb] text-[#8aa0b9]">
            <Info className="h-3.5 w-3.5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="rounded-[1rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-5 py-12 text-center text-sm text-[#607287]">
            Chargement de la répartition des qualifications...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center">
              <div className="flex w-full max-w-[240px] flex-col items-center rounded-[1.35rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbfe_100%)] px-4 py-5">
                <div className="relative flex h-[210px] w-[210px] items-center justify-center">
                  <svg viewBox={`0 0 ${size} ${size}`} className="h-[210px] w-[210px] -rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#edf2f7"
                    strokeWidth={strokeWidth}
                  />
                  {items.length > 0
                    ? items.map((item) => {
                        const segmentLength =
                          totalQualifications > 0
                            ? (item.total / totalQualifications) * circumference
                            : 0;
                        const segment = (
                          <circle
                            key={`${item.qualificationId ?? "q"}-${item.qualificationName}`}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                            strokeDashoffset={-cumulativeOffset}
                            strokeLinecap="butt"
                          />
                        );
                        cumulativeOffset += segmentLength;
                        return segment;
                      })
                    : null}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full">
                    <span className="text-[2rem] font-semibold leading-none text-[#102033]">
                      {formatNumber(totalAppointmentsToday)}
                    </span>
                    <span className="mt-2 text-sm font-medium text-[#607287]">RDV du jour</span>
                  </div>
                </div>
                <span className="mt-3 inline-flex items-center rounded-full bg-[#eef5fb] px-3 py-1.5 text-[12px] font-medium text-[#41607d]">
                  Total qualifications: {formatNumber(totalQualifications)}
                </span>
              </div>
            </div>

            <div className="rounded-[1.3rem] border border-[#edf2f7] bg-[linear-gradient(180deg,#ffffff_0%,#fcfdff_100%)] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#102033]">Détail des qualifications</p>
                  <p className="text-[13px] text-[#607287]">
                    Les qualifications à 0 restent visibles lorsqu&apos;elles sont actives.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={`${item.qualificationId ?? "q"}-${item.qualificationName}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[1rem] border border-[#eef3f8] bg-[#fcfdff] px-3.5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-[#24415d]">
                          {item.qualificationName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="min-w-[54px] text-sm font-semibold text-[#102033]">
                          {formatNumber(item.total)}
                        </span>
                        <span className="min-w-[58px] rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[12px] font-medium text-[#607287]">
                          {formatPercentage(item.percentage)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[0.95rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-8 text-center text-sm text-[#607287]">
                    Aucune qualification remontée pour les campagnes actives aujourd&apos;hui.
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-[#edf2f7] pt-3">
                <span className="text-sm font-semibold text-[#102033]">Total</span>
                <div className="flex items-center gap-3 text-right">
                  <span className="min-w-[54px] text-sm font-semibold text-[#102033]">
                    {formatNumber(totalQualifications)}
                  </span>
                  <span className="min-w-[58px] rounded-full bg-[#eef5fb] px-2.5 py-1 text-[12px] font-semibold text-[#295086]">
                    {items.length > 0 ? "100 %" : "0 %"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductionEvolutionCard({
  data,
  isLoading,
  weekLabel,
  canGoPrevious,
  canGoNext,
  onPreviousWeek,
  onNextWeek,
}: {
  data: WorkdayProductionPoint[];
  isLoading: boolean;
  weekLabel: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalCalls = data.reduce((sum, item) => sum + item.calls, 0);
  const totalAppointments = data.reduce((sum, item) => sum + item.appointments, 0);
  const averageAnswerRate =
    data.length > 0
      ? roundToOneDecimal(
          data.reduce((sum, item) => sum + item.answerRate, 0) / data.length,
        )
      : 0;
  const maxVolume = Math.max(
    10,
    ...data.flatMap((item) => [item.calls, item.appointments]),
  );
  const chartWidth = 720;
  const chartHeight = 372;
  const padding = { top: 30, right: 54, bottom: 48, left: 52 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const groupWidth = plotWidth / Math.max(data.length, 1);
  const barWidth = Math.min(34, groupWidth * 0.31);
  const barGap = 5;
  const leftTicks = [0, 25, 50, 75, 100].map((step) => ({
    step,
    value: Math.round((maxVolume * step) / 100),
  }));
  const linePoints = data.map((item, index) => {
    const x = padding.left + groupWidth * index + groupWidth / 2;
    const y = padding.top + plotHeight - (item.answerRate / 100) * plotHeight;
    return { x, y };
  });
  const linePath = getSmoothLinePath(linePoints);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[1.24rem] text-[#102033]">
            Production quotidienne (semaine en cours)
          </CardTitle>
          <CardDescription>Chargement des donnees de la semaine courante...</CardDescription>
        </CardHeader>
        <CardContent className="pb-6 pt-0">
          <div className="rounded-[1.3rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-5 py-10 text-center text-sm text-[#607287]">
            Recuperation des appels, rendez-vous et taux de reponse du lundi au vendredi.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <CardTitle className="text-[1.22rem] text-[#102033]">
            Production quotidienne (semaine en cours)
          </CardTitle>
          <CardDescription>
            Suivez l evolution de votre activite du lundi au vendredi.
          </CardDescription>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-[0.95rem] border border-[#dce6f0] bg-[#fbfdff] px-2.5 py-2 text-sm font-semibold text-[#24415d] sm:self-center">
          <button
            type="button"
            onClick={onPreviousWeek}
            disabled={!canGoPrevious}
            aria-label="Afficher la semaine precedente"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] transition hover:bg-[#f2f7fd] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="inline-flex items-center gap-2 px-1">
            <BarChart3 className="h-3.5 w-3.5 text-[#295086]" />
            {weekLabel}
          </div>
          <button
            type="button"
            onClick={onNextWeek}
            disabled={!canGoNext}
            aria-label="Revenir vers la semaine courante"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#295086] transition hover:bg-[#f2f7fd] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-5 pt-3">
        <div className="rounded-[1.45rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-3.5 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-4 text-[13px] font-medium text-[#24415d]">
            <LegendDot color="#2f6fe3" label="Appels" />
            <LegendDot color="#8b4ce6" label="Rendez-vous" />
            <LegendLine color="#1b9f63" label="Taux de reponse (%)" />
          </div>

          <div className="relative overflow-x-auto" onMouseLeave={() => setActiveIndex(null)}>
            <div className="mx-auto min-w-[660px] max-w-[760px]">
              {activeIndex !== null ? (
                <div
                  className="pointer-events-none absolute z-10 w-[180px] rounded-[0.9rem] border border-[#dfe8f1] bg-white/95 px-3 py-2.5 text-[11px] text-[#24415d] shadow-[0_18px_36px_rgba(20,32,53,0.12)]"
                  style={{
                    left: `calc(${((activeIndex + 0.5) / Math.max(data.length, 1)) * 100}% - 90px)`,
                    top: 8,
                  }}
                >
                  <p className="font-semibold text-[#102033]">{data[activeIndex]?.label}</p>
                  <p className="mt-2">Appels : {formatNumber(data[activeIndex]?.calls ?? 0)}</p>
                  <p className="mt-1">Rendez-vous : {formatNumber(data[activeIndex]?.appointments ?? 0)}</p>
                  <p className="mt-1">Taux de reponse : {formatPercentage(data[activeIndex]?.answerRate ?? 0)}</p>
                </div>
              ) : null}

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-[366px] w-full"
                preserveAspectRatio="none"
                aria-label="Graphique de production hebdomadaire"
              >
                {leftTicks.map((tick) => {
                  const y = padding.top + plotHeight - (tick.value / maxVolume) * plotHeight;

                  return (
                    <g key={`week-left-tick-${tick.step}-${tick.value}`}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#e8eef5"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="12"
                        fill="#6f8195"
                      >
                        {tick.value}
                      </text>
                    </g>
                  );
                })}

                {[0, 20, 40, 60, 80, 100].map((tick) => {
                  const y = padding.top + plotHeight - (tick / 100) * plotHeight;

                  return (
                    <text
                      key={tick}
                      x={chartWidth - padding.right + 12}
                      y={y + 4}
                      fontSize="12"
                      fill="#6f8195"
                    >
                      {tick}%
                    </text>
                  );
                })}

                {data.map((item, index) => {
                  const groupX = padding.left + groupWidth * index + groupWidth / 2;
                  const callsHeight = (item.calls / maxVolume) * plotHeight;
                  const appointmentsHeight = (item.appointments / maxVolume) * plotHeight;
                  const callsX = groupX - barWidth - barGap / 2;
                  const appointmentsX = groupX + barGap / 2;
                  const callsY = padding.top + plotHeight - callsHeight;
                  const appointmentsY = padding.top + plotHeight - appointmentsHeight;

                  return (
                    <g key={item.key}>
                      <text
                        x={callsX + barWidth / 2}
                        y={callsY - 8}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill="#16315c"
                      >
                        {item.calls}
                      </text>
                      <rect
                        x={callsX}
                        y={callsY}
                        width={barWidth}
                        height={Math.max(callsHeight, 0)}
                        rx="8"
                        fill="url(#callsGradient)"
                      />
                      <rect
                        x={appointmentsX}
                        y={appointmentsY}
                        width={barWidth}
                        height={Math.max(appointmentsHeight, 0)}
                        rx="8"
                        fill="url(#appointmentsGradient)"
                      />
                      <text
                        x={groupX}
                        y={chartHeight - 18}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="600"
                        fill="#4f6277"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={linePath}
                  fill="none"
                  stroke="#16a34a"
                  strokeOpacity="0.8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {linePoints.map((point, index) => (
                  <g key={data[index]?.key}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={activeIndex === index ? "3" : "2"}
                      fill="#16a34a"
                      fillOpacity="0.92"
                    />
                  </g>
                ))}

                <defs>
                  <linearGradient id="callsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4e8fff" />
                    <stop offset="100%" stopColor="#2f6fe3" />
                  </linearGradient>
                  <linearGradient id="appointmentsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#b47cff" />
                    <stop offset="100%" stopColor="#8b4ce6" />
                  </linearGradient>
                </defs>
              </svg>

              <div
                className="absolute inset-x-0 bottom-0 top-0 grid"
                style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }}
              >
                {data.map((item, index) => (
                  <button
                    key={item.key}
                    type="button"
                    className="h-full w-full bg-transparent"
                    aria-label={`Voir le detail de ${item.label}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[#edf2f7] pt-1.5 md:grid-cols-4">
          <FooterStat
            icon={<PhoneCall className="h-4 w-4" />}
            tone="bg-[#eaf2ff] text-[#2f6fe3]"
            label="Total appels semaine"
            value={formatNumber(totalCalls)}
            note="Lun - Ven"
          />
          <FooterStat
            icon={<CalendarCheck2 className="h-4 w-4" />}
            tone="bg-[#f4ebff] text-[#8b4ce6]"
            label="Total rendez-vous semaine"
            value={formatNumber(totalAppointments)}
            note="Repere V1"
          />
          <FooterStat
            icon={<TrendingUp className="h-4 w-4" />}
            tone="bg-[#eaf9f2] text-[#1b9f63]"
            label="Taux de reponse moyen"
            value={formatPercentage(averageAnswerRate)}
            note="Moyenne journaliere"
          />
          <FooterStat
            icon={<Clock3 className="h-4 w-4" />}
            tone="bg-[#fff3e8] text-[#d97706]"
            label="Jours ouvres affiches"
            value="5/5"
            note="Lun - Ven"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[0.9rem] border border-[#e6edf6] bg-white px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8da3]">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-[#102033]">{value}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-[0.3rem]" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative inline-flex h-3.5 w-6 items-center">
        <span className="h-[3px] w-full rounded-full" style={{ backgroundColor: color }} />
        <span
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ backgroundColor: color }}
        />
      </span>
      <span>{label}</span>
    </div>
  );
}

function FooterStat({
  icon,
  tone,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-[1.1rem] px-1.5 py-2">
      <div className={`inline-flex h-8.5 w-8.5 items-center justify-center rounded-[1rem] ${tone}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#607287]">{label}</p>
        <p className="mt-1 text-[1.55rem] font-semibold leading-none text-[#102033]">{value}</p>
        <p className="mt-1.5 text-[13px] text-[#607287]">{note}</p>
      </div>
    </div>
  );
}
