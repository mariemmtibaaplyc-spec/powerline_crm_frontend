"use client";

import { useEffect } from "react";
import { useCampaignLeads } from "@/features/campaign-leads/hooks/use-campaign-leads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

export function CampaignLeadsPanel({ campaignId }: { campaignId: string }) {
  const { leads, isLoadingLeads, leadsError, loadCampaignLeads } = useCampaignLeads(campaignId);

  useEffect(() => {
    void loadCampaignLeads(campaignId, true);
  }, [campaignId, loadCampaignLeads]);

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>Leads campagne</CardTitle>
        <CardDescription>
          Leads reels charges depuis le backend pour cette campagne.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leadsError ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#f0d8de] bg-[#fff8fa] px-6 py-10 text-center">
            <p className="text-base font-semibold text-[#102033]">
              Impossible de charger les leads.
            </p>
            <p className="mt-2 text-sm text-[#8a5a67]">{leadsError}</p>
          </div>
        ) : isLoadingLeads ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
            <p className="text-base font-semibold text-[#102033]">
              Chargement des leads en cours...
            </p>
            <p className="mt-2 text-sm text-[#607287]">
              Les leads sont recuperes depuis le backend.
            </p>
          </div>
        ) : leads.length > 0 ? (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeadCell>Contact</TableHeadCell>
                  <TableHeadCell>Telephone</TableHeadCell>
                  <TableHeadCell>Telephone 2</TableHeadCell>
                  <TableHeadCell>Statut</TableHeadCell>
                  <TableHeadCell>Priorite</TableHeadCell>
                  <TableHeadCell>Agent</TableHeadCell>
                  <TableHeadCell>Creation</TableHeadCell>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-[#102033]">
                          {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || `Lead ${lead.id}`}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                          ID {lead.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{lead.phone || "-"}</TableCell>
                    <TableCell>{lead.phone2 || "-"}</TableCell>
                    <TableCell>{lead.status || "-"}</TableCell>
                    <TableCell>{lead.priority || "-"}</TableCell>
                    <TableCell>{lead.assignedAgent || "-"}</TableCell>
                    <TableCell>{lead.createdAt || "-"}</TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
            <p className="text-base font-semibold text-[#102033]">
              Aucun lead n est associe a cette campagne.
            </p>
            <p className="mt-2 text-sm text-[#607287]">
              Le panneau n affiche aucune donnee fictive.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
