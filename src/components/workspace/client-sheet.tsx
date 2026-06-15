"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentWorkspaceState } from "@/components/workspace/agent-workspace-provider";

interface ClientField {
  label: string;
  value: string;
  span?: string;
}

export function ClientSheet() {
  const { activeProspect, agentStatus, isPaused } = useAgentWorkspaceState();
  const shouldHideProspectData = isPaused || agentStatus === "waiting";

  const primaryFields: readonly ClientField[] = [
    {
      label: "Prenom",
      value: activeProspect.firstName,
    },
    {
      label: "Nom",
      value: activeProspect.lastName,
    },
    {
      label: "Telephone",
      value: activeProspect.phone,
    },
    {
      label: "Telephone 2",
      value: activeProspect.phoneSecondary,
    },
    {
      label: "Email",
      value: activeProspect.email,
      span: "xl:col-span-2",
    },
    {
      label: "Adresse",
      value: activeProspect.address,
    },
    {
      label: "Code postal",
      value: activeProspect.postalCode,
    },
    {
      label: "Ville",
      value: activeProspect.city,
    },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-[1.85rem] border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(93,148,235,0.08),transparent)]" />
      <div className="border-b border-[#e5edf6] px-6 py-5 sm:px-7">
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7a8da3]">
          Fiche prospect
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#102033]">
          Informations du prospect
        </h2>
        <p className="mt-1 text-sm text-[#607287]">
          {shouldHideProspectData
            ? "Aucune fiche n'est chargee tant que l'agent est en pause ou en attente."
            : "Vue de production pour qualifier, completer et enrichir la fiche en cours d'appel."}
        </p>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-7">
        <div className="grid gap-4 xl:grid-cols-2">
          {primaryFields.map((field) => (
            <label
              key={field.label}
              className={field.span ? field.span : ""}
            >
              <span className="mb-2 block text-sm font-medium text-[#24415d]">
                {field.label}
              </span>
              <Input
                value={shouldHideProspectData ? "" : field.value}
                readOnly
                className="h-12 rounded-[1.15rem] border-[#d7e3ef] bg-[#fcfeff] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
              />
            </label>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#24415d]">
            Commentaires
          </span>
          <Textarea
            value={
              shouldHideProspectData
                ? ""
                : activeProspect.comments
            }
            readOnly
            className="min-h-[160px] rounded-[1.25rem] border-[#d7e3ef] bg-[#fcfeff] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
          />
        </label>
      </div>
    </div>
  );
}
