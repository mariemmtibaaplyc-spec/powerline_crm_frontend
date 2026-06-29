"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, RefreshCw } from "lucide-react";
import {
  MeetingsTable,
  type AgentAppointmentItem,
} from "@/components/appointments/meetings-table";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";
import { formatInputDate } from "@/features/workspace/mocks/mock.utils";

const PAGE_SIZE = 10;
const REFRESH_INTERVAL_MS = 300_000; // 5 minutes — cohérent avec le footer

// Garde défensive conservée : la fonction peut être réutilisée avec un value null
// sans risquer un crash RangeError (new Date("nullT00:00:00")).
function formatDisplayDate(value: string | null): string {
  if (!value) return "Tous les rendez-vous";
  return new Intl.DateTimeFormat("fr-TN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function Page() {
  const { appointments, fetchAppointments } = useAgentWorkspaceState();
  const today = formatInputDate(new Date());
  const [currentPage, setCurrentPage] = useState(1);

  // Chargement au montage + rafraîchissement automatique toutes les 5 minutes
  useEffect(() => {
    fetchAppointments(today);
    const interval = window.setInterval(() => fetchAppointments(today), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Les appointments chargés par fetchAppointments(today) sont déjà filtrés
  // côté API par scheduled_at = today — tri local par heure uniquement
  const sorted = useMemo(() =>
    [...appointments].sort((a, b) => a.time.localeCompare(b.time)),
    [appointments]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedAppointments = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, safeCurrentPage]);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Agent workspace"
        title="Rendez-vous"
        description="Rendez-vous planifies pour aujourd'hui — mis a jour toutes les 5 minutes."
        actions={
          <>
            <span className="inline-flex min-h-[72px] items-center gap-2 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <CalendarCheck2 className="h-4 w-4 text-[#5d7690]" />
              {sorted.length} RDV affiches
            </span>

            <button
              type="button"
              onClick={() => fetchAppointments(today)}
              className="inline-flex min-h-[72px] items-center gap-2 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff]"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3 text-sm text-[#607287] shadow-[0_12px_28px_rgba(20,32,53,0.05)]">
        <span className="font-medium text-[#102033]">
          Vue du {formatDisplayDate(today)}
        </span>
        <span className="h-1 w-1 rounded-full bg-[#8aa2bc]" />
        <span>Affichage centre sur les rendez-vous du jour.</span>
      </div>

      <MeetingsTable
        items={paginatedAppointments as AgentAppointmentItem[]}
        today={today}
      />

      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
