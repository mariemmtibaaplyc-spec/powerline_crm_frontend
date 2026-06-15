"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, CalendarDays, RotateCcw } from "lucide-react";
import {
  CallsTable,
  type AgentHistoryItem,
} from "@/components/calls/calls-table";
import { PageHeader } from "@/components/layout/page-header";
import { formatInputDate } from "@/features/workspace/mocks/mock.utils";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function Page() {
  const router = useRouter();
  const { historyEntries, openReminderCall } = useAgentWorkspaceState();
  const today = formatInputDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);

  const filteredHistory = useMemo(
    () => historyEntries.filter((item) => item.date === selectedDate),
    [historyEntries, selectedDate],
  );

  function handleCallClient(item: AgentHistoryItem) {
    openReminderCall(item);
    router.push("/agent");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Agent workspace"
        title="Historique"
        description="Journal recent des appels sortants, des qualifications et des issues traitees par l'agent sur la session."
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
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-6 border-0 bg-transparent p-0 text-sm font-medium text-[#102033] outline-none"
                />
              </div>
            </div>

            <span className="inline-flex min-h-[72px] items-center gap-2 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <BellRing className="h-4 w-4 text-[#5d7690]" />
              {filteredHistory.length} appels affiches
            </span>

            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="inline-flex min-h-[72px] items-center gap-2 rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:border-[#c9d8e7] hover:bg-[#f8fbff]"
            >
              <RotateCcw className="h-4 w-4" />
              Aujourd'hui
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[1.4rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] px-4 py-3 text-sm text-[#607287] shadow-[0_12px_28px_rgba(20,32,53,0.05)]">
        <span className="font-medium text-[#102033]">
          Vue du {formatDisplayDate(selectedDate)}
        </span>
        <span className="h-1 w-1 rounded-full bg-[#8aa2bc]" />
        <span>Affichage centre sur le journal des appels et des qualifications.</span>
      </div>

      <CallsTable
        items={filteredHistory}
        today={today}
        onCallClient={handleCallClient}
      />
    </section>
  );
}
