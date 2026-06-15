import type { QualificationOption } from "@/types/workspace.types";

export const QUALIFICATION_OPTIONS: readonly QualificationOption[] = [
  { code: "call_transferred", label: "Appel transfere", group: "default" },
  { code: "wrong_number", label: "Faux numero", group: "default" },
  { code: "do_not_call", label: "Ne pas appeler", group: "default" },
  { code: "disconnected_number", label: "Numero deconnecte", group: "default" },
  { code: "busy", label: "Occupe", group: "default" },
  { code: "no_budget", label: "Pas de prix", group: "default" },
  { code: "no_answer", label: "Pas de reponse", group: "custom" },
  { code: "not_interested", label: "Pas interesse", group: "custom" },
  { code: "callback", label: "Rappel", group: "custom" },
  { code: "appointment", label: "RDV", group: "custom" },
  { code: "voicemail", label: "Repondeur", group: "custom" },
  { code: "sale_refused", label: "Vente refusee", group: "custom" },
] as const;

export const QUALIFICATION_GROUPS = [
  {
    title: "Par defaut",
    items: QUALIFICATION_OPTIONS.filter((option) => option.group === "default"),
  },
  {
    title: "Personnalise",
    items: QUALIFICATION_OPTIONS.filter((option) => option.group === "custom"),
  },
] as const;

export function findQualificationOption(code: string | null) {
  if (!code) return null;
  return QUALIFICATION_OPTIONS.find((option) => option.code === code) ?? null;
}
