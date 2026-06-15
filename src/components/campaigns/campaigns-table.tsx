import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";

interface CampaignRow {
  campaign: string;
  pace: string;
  available: number;
  wait: string;
  team: string;
}

interface CampaignsTableProps {
  title: string;
  subtitle: string;
  rows: CampaignRow[];
}

export function CampaignsTable({
  title,
  subtitle,
  rows,
}: CampaignsTableProps) {
  const getPaceTone = (pace: string) => {
    if (pace.toLowerCase().includes("maximum")) {
      return "bg-[#fff3e7] text-[#8a5425]";
    }
    if (pace.toLowerCase().includes("normal")) {
      return "bg-[#eef8f6] text-[#0f6a66]";
    }
    return "bg-[#eef4ff] text-[#295086]";
  };

  const getWaitTone = (wait: string) => {
    const value = Number.parseInt(wait, 10);
    if (Number.isNaN(value)) return "bg-[#f4f8fc] text-[#607287]";
    if (value >= 25) return "bg-[#fff0ec] text-[#a1462a]";
    if (value >= 10) return "bg-[#fff6ea] text-[#9a622e]";
    return "bg-[#edf8f4] text-[#0f6a66]";
  };

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(93,222,199,0.16),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">{title}</h3>
          <p className="mt-1 text-sm text-[#65788c]">{subtitle}</p>
        </div>
        <div className="rounded-full bg-[#eef8f6] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#0f6a66]">
          Recap campagne
        </div>
      </div>

      <div className="mt-5">
        <TableWrapper className="rounded-[1.4rem] border-[#edf2f7] shadow-none">
          <Table>
            <thead>
              <tr>
                <TableHeadCell>Campagne</TableHeadCell>
                <TableHeadCell>Vitesse</TableHeadCell>
                <TableHeadCell>Disponibles</TableHeadCell>
                <TableHeadCell>Attente max</TableHeadCell>
                <TableHeadCell>Equipe</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.campaign}>
                  <TableCell className="font-medium">{row.campaign}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPaceTone(row.pace)}`}
                    >
                      {row.pace}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-[#17304a]">
                      {row.available.toLocaleString("fr-FR")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getWaitTone(row.wait)}`}
                    >
                      {row.wait}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-[#f5f9fd] px-2.5 py-1 text-xs font-medium text-[#4f6478]">
                      {row.team}
                    </span>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </div>
    </div>
  );
}
