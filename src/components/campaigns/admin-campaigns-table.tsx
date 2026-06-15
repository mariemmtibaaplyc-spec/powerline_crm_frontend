"use client";

import { Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCampaignTypeLabel } from "@/features/campaigns/mocks/campaigns.mock";
import type { CampaignRecord } from "@/types/campaign.types";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function AdminCampaignsTable({
  campaigns,
  togglingCampaignIds,
  onActivate,
  onDeactivate,
}: {
  campaigns: CampaignRecord[];
  togglingCampaignIds: Record<string, boolean>;
  onActivate: (id: string) => Promise<void> | void;
  onDeactivate: (id: string) => Promise<void> | void;
}) {
  const router = useRouter();

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>Nom campagne</TableHeadCell>
            <TableHeadCell>Description</TableHeadCell>
            <TableHeadCell>Type</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
            <TableHeadCell>Leads</TableHeadCell>
            <TableHeadCell>Agents</TableHeadCell>
            <TableHeadCell>Creation</TableHeadCell>
            <TableHeadCell className="text-right">Action</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              title="Voir le detail"
              className="cursor-pointer transition-colors hover:bg-[#f7fbff]"
              onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
            >
              <TableCell>
                <div className="space-y-1">
                  <p className="font-semibold text-[#102033]">{campaign.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">ID {campaign.id}</p>
                </div>
              </TableCell>
              <TableCell>{campaign.description || "Aucune description"}</TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#295086]">
                  {getCampaignTypeLabel(campaign.type)}
                </span>
              </TableCell>
              <TableCell>
                <CampaignStatusBadge status={campaign.status} />
              </TableCell>
              <TableCell>{campaign.leadsCount.toLocaleString("fr-FR")}</TableCell>
              <TableCell>{campaign.agentsCount.toLocaleString("fr-FR")}</TableCell>
              <TableCell>{campaign.createdAt}</TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant={campaign.status === "active" ? "danger" : "secondary"}
                  className="h-10 px-4 text-xs uppercase tracking-[0.14em]"
                  disabled={togglingCampaignIds[campaign.id]}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (campaign.status === "active") {
                      void onDeactivate(campaign.id);
                      return;
                    }

                    void onActivate(campaign.id);
                  }}
                >
                  <Power className="mr-2 h-3.5 w-3.5" />
                  {togglingCampaignIds[campaign.id]
                    ? "Traitement..."
                    : campaign.status === "active"
                      ? "Desactiver"
                      : "Activer"}
                </Button>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
