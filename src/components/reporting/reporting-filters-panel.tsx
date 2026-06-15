import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REPORTING_SURFACE_CLASS } from "@/features/reporting/lib/colors";
import { cn } from "@/lib/utils";

interface ReportingFiltersProps {
  title?: string;
  description: string;
  from: string;
  to: string;
  extraFields?: ReactNode;
  isLoading?: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void | Promise<void>;
  compact?: boolean;
  className?: string;
}

export function ReportingFilters({
  title = "Filtres",
  description,
  from,
  to,
  extraFields,
  isLoading = false,
  onFromChange,
  onToChange,
  onSubmit,
  onReset,
  compact = false,
  className,
}: ReportingFiltersProps) {
  return (
    <Card className={cn(REPORTING_SURFACE_CLASS, className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={compact ? "pt-2" : undefined}>
        <form
          className={cn(
            extraFields
              ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
              : "grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]",
            compact
              ? extraFields
                ? "items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
                : "items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
              : undefined,
          )}
          onSubmit={onSubmit}
        >
          <label className="space-y-2">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
              From
            </span>
            <Input
              type="date"
              value={from}
              className={compact ? "h-9 rounded-xl px-3 text-sm" : undefined}
              onChange={(event) => onFromChange(event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6b7e92]">
              To
            </span>
            <Input
              type="date"
              value={to}
              className={compact ? "h-9 rounded-xl px-3 text-sm" : undefined}
              onChange={(event) => onToChange(event.target.value)}
            />
          </label>

          {extraFields}

          <Button className={cn("mt-auto", compact ? "h-9 rounded-xl px-4" : undefined)} type="submit" disabled={isLoading}>
            {isLoading ? "Chargement..." : "Appliquer"}
          </Button>

          <Button
            className={cn("mt-auto", compact ? "h-9 rounded-xl px-3.5" : undefined)}
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={() => {
              void onReset();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recharger
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
