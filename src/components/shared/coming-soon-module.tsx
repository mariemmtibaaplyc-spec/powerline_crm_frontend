"use client";

import { Clock3, Info } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonModuleProps {
  eyebrow?: string;
  title: string;
  description: string;
  note: string;
  backHref?: string;
  backLabel?: string;
}

export function ComingSoonModule({
  eyebrow = "Administration CRM",
  title,
  description,
  note,
  backHref,
  backLabel = "Retour",
}: ComingSoonModuleProps) {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              {backLabel}
            </Link>
          ) : undefined
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#295086]">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Bientot disponible</CardTitle>
              <CardDescription>
                Cette page reste accessible, mais aucune API backend n est exposee pour remplacer le mock proprement.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.35rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-5 py-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 text-[#7a8da3]" />
              <p className="text-sm leading-6 text-[#607287]">{note}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
