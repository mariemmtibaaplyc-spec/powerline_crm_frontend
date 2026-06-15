import type { ReactNode } from "react";
import { CircleDot, Layers3 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  eyebrow?: string;
  statusLabel?: string;
  highlights?: string[];
  note?: ReactNode;
}

export function AdminPlaceholderPage({
  title,
  description,
  eyebrow = "Admin workspace",
  statusLabel = "Section prete",
  highlights = [],
  note,
}: AdminPlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
            <span className="h-2 w-2 rounded-full bg-[#2d6fcb]" />
            {statusLabel}
          </span>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
          <CardHeader>
            <CardTitle>Module en preparation</CardTitle>
            <CardDescription>
              Cette route est deja branchee dans la navigation admin et peut
              maintenant accueillir ses composants metier, ses filtres et ses
              tableaux.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.35rem] border border-[#e7eef5] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#295086]">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#102033]">
                    Structure de navigation deja active
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#65788c]">
                    Le shell admin, la sidebar et les etats actifs sont prets.
                    Il reste a brancher la logique fonctionnelle de ce module.
                  </p>
                </div>
              </div>
            </div>

            {note ? (
              <div className="rounded-[1.25rem] border border-[#dce6f0] bg-white px-4 py-3 text-sm leading-7 text-[#607287] shadow-[0_10px_24px_rgba(20,32,53,0.04)]">
                {note}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_14px_34px_rgba(20,32,53,0.06)]">
          <CardHeader>
            <CardTitle>Perimetre de la section</CardTitle>
            <CardDescription>
              Repere rapide des sujets fonctionnels a couvrir dans ce module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2.5">
              {highlights.length > 0 ? (
                highlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d9e7f7] bg-[#f5f9ff] px-3 py-2 text-sm font-medium text-[#295086]"
                  >
                    <CircleDot className="h-3.5 w-3.5" />
                    {item}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dce6f0] bg-[#f8fbff] px-3 py-2 text-sm font-medium text-[#6b7e92]">
                  <CircleDot className="h-3.5 w-3.5" />
                  Perimetre a definir
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
