import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "blue" | "teal" | "amber";
type Density = "default" | "compact";

interface StatsCardProps {
  label: string;
  value: ReactNode;
  caption: string;
  delta?: string;
  icon: ReactNode;
  tone?: Tone;
  density?: Density;
}

const toneStyles: Record<Tone, string> = {
  navy: "bg-[linear-gradient(135deg,#17304a_0%,#203a56_100%)] text-white",
  blue: "bg-[linear-gradient(135deg,#2450a6_0%,#2d6fcb_100%)] text-white",
  teal: "bg-[linear-gradient(135deg,#0f6a66_0%,#16857d_100%)] text-white",
  amber: "bg-[linear-gradient(135deg,#d37a3a_0%,#c45f2d_100%)] text-white",
};

const accentGlow: Record<Tone, string> = {
  navy: "bg-[radial-gradient(circle,rgba(255,210,178,0.18),transparent_72%)]",
  blue: "bg-[radial-gradient(circle,rgba(156,205,255,0.18),transparent_72%)]",
  teal: "bg-[radial-gradient(circle,rgba(186,255,237,0.18),transparent_72%)]",
  amber: "bg-[radial-gradient(circle,rgba(255,220,189,0.22),transparent_72%)]",
};

const deltaTone: Record<Tone, string> = {
  navy: "bg-white/12 text-white/90",
  blue: "bg-[#d9ebff]/18 text-white",
  teal: "bg-[#cbfff2]/16 text-white",
  amber: "bg-[#fff0df]/18 text-white",
};

export function StatsCard({
  label,
  value,
  caption,
  delta,
  icon,
  tone = "navy",
  density = "default",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-white/10 shadow-[0_18px_40px_rgba(18,31,51,0.12)]",
        density === "compact" ? "rounded-[1.2rem] p-3.5" : "rounded-[1.65rem] p-5",
        toneStyles[tone],
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 top-0 h-24 w-24 blur-2xl",
          accentGlow[tone],
        )}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/18" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={cn(
              "font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-white/55",
              density === "compact" ? "text-[9px]" : "text-[11px]",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "font-semibold tracking-tight",
              density === "compact" ? "mt-2.5 text-[1.45rem] leading-none" : "mt-4 text-3xl",
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center justify-center bg-white/10 text-white/90",
            density === "compact" ? "h-8 w-8 rounded-[0.9rem]" : "h-11 w-11 rounded-2xl",
          )}
        >
          {icon}
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          density === "compact" ? "mt-2.5" : "mt-4",
        )}
      >
        <p className={cn(density === "compact" ? "text-[11px] leading-4" : "text-sm", "text-white/68")}>
          {caption}
        </p>
        {delta ? (
          <span
            className={cn(
              "rounded-full font-medium",
              density === "compact" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
              deltaTone[tone],
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}
