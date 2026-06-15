import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { REPORTING_SURFACE_CLASS } from "@/features/reporting/lib/colors";
import { cn } from "@/lib/utils";

interface ReportingTableCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ReportingTableCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: ReportingTableCardProps) {
  return (
    <Card className={cn(REPORTING_SURFACE_CLASS, className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
