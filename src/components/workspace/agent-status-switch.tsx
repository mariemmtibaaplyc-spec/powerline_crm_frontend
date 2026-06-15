import { Clock3, PauseCircle } from "lucide-react";

const timeline = [
  { label: "Communication", value: "00:00:00", tone: "text-[#2d6fcb]" },
  { label: "Qualification", value: "00:48:47", tone: "text-[#c48f17]" },
  { label: "Attente", value: "00:00:00", tone: "text-[#607287]" },
  { label: "Pause", value: "00:46:13", tone: "text-[#0f8b6d]" },
] as const;

export function AgentStatusSwitch() {
  return (
    <div className="rounded-[1.75rem] border border-[#dce6f0] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_18px_42px_rgba(20,32,53,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7a8da3]">
            Statut agent
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#f3d7bf] bg-[#fff8f1] px-3 py-2 text-sm font-semibold text-[#8a5425]">
            <PauseCircle className="h-4 w-4" />
            En pause
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-3 text-right shadow-[0_10px_24px_rgba(20,32,53,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">
            Chrono d'etat
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#102033]">05:10</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {timeline.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.15rem] border border-[#e8eef6] bg-[#fbfdff] px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">
              {item.label}
            </p>
            <p className={`mt-2 text-sm font-semibold ${item.tone}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[1.2rem] border border-[#e8eef6] bg-white px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">
            Total session
          </p>
          <p className="mt-2 text-lg font-semibold text-[#102033]">02:05:29</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-2 text-sm font-medium text-[#295086]">
          <Clock3 className="h-4 w-4" />
          Pret a reprendre
        </div>
      </div>
    </div>
  );
}
