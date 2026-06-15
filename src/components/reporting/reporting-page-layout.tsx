import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";

interface ReportingPageLayoutProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ReportingPageLayout({
  eyebrow,
  title,
  description,
  actions,
  children,
}: ReportingPageLayoutProps) {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      {children}
    </section>
  );
}
