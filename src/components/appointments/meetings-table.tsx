import { CalendarCheck2, Phone } from "lucide-react";
import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";
import type { AppointmentEntry, ProspectSheet } from "@/types/workspace.types";

export type AgentAppointmentItem = AppointmentEntry & { prospect: ProspectSheet };

export function MeetingsTable({
  items,
  today,
}: {
  items: readonly AgentAppointmentItem[];
  today: string;
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
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-[#102033]">
              Aucun rendez-vous pour ce filtre
            </p>
            <p className="max-w-md text-sm leading-6 text-[#607287]">
              Les rendez-vous qualifies par l'agent apparaitront ici avec leur
              creneau, la fiche associee et la note de suivi.
            </p>
          </div>
        </div>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper className="border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <div className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <thead className="bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)]">
            <tr>
              <TableHeadCell className="whitespace-nowrap">Heure</TableHeadCell>
              <TableHeadCell>Client</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">Telephone</TableHeadCell>
              <TableHeadCell>Campagne / file</TableHeadCell>
              <TableHeadCell>Note</TableHeadCell>
              <TableHeadCell className="whitespace-nowrap">Statut</TableHeadCell>
            </tr>
          </thead>

          <tbody className="[&_tr:last-child_td]:border-b-0">
            {items.map((item) => (
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
                      Rendez-vous programme depuis la qualification agent.
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
                    <p className="font-medium text-[#102033]">{item.campaign}</p>
                    <p className="text-sm text-[#607287]">{item.queue}</p>
                  </div>
                </TableCell>

                <TableCell className="max-w-[360px] align-top text-sm leading-6 text-[#607287]">
                  {item.note}
                </TableCell>

                <TableCell className="whitespace-nowrap align-top">
                  <span className="inline-flex rounded-full border border-[#d3efe3] bg-[#effbf5] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#15795d]">
                    Programme
                  </span>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </TableWrapper>
  );
}
