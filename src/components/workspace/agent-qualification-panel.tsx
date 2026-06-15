"use client";

import { ArrowRight, PauseCircle, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";

export function AgentQualificationPanel() {
  const {
    currentStatusMeta,
    closeQualification,
    qualificationGroups,
    qualificationPanelOpen,
    selectQualification,
    selectedQualification,
  } = useAgentWorkspaceState();

  if (!qualificationPanelOpen) {
    return null;
  }

  const canSubmitQualification = selectedQualification !== null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[35]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_42%,rgba(7,12,20,0.08)_62%,rgba(7,12,20,0.18)_100%)]" />
      <aside className="pointer-events-auto absolute inset-x-4 bottom-28 top-24 overflow-hidden rounded-[1.9rem] border border-[#d99154]/18 bg-[linear-gradient(180deg,rgba(15,27,42,0.98)_0%,rgba(9,18,31,0.99)_100%)] text-white shadow-[0_34px_90px_rgba(7,12,20,0.4)] sm:top-28 md:inset-x-auto md:right-4 md:w-[380px] lg:right-6 lg:w-[400px] xl:w-[420px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(217,145,84,0.16),transparent)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 bg-[radial-gradient(circle,rgba(240,181,125,0.18),transparent_72%)] blur-3xl" />

        <div className="relative flex h-full flex-col">
          <div className="border-b border-white/8 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-white/38">
                  Qualification workspace
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Panneau de qualification
                </h3>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                  currentStatusMeta.badgeDark,
                )}
              >
                <span
                  className={cn("h-2.5 w-2.5 rounded-full", currentStatusMeta.dotClass)}
                />
                {currentStatusMeta.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Selectionner une qualification avant de poursuivre la file ou de
              remettre l'agent en pause.
            </p>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {qualificationGroups.map((group) => (
              <section key={group.title}>
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4 text-[#f0b57d]" />
                  <h4 className="text-sm font-semibold text-white">
                    {group.title}
                  </h4>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => {
                    const active = selectedQualification === item.code;

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => selectQualification(item.code)}
                        className={cn(
                          "rounded-[1rem] border px-3 py-3 text-left text-sm font-medium transition",
                          active
                            ? "border-[#d99154]/24 bg-[#fff4e8]/10 text-white shadow-[0_12px_24px_rgba(217,145,84,0.12)]"
                            : "border-white/8 bg-white/[0.045] text-white/74 hover:border-white/12 hover:bg-white/[0.075] hover:text-white",
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="border-t border-white/8 bg-[rgba(255,255,255,0.03)] px-5 py-4 sm:px-6">
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.045] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/44">
                Qualification selectionnee
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {qualificationGroups
                  .flatMap((group) => group.items)
                  .find((item) => item.code === selectedQualification)?.label ||
                  "Aucune qualification choisie"}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => closeQualification("paused")}
                disabled={!canSubmitQualification}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#8d7cff]/18 bg-[#241e4d] px-5 text-sm font-semibold text-[#ddd3ff] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                <PauseCircle className="h-4 w-4" />
                Pause
              </button>
              <button
                type="button"
                onClick={() => closeQualification("waiting")}
                disabled={!canSubmitQualification}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f0b57d_0%,#d99154_100%)] px-5 text-sm font-semibold text-[#1a2533] shadow-[0_18px_36px_rgba(217,145,84,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
