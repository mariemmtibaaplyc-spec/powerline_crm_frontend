"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Phone, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { SalesStatusBadge } from "@/components/admin-sales/sales-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminSales } from "@/features/admin-sales/hooks/use-admin-sales";

export function SalesDetailModule({ saleId }: { saleId: string }) {
  const { getAppointmentById } = useAdminSales();
  const appointment = getAppointmentById(saleId);

  if (!appointment) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Detail rendez-vous"
        description="Lecture simple d'un rendez-vous remonte depuis le suivi des ventes et de la qualification equipe."
        actions={
          <Link
            href="/admin/sales"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#dce6f0] bg-white px-5 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour liste
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                Fiche RDV
              </p>
              <h2 className="text-xl font-semibold text-[#102033]">
                {appointment.clientName}
              </h2>
              <div>
                <SalesStatusBadge status={appointment.status} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Date RDV", appointment.date],
                ["Heure", appointment.time],
                ["Campagne", appointment.campaign],
                ["Equipe / Groupe", appointment.team],
                ["Liste source", appointment.sourceList],
                ["Origine", appointment.sourceLabel],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.2rem] border border-[#dce6f0] bg-[#fbfdff] px-4 py-4"
                >
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#102033]">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)] shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                Suivi operationnel
              </p>
              <h2 className="text-xl font-semibold text-[#102033]">
                Resume commercial
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef5ff] text-[#295086]">
                  <Phone className="h-4 w-4" />
                </div>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                  Telephone
                </p>
                <p className="mt-2 text-base font-semibold text-[#102033]">
                  {appointment.phone}
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#effbf5] text-[#15795d]">
                  <UserRound className="h-4 w-4" />
                </div>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                  Agent
                </p>
                <p className="mt-2 text-base font-semibold text-[#102033]">
                  {appointment.agentName}
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-4 sm:col-span-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7e8] text-[#a76b18]">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                  Note courte
                </p>
                <p className="mt-2 text-sm leading-7 text-[#607287]">
                  {appointment.note}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
