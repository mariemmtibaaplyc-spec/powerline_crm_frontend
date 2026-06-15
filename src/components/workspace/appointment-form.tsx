"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";
import { formatInputDate } from "@/features/workspace/mocks/mock.utils";

function createDefaultReminderDateTime() {
  const now = new Date();
  const scheduledAt = new Date(now);
  const currentHour = now.getHours();

  if (currentHour >= 18) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
    scheduledAt.setHours(9, 30, 0, 0);
  } else if (currentHour < 10) {
    scheduledAt.setHours(11, 15, 0, 0);
  } else if (currentHour < 14) {
    scheduledAt.setHours(15, 45, 0, 0);
  } else {
    scheduledAt.setHours(17, 30, 0, 0);
  }

  return {
    date: formatInputDate(scheduledAt),
    time: scheduledAt.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function AppointmentForm() {
  const {
    activeProspect,
    cancelReminderForm,
    pendingQualificationNextStatus,
    reminderFormOpen,
    submitReminderQualification,
  } = useAgentWorkspaceState();
  const defaults = useMemo(() => createDefaultReminderDateTime(), [reminderFormOpen]);
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!reminderFormOpen) {
      return;
    }

    setDate(defaults.date);
    setTime(defaults.time);
    setNote("");
  }, [defaults.date, defaults.time, reminderFormOpen]);

  if (!reminderFormOpen) {
    return null;
  }

  const canSubmit = Boolean(date && time && note.trim());
  const nextStatusLabel =
    pendingQualificationNextStatus === "paused" ? "En pause" : "En attente";

  return (
    <div className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center bg-[rgba(7,12,20,0.46)] px-4 py-6 backdrop-blur-sm">
      <div className="pointer-events-auto relative w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f4f8fc_100%)] shadow-[0_34px_90px_rgba(7,12,20,0.24)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(93,148,235,0.14),transparent)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-[radial-gradient(circle,rgba(45,111,203,0.16),transparent_72%)] blur-3xl" />

        <div className="relative border-b border-[#e3ebf4] px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6d8094]">
                Qualification rappel
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#102033]">
                Programmer le rappel
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#607287]">
                La qualification `Rappel` doit etre completee avant de relancer la
                file. Le rappel sera rattache a la fiche active.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelReminderForm}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dce6f0] bg-white text-[#516579] shadow-[0_10px_24px_rgba(20,32,53,0.06)] transition hover:bg-[#f8fbff]"
              aria-label="Fermer le formulaire de rappel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative space-y-6 px-6 py-6 sm:px-7">
          <div className="rounded-[1.35rem] border border-[#dce6f0] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(20,32,53,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6d8094]">
              Prospect concerne
            </p>
            <p className="mt-2 text-lg font-semibold text-[#102033]">
              {activeProspect.firstName} {activeProspect.lastName}
            </p>
            <p className="mt-1 text-sm text-[#607287]">
              {activeProspect.phone} • sortie prevue vers {nextStatusLabel}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-[#24415d]">
                <CalendarDays className="h-4 w-4 text-[#5d7690]" />
                Date du rappel
              </span>
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-12 rounded-[1.15rem] border-[#d7e3ef] bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-[#24415d]">
                <Clock3 className="h-4 w-4 text-[#5d7690]" />
                Heure du rappel
              </span>
              <Input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="h-12 rounded-[1.15rem] border-[#d7e3ef] bg-white"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#24415d]">
              Raison / note du rappel
            </span>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Exemple : prospect disponible en fin d'apres-midi apres validation familiale."
              className="min-h-[150px] rounded-[1.25rem] border-[#d7e3ef] bg-white"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-[#e3ebf4] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#607287]">
              Le rappel ne sera cree qu'apres validation complete du formulaire.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={cancelReminderForm}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#dce6f0] bg-white px-5 text-sm font-semibold text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:bg-[#f8fbff]"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() =>
                  submitReminderQualification({
                    date,
                    time,
                    note,
                  })
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f0b57d_0%,#d99154_100%)] px-5 text-sm font-semibold text-[#1a2533] shadow-[0_18px_36px_rgba(217,145,84,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                Valider le rappel
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
