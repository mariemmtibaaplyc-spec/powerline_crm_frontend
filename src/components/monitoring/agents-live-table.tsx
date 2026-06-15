import {
  Table,
  TableCell,
  TableHeadCell,
  TableWrapper,
} from "@/components/ui/table";

interface AgentRow {
  name: string;
  campaign: string;
  status: string;
  occupancy: string;
  quality: string;
}

interface AgentsLiveTableProps {
  title: string;
  subtitle: string;
  rows: AgentRow[];
}

export function AgentsLiveTable({
  title,
  subtitle,
  rows,
}: AgentsLiveTableProps) {
  const getStatusTone = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("appel")) return "bg-[#fff3e7] text-[#8a5425]";
    if (normalized.includes("qualification")) {
      return "bg-[#eef4ff] text-[#295086]";
    }
    if (normalized.includes("disponible")) return "bg-[#edf8f4] text-[#0f6a66]";
    return "bg-[#f5f9fd] text-[#506478]";
  };

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[#dce6f0] bg-white p-5 shadow-[0_14px_34px_rgba(20,32,53,0.06)] sm:p-6">
      <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(227,165,109,0.14),transparent_72%)] blur-2xl" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#102033]">{title}</h3>
          <p className="mt-1 text-sm text-[#65788c]">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3e7] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#8a5425]">
          <span className="h-2 w-2 rounded-full bg-[#e3a56d]" />
          4 agents suivis
        </div>
      </div>

      <div className="mt-5">
        <TableWrapper className="rounded-[1.4rem] border-[#edf2f7] shadow-none">
          <Table>
            <thead>
              <tr>
                <TableHeadCell>Agent</TableHeadCell>
                <TableHeadCell>Campagne</TableHeadCell>
                <TableHeadCell>Statut</TableHeadCell>
                <TableHeadCell>Occupation</TableHeadCell>
                <TableHeadCell>Qualite</TableHeadCell>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.campaign}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-[#17304a]">
                      {row.occupancy}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-[#edf8f4] px-2.5 py-1 text-xs font-medium text-[#0f6a66]">
                      {row.quality}
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
