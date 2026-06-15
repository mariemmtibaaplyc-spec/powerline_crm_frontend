"use client";

import { Activity, Clock3, PhoneCall, TimerReset } from "lucide-react";
import { useState } from "react";
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

const kpis = [
  {
    label: "Joignabilite",
    value: "78,4 %",
    caption: "Moyenne plateau sur la plage active",
    delta: "+2,4 pts",
    icon: <PhoneCall className="h-5 w-5" />,
    tone: "blue",
  },
  {
    label: "Taux d abandon",
    value: "3,8 %",
    caption: "Abandons constates sur les files entrantes",
    delta: "-0,8 pt",
    icon: <TimerReset className="h-5 w-5" />,
    tone: "navy",
  },
  {
    label: "Fiches disponibles",
    value: "32 719",
    caption: "Contacts encore exploitables immediatement",
    delta: "Actif",
    icon: <Activity className="h-5 w-5" />,
    tone: "amber",
  },
  {
    label: "Delai d attente max",
    value: "56 s",
    caption: "Point haut observe sur la periode",
    delta: "Stable",
    icon: <Clock3 className="h-5 w-5" />,
    tone: "teal",
  },
] as const;

const productionSeries = [
  { day: "Lun", label: "29/04", total: 122, received: 96, sales: 24 },
  { day: "Mar", label: "30/04", total: 138, received: 108, sales: 29 },
  { day: "Mer", label: "01/05", total: 126, received: 101, sales: 26 },
  { day: "Jeu", label: "02/05", total: 144, received: 116, sales: 34 },
  { day: "Ven", label: "03/05", total: 132, received: 104, sales: 28 },
  { day: "Sam", label: "04/05", total: 151, received: 121, sales: 37 },
] as const;

const contactsByCampaign = [
  { campaign: "NAT ISA", speed: "Personnalise", available: 32719, wait: "3 s" },
  { campaign: "Natix", speed: "Normale", available: 0, wait: "56 s" },
  { campaign: "nouvelle-campagne", speed: "Personnalise", available: 0, wait: "0 s" },
  { campaign: "PARTIE 2", speed: "Personnalise", available: 21387, wait: "31 s" },
  { campaign: "PARTIE 3", speed: "Personnalise", available: 22526, wait: "27 s" },
] as const;

const salesByCampaign = [
  { campaign: "NAT ISA", sales: 422 },
  { campaign: "Natix", sales: 118 },
  { campaign: "PARTIE 2", sales: 304 },
  { campaign: "PARTIE 3", sales: 276 },
] as const;

const productionVolumes = [
  { campaign: "NAT ISA", volume: 22.2 },
  { campaign: "nouvelle-campagne", volume: 0.6 },
  { campaign: "Natix", volume: 15.4 },
  { campaign: "Campagne", volume: 0.0 },
] as const;

const campaignSummary = [
  {
    campaign: "NAT ISA",
    agents: 47,
    communication: "747:03:07",
    waiting: "542:32:28",
    pause: "358:07:33",
    qualification: "212:29:48",
  },
  {
    campaign: "nouvelle-campagne",
    agents: 1,
    communication: "0:00:41",
    waiting: "0:58:08",
    pause: "0:00:27",
    qualification: "0:26:28",
  },
  {
    campaign: "Natix",
    agents: 1,
    communication: "2:10:24",
    waiting: "0:11:18",
    pause: "0:05:48",
    qualification: "0:00:00",
  },
  {
    campaign: "Campagne",
    agents: 17,
    communication: "0:00:20",
    waiting: "0:33:04",
    pause: "8:17:43",
    qualification: "5:08:08",
  },
] as const;

function getSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]?.x} ${points[0]?.y}`;

  const path = points.reduce((accumulator, point, index, array) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = array[index - 1];
    const current = point;
    const next = array[index + 1] ?? current;
    const controlPointOffset = (current.x - previous.x) * 0.32;
    const firstControlX = previous.x + controlPointOffset;
    const firstControlY = previous.y;
    const secondControlX = current.x - controlPointOffset;
    const secondControlY = next ? current.y : current.y;

    return `${accumulator} C ${firstControlX} ${firstControlY}, ${secondControlX} ${secondControlY}, ${current.x} ${current.y}`;
  }, "");

  return path;
}

function getChartPoint(
  value: number,
  index: number,
  count: number,
  width: number,
  height: number,
  max: number,
  padding: { top: number; right: number; bottom: number; left: number },
) {
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  return {
    x: padding.left + (index / Math.max(count - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - (value / max) * chartHeight,
  };
}

function formatTick(value: number) {
  return value.toLocaleString("fr-FR");
}

function buildTicks(maxValue: number) {
  const rawStep = Math.max(1, Math.ceil(maxValue / 4));
  const step = rawStep <= 10 ? 10 : Math.ceil(rawStep / 10) * 10;
  return [0, step, step * 2, step * 3, step * 4];
}

function getTooltipPositionStyle(index: number, count: number) {
  if (index <= 0) {
    return {
      left: "0%",
      transform: "translateX(0)",
    };
  }

  if (index >= count - 1) {
    return {
      left: "100%",
      transform: "translateX(-100%)",
    };
  }

  return {
    left: `${(index / Math.max(count - 1, 1)) * 100}%`,
    transform: "translateX(-50%)",
  };
}

function getBarHeight(value: number, max: number) {
  if (max <= 0) return 0;
  return `${Math.max((value / max) * 100, value > 0 ? 6 : 0)}%`;
}

function TooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-[#607287]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="font-semibold text-[#102033]">{value.toLocaleString("fr-FR")}</span>
    </div>
  );
}

export default function Page() {
  const [activeProductionIndex, setActiveProductionIndex] = useState<number | null>(null);
  const syncLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const lineWidth = 100;
  const lineHeight = 86;
  const chartPadding = { top: 8, right: 11, bottom: 16, left: 11 };
  const leftAxisMax = Math.max(...productionSeries.map((item) => item.total));
  const rightAxisMax = Math.max(
    ...productionSeries.flatMap((item) => [item.received, item.sales]),
  );
  const leftTicks = buildTicks(leftAxisMax);
  const rightTicks = buildTicks(rightAxisMax);
  const totalCoordinates = productionSeries.map((item, index) =>
    getChartPoint(item.total, index, productionSeries.length, lineWidth, lineHeight, leftTicks[4], chartPadding),
  );
  const receivedCoordinates = productionSeries.map((item, index) =>
    getChartPoint(item.received, index, productionSeries.length, lineWidth, lineHeight, rightTicks[4], chartPadding),
  );
  const salesCoordinates = productionSeries.map((item, index) =>
    getChartPoint(item.sales, index, productionSeries.length, lineWidth, lineHeight, rightTicks[4], chartPadding),
  );
  const totalPath = getSmoothPath(totalCoordinates);
  const receivedPath = getSmoothPath(receivedCoordinates);
  const salesPath = getSmoothPath(salesCoordinates);
  const maxVolume = Math.max(...productionVolumes.map((item) => item.volume));

  return (
    <section className="space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Tableau de bord admin"
        description="Vue de pilotage simple du centre d appel, centree sur la production, la disponibilite et la performance par campagne."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_8px_18px_rgba(20,32,53,0.05)]">
              <span className="h-2 w-2 rounded-full bg-[#2d6fcb]" />
              Supervision centre d appel
            </span>
            <span className="rounded-full bg-[#eef5fb] px-3 py-2 text-sm font-medium text-[#295086]">
              Sync {syncLabel}
            </span>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          return (
            <StatsCard
              key={item.label}
              label={item.label}
              value={item.value}
              caption={item.caption}
              delta={item.delta}
              tone={item.tone}
              icon={item.icon}
            />
          );
        })}
      </div>

      <Card className="border border-[#e5edf5] bg-white shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-[1.15rem]">Evolution de la production</CardTitle>
          <CardDescription>
            Suivi de l evolution sur la periode selectionnee pour le total, les recus et les ventes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div
            className="relative rounded-[1.2rem] border border-[#eef3f8] bg-[#fcfdff] px-3 py-4 sm:px-5 sm:py-5"
            onMouseLeave={() => setActiveProductionIndex(null)}
          >
            {activeProductionIndex !== null ? (
              <div
                className="pointer-events-none absolute top-4 z-10 w-[160px] rounded-[1rem] border border-[#e4ebf3] bg-white/98 px-3 py-2.5 text-xs text-[#4f6277] shadow-[0_14px_34px_rgba(20,32,53,0.11)] sm:top-5 sm:w-[186px] sm:px-3.5 sm:py-3"
                style={{
                  ...getTooltipPositionStyle(
                    activeProductionIndex,
                    productionSeries.length,
                  ),
                }}
              >
                <p className="font-semibold text-[#102033]">
                  {productionSeries[activeProductionIndex]?.day} {productionSeries[activeProductionIndex]?.label}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#8da0b4]">
                  Rapport de production
                </p>
                <div className="mt-2.5 space-y-1.5">
                  <TooltipRow label="Total appeles" value={productionSeries[activeProductionIndex]?.total ?? 0} color="#3366a5" />
                  <TooltipRow label="Appels recus" value={productionSeries[activeProductionIndex]?.received ?? 0} color="#2f8f79" />
                  <TooltipRow label="Ventes" value={productionSeries[activeProductionIndex]?.sales ?? 0} color="#d17d34" />
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto pb-2">
              <div className="relative mx-auto min-w-[720px] max-w-[1180px] sm:min-w-[820px]">
              <svg
                viewBox={`0 0 ${lineWidth} ${lineHeight}`}
                className="h-[260px] w-full sm:h-[320px] lg:h-[360px]"
                preserveAspectRatio="none"
                aria-label="Evolution de la production"
              >
                {leftTicks.map((tick, index) => {
                  const { y } = getChartPoint(
                    tick,
                    0,
                    productionSeries.length,
                    lineWidth,
                    lineHeight,
                    leftTicks[4],
                    chartPadding,
                  );

                  return (
                    <g key={`left-${tick}`}>
                      <line
                        x1={chartPadding.left}
                        y1={y}
                        x2={lineWidth - chartPadding.right}
                        y2={y}
                        stroke="#eef3f8"
                        strokeWidth="0.26"
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={2.6}
                        y={y + 1}
                        fontSize="2.45"
                        fill="#9cafc1"
                        dominantBaseline="middle"
                      >
                        {formatTick(tick)}
                      </text>
                      {index === leftTicks.length - 1 ? (
                        <text
                          x={chartPadding.left}
                          y={chartPadding.top - 2}
                          fontSize="2.35"
                          fill="#8ea0b2"
                        >
                          Total appeles
                        </text>
                      ) : null}
                    </g>
                  );
                })}

                {rightTicks.map((tick, index) => {
                  const { y } = getChartPoint(
                    tick,
                    0,
                    productionSeries.length,
                    lineWidth,
                    lineHeight,
                    rightTicks[4],
                    chartPadding,
                  );

                  return (
                    <g key={`right-${tick}`}>
                      <text
                        x={lineWidth - 1.6}
                        y={y + 1}
                        fontSize="2.45"
                        fill="#9cafc1"
                        textAnchor="end"
                        dominantBaseline="middle"
                      >
                        {formatTick(tick)}
                      </text>
                      {index === rightTicks.length - 1 ? (
                        <text
                          x={lineWidth - chartPadding.right}
                          y={chartPadding.top - 2}
                          fontSize="2.35"
                          fill="#8ea0b2"
                          textAnchor="end"
                        >
                          Recus / ventes
                        </text>
                      ) : null}
                    </g>
                  );
                })}

                {productionSeries.map((item, index) => {
                  const { x } = getChartPoint(
                    item.total,
                    index,
                    productionSeries.length,
                    lineWidth,
                    lineHeight,
                    leftTicks[4],
                    chartPadding,
                  );

                  return (
                    <g key={item.label}>
                      <text
                        x={x}
                        y={lineHeight - 4.2}
                        fontSize="2.55"
                        textAnchor="middle"
                        fill="#8398ab"
                      >
                        {item.day}
                      </text>
                      <text
                        x={x}
                        y={lineHeight - 1.4}
                        fontSize="2.2"
                        textAnchor="middle"
                        fill="#9cafc1"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={totalPath}
                  fill="none"
                  stroke="#3366a5"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={receivedPath}
                  fill="none"
                  stroke="#2f8f79"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={salesPath}
                  fill="none"
                  stroke="#d17d34"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />

                {productionSeries.map((item, index) => {
                  const totalPoint = totalCoordinates[index];
                  const receivedPoint = receivedCoordinates[index];
                  const salesPoint = salesCoordinates[index];

                  return (
                    <g key={item.label}>
                      {activeProductionIndex === index ? (
                        <>
                          <circle cx={totalPoint?.x} cy={totalPoint?.y} r="1.35" fill="#3366a5" opacity="0.12" />
                          <circle cx={receivedPoint?.x} cy={receivedPoint?.y} r="1.35" fill="#2f8f79" opacity="0.12" />
                          <circle cx={salesPoint?.x} cy={salesPoint?.y} r="1.35" fill="#d17d34" opacity="0.12" />
                        </>
                      ) : null}
                      <circle cx={totalPoint?.x} cy={totalPoint?.y} r="0.68" fill="#3366a5" stroke="#ffffff" strokeWidth="0.34" />
                      <circle cx={receivedPoint?.x} cy={receivedPoint?.y} r="0.68" fill="#2f8f79" stroke="#ffffff" strokeWidth="0.34" />
                      <circle cx={salesPoint?.x} cy={salesPoint?.y} r="0.68" fill="#d17d34" stroke="#ffffff" strokeWidth="0.34" />
                      {activeProductionIndex === index ? (
                        <line
                          x1={totalPoint?.x}
                          y1={chartPadding.top}
                          x2={totalPoint?.x}
                          y2={lineHeight - chartPadding.bottom}
                          stroke="#ccd8e4"
                          strokeDasharray="1.1 1.1"
                          strokeWidth="0.38"
                          vectorEffect="non-scaling-stroke"
                        />
                      ) : null}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${productionSeries.length}, minmax(0, 1fr))` }}>
                {productionSeries.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`Voir le detail du ${item.label}`}
                    className="h-full w-full bg-transparent"
                    onMouseEnter={() => setActiveProductionIndex(index)}
                    onFocus={() => setActiveProductionIndex(index)}
                  />
                ))}
              </div>
            </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-[#607287] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#708398] sm:gap-4 sm:text-xs">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3366a5]" />
                Total appeles
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2f8f79]" />
                Recus
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d17d34]" />
                Ventes
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-[#8ea0b2] sm:gap-3 sm:text-[11px] sm:tracking-[0.14em]">
              {productionSeries.map((item) => (
                <span key={item.label}>
                  {item.day} {item.label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border border-[#e5edf5] bg-white shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.08rem]">Contacts disponibles par campagne</CardTitle>
          </CardHeader>
          <CardContent>
            <TableWrapper className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <thead>
                  <tr>
                    <TableHeadCell>Campagne</TableHeadCell>
                    <TableHeadCell>Vitesse</TableHeadCell>
                    <TableHeadCell>Disponibles</TableHeadCell>
                    <TableHeadCell>Delai d attente</TableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {contactsByCampaign.map((row) => (
                    <tr key={row.campaign}>
                      <TableCell className="font-medium text-[#102033]">{row.campaign}</TableCell>
                      <TableCell>{row.speed}</TableCell>
                      <TableCell>{row.available.toLocaleString("fr-FR")}</TableCell>
                      <TableCell>{row.wait}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>

        <Card className="border border-[#e5edf5] bg-white shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.08rem]">Ventes par campagne</CardTitle>
          </CardHeader>
          <CardContent>
            <TableWrapper className="overflow-x-auto">
              <Table className="min-w-[360px]">
                <thead>
                  <tr>
                    <TableHeadCell>Campagne</TableHeadCell>
                    <TableHeadCell>Ventes</TableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {salesByCampaign.map((row) => (
                    <tr key={row.campaign}>
                      <TableCell className="font-medium text-[#102033]">{row.campaign}</TableCell>
                      <TableCell>{row.sales.toLocaleString("fr-FR")}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border border-[#e5edf5] bg-white shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.08rem]">Volumes de production par campagne</CardTitle>
            <CardDescription>Lecture simple des volumes sur la periode observee.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="flex h-[250px] min-w-[520px] items-end gap-6 rounded-[1.2rem] border border-[#eef3f8] bg-[#fcfdff] px-5 pb-5 pt-6">
                {productionVolumes.map((item) => (
                  <div key={item.campaign} className="flex h-full flex-1 flex-col justify-end gap-3">
                    <div className="flex-1">
                      <div
                        className="mx-auto w-full max-w-[54px] rounded-t-2xl bg-[linear-gradient(180deg,#4f8ce0_0%,#295086_100%)]"
                        style={{ height: getBarHeight(item.volume, maxVolume) }}
                      />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-semibold text-[#102033]">{item.volume.toFixed(1)} h</p>
                      <p className="text-xs leading-5 text-[#607287]">{item.campaign}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e5edf5] bg-white shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.08rem]">Synthese par campagne</CardTitle>
          </CardHeader>
          <CardContent>
            <TableWrapper className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <thead>
                  <tr>
                    <TableHeadCell>Campagne</TableHeadCell>
                    <TableHeadCell>Agents totaux</TableHeadCell>
                    <TableHeadCell>Communication totale</TableHeadCell>
                    <TableHeadCell>Attente</TableHeadCell>
                    <TableHeadCell>Pause</TableHeadCell>
                    <TableHeadCell>Qualification</TableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {campaignSummary.map((row) => (
                    <tr key={row.campaign}>
                      <TableCell className="font-medium text-[#102033]">{row.campaign}</TableCell>
                      <TableCell>{row.agents}</TableCell>
                      <TableCell>{row.communication}</TableCell>
                      <TableCell>{row.waiting}</TableCell>
                      <TableCell>{row.pause}</TableCell>
                      <TableCell>{row.qualification}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
