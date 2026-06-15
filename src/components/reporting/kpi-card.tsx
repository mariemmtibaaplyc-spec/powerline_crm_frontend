import type { ReactNode } from "react";
import { StatsCard } from "@/components/reporting/stats-card";

type Tone = "navy" | "blue" | "teal" | "amber";
type Density = "default" | "compact";

interface KPICardProps {
  label: string;
  value: ReactNode;
  caption: string;
  icon: ReactNode;
  tone?: Tone;
  density?: Density;
}

export function KPICard({
  label,
  value,
  caption,
  icon,
  tone = "navy",
  density = "default",
}: KPICardProps) {
  return (
    <StatsCard
      label={label}
      value={value}
      caption={caption}
      icon={icon}
      tone={tone}
      density={density}
    />
  );
}
