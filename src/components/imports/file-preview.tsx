import type { ReactNode } from "react";
import { CheckCircle2, CopyMinus, XCircle } from "lucide-react";
import type { ImportRecord } from "@/types/import.types";

export function FilePreview({
  result,
  compact = false,
}: {
  result: ImportRecord;
  compact?: boolean;
}) {
  const totalRaw = result.totalImported;
  const validContacts = Math.max(0, totalRaw - result.duplicates - result.invalidPhones);
  const validRate = totalRaw > 0 ? (validContacts / totalRaw) * 100 : 0;
  const duplicateRate = totalRaw > 0 ? (result.duplicates / totalRaw) * 100 : 0;
  const invalidRate = totalRaw > 0 ? (result.invalidPhones / totalRaw) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-[1.7rem] border border-[#dce6f0] bg-white p-6 shadow-[0_16px_36px_rgba(20,32,53,0.06)]">
        <div className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-center">
          <div className="space-y-3">
            <Metric
              label="Total importe"
              value={result.totalImported.toLocaleString("fr-FR")}
              tone="blue"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <Metric
              label="Doublons"
              value={result.duplicates.toLocaleString("fr-FR")}
              tone="amber"
              icon={<CopyMinus className="h-4 w-4" />}
            />
            <Metric
              label="Faux numeros"
              value={result.invalidPhones.toLocaleString("fr-FR")}
              tone="rose"
              icon={<XCircle className="h-4 w-4" />}
            />
          </div>

          <div className="space-y-5">
            <div className="flex justify-center">
              <DonutChart
                segments={[
                  { label: "Valides", value: validContacts, color: "#26b39a" },
                  { label: "Doublons", value: result.duplicates, color: "#f2a94a" },
                  { label: "Faux numeros", value: result.invalidPhones, color: "#e36a7d" },
                ]}
                total={totalRaw}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5">
              <LegendDot label="Valides" color="#26b39a" />
              <LegendDot label="Doublons" color="#f2a94a" />
              <LegendDot label="Faux numeros" color="#e36a7d" />
            </div>

            {!compact ? (
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryPill label="Valides" value={`${formatPercent(validRate)}%`} tone="blue" />
                <SummaryPill label="Doublons" value={`${formatPercent(duplicateRate)}%`} tone="amber" />
                <SummaryPill label="Faux numeros" value={`${formatPercent(invalidRate)}%`} tone="rose" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "blue" | "amber" | "rose";
  icon: ReactNode;
}) {
  const toneClass =
    tone === "amber"
      ? "border-[#f4dfbf] bg-[#fff8e9] text-[#c68431]"
      : tone === "rose"
        ? "border-[#f2d7df] bg-[#fff2f5] text-[#c45b6b]"
        : "border-[#d8e8fb] bg-[#f1f8ff] text-[#546fb8]";

  return (
    <div className={`rounded-[1.2rem] border border-dashed px-4 py-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="opacity-75">{icon}</span>
        <span className="text-3xl font-semibold leading-none">{value}</span>
      </div>
      <p className="mt-5 text-sm font-medium opacity-90">{label}</p>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "amber" | "rose";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-[#fff7ef] text-[#8a5425]"
      : tone === "rose"
        ? "bg-[#fff1f4] text-[#9a4a5e]"
        : "bg-[#eef6ff] text-[#295086]";

  return (
    <div className={`rounded-[1.15rem] px-4 py-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#24415d]">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function DonutChart({
  segments,
  total,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  const safeTotal = total > 0 ? total : 1;
  let offset = 0;

  const arcs = segments.map((segment) => {
    const ratio = segment.value / safeTotal;
    const dash = ratio * 100;
    const currentOffset = offset;
    offset += dash;

    return {
      ...segment,
      dash,
      offset: currentOffset,
    };
  });

  return (
    <div className="relative h-[230px] w-[230px]">
      <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
        <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e7eef6" strokeWidth="4.5" />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx="21"
            cy="21"
            r="15.915"
            fill="none"
            stroke={arc.color}
            strokeWidth="4.5"
            strokeDasharray={`${arc.dash} ${100 - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a8da3]">
          Total analyse
        </span>
        <span className="mt-2 text-3xl font-semibold text-[#102033]">
          {total.toLocaleString("fr-FR")}
        </span>
        <span className="mt-1 text-sm text-[#607287]">contacts</span>
      </div>
    </div>
  );
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: value < 1 ? 2 : 1,
    minimumFractionDigits: value < 1 ? 2 : 0,
  }).format(value);
}
