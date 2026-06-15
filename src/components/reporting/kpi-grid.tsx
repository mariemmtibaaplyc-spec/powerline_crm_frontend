import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KPIGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>;
}
