"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, CalendarDays, RotateCcw } from "lucide-react";
import {
  AppointmentsTable,
  type AgentReminderItem,
} from "@/components/appointments/appointments-table";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import { formatInputDate } from "@/features/workspace/mocks/mock.utils";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";

const PAGE_SIZE = 10;
const REFRESH_INTERVAL_MS = 300_000; // 5 minutes — cohérent avec la page RDV

function formatDisplayDate(value: string) {
  // Le <input type="date"> émet une valeur vide/partielle pendant la saisie
  // (ex: "2026-07-" en tapant) avant d'atteindre une date complète valide —
  // éviter de crasher sur `new Date(...)` invalide dans ce cas transitoire.
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-TN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export default function Page() {
  const router = useRouter();
  const { latestReminderFocusDate, openReminderCall, reminders, fetchReminders } =
    useAgentWorkspaceState();
  const today = formatInputDate(new Date());
  const [selectedDate, setSelectedDate] = useState(
    latestReminderFocusDate ?? today,
  );
  // Filtre optionnel par date de qualification (created_at) — vide = pas de
  // filtre sur cet axe, distinct du filtre sur la date de rappel (scheduledAt).
  const [selectedQualificationDate, setSelectedQualificationDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Chargement au montage + rafraîchissement automatique — le backend est la
  // source de vérité (GET /reminders), plus de données mock côté store.
  useEffect(() => {
    fetchReminders();
    const interval = window.setInterval(() => fetchReminders(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedQualificationDate]);

  useEffect(() => {
    if (!latestReminderFocusDate) {
      return;
    }

    setSelectedDate(latestReminderFocusDate);
  }, [latestReminderFocusDate]);

  const filteredReminders = useMemo(() => {
    return reminders
      .filter((reminder) => {
        // Chaque filtre fonctionne indépendamment de l'autre : dès que la
        // "Date de qualification" est renseignée, elle pilote seule
        // l'affichage (rappels qualifiés ce jour-là, quelle que soit leur
        // date de rappel) — elle ne s'ajoute pas au filtre "Date", elle le
        // remplace. Sans quoi le filtre "Date" (toujours renseigné) inclut
        // en permanence ses propres résultats et la qualification ne
        // retirerait jamais rien de la liste.
        if (selectedQualificationDate) {
          return reminder.qualifiedAt?.slice(0, 10) === selectedQualificationDate;
        }

        return reminder.date === selectedDate;
      })
      .sort((left, right) => {
        if (left.date !== right.date) {
          return left.date.localeCompare(right.date);
        }

        return left.time.localeCompare(right.time);
      });
  }, [reminders, selectedDate, selectedQualificationDate]);

  const totalPages = Math.max(1, Math.ceil(filteredReminders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReminders = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredReminders.slice(start, start + PAGE_SIZE);
  }, [filteredReminders, safeCurrentPage]);

  const selectionNote =
    selectedDate === today
      ? "Affichage centre sur les rappels du jour."
      : `Affichage des rappels planifies pour le ${formatDisplayDate(selectedDate)}.`;

  function handleCallReminder(reminder: AgentReminderItem) {
    openReminderCall(reminder);
    router.push("/agent");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Agent workspace"
        title="Rappels"
        description="Relances planifiees depuis la qualification agent. La vue charge par defaut les rappels du jour pour reprendre rapidement la file commerciale."
        actions={
          <>
            <div className="inline-flex min-h-[72px] items-center gap-3 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(20,32,53,0.06)]">
              <CalendarDays className="h-4 w-4 text-[#5d7690]" />
              <div className="space-y-1">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                  Date
                </p>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    // Ignore les valeurs vides/partielles émises pendant la
                    // saisie (voir formatDisplayDate) — ce filtre est requis,
                    // il ne doit jamais rester vide.
                    if (event.target.value) {
                      setSelectedDate(event.target.value);
                    }
                  }}
                  className="h-6 border-0 bg-transparent p-0 text-sm font-medium text-[#102033] outline-none"
                />
              </div>
            </div>

            <div className="inline-flex min-h-[72px] items-center gap-3 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(20,32,53,0.06)]">
              <CalendarDays className="h-4 w-4 text-[#5d7690]" />
              <div className="space-y-1">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                  Date de qualification
                </p>
                <input
                  type="date"
                  value={selectedQualificationDate}
                  onChange={(event) => setSelectedQualificationDate(event.target.value)}
                  className="h-6 border-0 bg-transparent p-0 text-sm font-medium text-[#102033] outline-none"
                />
              </div>
            </div>

            <span className="inline-flex min-h-[72px] items-center gap-2 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <BellRing className="h-4 w-4 text-[#5d7690]" />
              {filteredReminders.length} rappels affiches
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedDate(today);
                setSelectedQualificationDate("");
              }}
              className="inline-flex min-h-[72px] items-center gap-2 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff]"
            >
              <RotateCcw className="h-4 w-4" />
              Aujourd'hui
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3 text-sm text-[#607287] shadow-[0_12px_28px_rgba(20,32,53,0.05)]">
        {selectedQualificationDate ? (
          <span className="font-medium text-[#102033]">
            Rappels qualifies le {formatDisplayDate(selectedQualificationDate)}.
          </span>
        ) : (
          <>
            <span className="font-medium text-[#102033]">
              Vue du {formatDisplayDate(selectedDate)}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#8aa2bc]" />
            <span>{selectionNote}</span>
          </>
        )}
      </div>

      <AppointmentsTable
        items={paginatedReminders}
        today={today}
        onCallReminder={handleCallReminder}
      />

      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
