import { BellOff, Phone, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";
import type {
  HistoryEntry,
  HistoryStatus,
  ProspectSheet,
} from "@/types/workspace.types";

export type AgentHistoryStatus = HistoryStatus;
export type AgentHistoryItem = HistoryEntry & { prospect: ProspectSheet };

const STATUS_META: Record<
  AgentHistoryStatus,
  {
    label: string;
    className: string;
  }
> = {
  completed: {
    label: "Cloture",
    className: "border-[#d9e8fb] bg-[#eef5ff] text-[#295086]",
  },
  follow_up: {
    label: "A relancer",
    className: "border-[#f3dcc5] bg-[#fff3e7] text-[#a85d1e]",
  },
  appointment: {
    label: "RDV",
    className: "border-[#d3efe3] bg-[#effbf5] text-[#15795d]",
  },
  unreachable: {
    label: "Non joignable",
    className: "border-[#e2def7] bg-[#f4f0ff] text-[#5d4bb0]",
  },
  refused: {
    label: "Refus",
    className: "border-[#f5d5db] bg-[#fff1f4] text-[#b05368]",
  },
  voicemail: {
    label: "Repondeur",
    className: "border-[#dce6f0] bg-[#f6f9fc] text-[#59708a]",
  },
};

export function CallsTable({
  items,
  today,
  onCallClient,
}: {
  items: readonly AgentHistoryItem[];
  today: string;
  onCallClient?: (item: AgentHistoryItem) => void;
}) {
  function formatRowDate(value: string) {
    if (value === today) {
      return "Aujourd'hui";
    }

    return new Intl.DateTimeFormat("fr-TN", {
      day: "2-digit",
      month: "short",
    }).format(new Date(`${value}T00:00:00`));
  }

  if (items.length === 0) {
    return (
      <TableWrapper className="border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#dce6f0] bg-[#f8fbff] text-[#45698f]">
            <BellOff className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-[#102033]">
              Aucun appel sur cette date
            </p>
            <p className="max-w-md text-sm leading-6 text-[#607287]">
              L'historique des qualifications, refus et rappels traites
              s'affichera ici selon la date selectionnee.
            </p>
          </div>
        </div>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper className="border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px]">
          <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
            <tr>
              <TableHeadCell className="whitespace-nowrap">Heure</TableHeadCell>
              <TableHeadCell>Client</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">
                Telephone
              </TableHeadCell>
              <TableHeadCell>Campagne / file</TableHeadCell>
              <TableHeadCell>Resultat</TableHeadCell>
              <TableHeadCell>Resume</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">Statut</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap text-right">
                Action
              </TableHeadCell>
            </tr>
          </thead>

          <tbody className="[&_tr:last-child_td]:border-b-0">
            {items.map((item) => {
              const statusMeta = STATUS_META[item.status];

              return (
                <tr
                  key={item.id}
                  className="transition hover:bg-[linear-gradient(180deg,#fbfdff_0%,#f7fbff_100%)]"
                >
                  <TableCell className="whitespace-nowrap align-top">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-[#102033]">
                        {item.time}
                      </p>
                      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                        {formatRowDate(item.date)}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-semibold text-[#102033]">
                        {item.clientName}
                      </p>
                      <p className="text-sm text-[#607287]">
                        Fiche traitee sur l'historique recent agent.
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap align-top">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#dce6f0] bg-[#f8fbff] px-3 py-2 text-sm font-medium text-[#24415d]">
                      <Phone className="h-4 w-4 text-[#6082a8]" />
                      {item.phone}
                    </div>
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-[#102033]">
                        {item.campaign}
                      </p>
                      <p className="text-sm text-[#607287]">{item.queue}</p>
                    </div>
                  </TableCell>

                  <TableCell className="align-top">
                    <p className="font-medium text-[#102033]">{item.result}</p>
                  </TableCell>

                  <TableCell className="max-w-[360px] align-top text-sm leading-6 text-[#607287]">
                    {item.summary}
                  </TableCell>

                  <TableCell className="whitespace-nowrap align-top">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
                        statusMeta.className,
                      )}
                    >
                      {statusMeta.label}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right align-top">
                    <button
                      type="button"
                      onClick={() => onCallClient?.(item)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfe0f5] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-[#2d6fcb] shadow-[0_10px_22px_rgba(20,32,53,0.05)] transition hover:-translate-y-0.5 hover:border-[#2d6fcb] hover:bg-[linear-gradient(180deg,#eef5ff_0%,#e3efff_100%)] hover:text-[#1f5fbb]"
                      aria-label={`Rappeler ${item.clientName}`}
                    >
                      <PhoneCall className="h-4 w-4" />
                    </button>
                  </TableCell>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </TableWrapper>
  );
}
