import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Qualifications"
        description="Les qualifications sont liees a une campagne precise et se consultent depuis la fiche campagne."
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardContent className="px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#102033]">
            Selectionnez une campagne pour voir ses qualifications.
          </p>
          <p className="mt-2 text-sm text-[#607287]">
            La route globale des qualifications n existe pas sur le backend.
          </p>
          <Link
            href="/admin/campaigns"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Ouvrir les campagnes
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
