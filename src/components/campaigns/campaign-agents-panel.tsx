"use client";

import { Plus, Unlink2, UserPlus2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { campaignAgentsApi } from "@/features/campaign-agents/api/campaign-agents.api";
import { useCampaignAgents } from "@/features/campaign-agents/hooks/use-campaign-agents";
import type { CampaignAgentRecord } from "@/types/campaign-agent.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

const ALL_ACTIVE_AGENTS_VALUE = "ALL_ACTIVE_AGENTS";

function getAgentDisplayName(agent: Pick<CampaignAgentRecord, "firstName" | "lastName" | "username" | "id">) {
  const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  return fullName || agent.username || `Agent ${agent.id}`;
}

function getAssignableAgentOptionLabel(agent: CampaignAgentRecord) {
  const displayName = getAgentDisplayName(agent);
  return agent.username ? `${displayName} (${agent.username})` : displayName;
}

export function CampaignAgentsPanel({ campaignId }: { campaignId: string }) {
  const {
    campaignAgents,
    isLoadingCampaignAgents,
    campaignAgentsError,
    isMutatingCampaignAgents,
    campaignAgentsActionError,
    loadCampaignAgents,
    attachCampaignAgent,
    attachCampaignAgents,
    detachCampaignAgent,
  } = useCampaignAgents(campaignId);
  const { loadCampaignById } = useCampaigns();
  const [attachOpen, setAttachOpen] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<CampaignAgentRecord[]>([]);
  const [availableAgentsError, setAvailableAgentsError] = useState<string | null>(null);
  const [isLoadingAvailableAgents, setIsLoadingAvailableAgents] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [detachTarget, setDetachTarget] = useState<CampaignAgentRecord | null>(null);

  useEffect(() => {
    void loadCampaignAgents(campaignId, true);
  }, [campaignId, loadCampaignAgents]);

  const openAttachModal = async () => {
    setAttachOpen(true);
    setAvailableAgents([]);
    setAvailableAgentsError(null);
    setIsLoadingAvailableAgents(true);
    setSelectedAgentId("");

    try {
      const assignableAgents = await campaignAgentsApi.getAssignableAgents(campaignId);
      setAvailableAgents(assignableAgents);
      setSelectedAgentId(
        assignableAgents.length > 0 ? ALL_ACTIVE_AGENTS_VALUE : "",
      );
    } catch (error) {
      setAvailableAgentsError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les agents disponibles.",
      );
    } finally {
      setIsLoadingAvailableAgents(false);
    }
  };

  const closeAttachModal = () => {
    setAttachOpen(false);
    setAvailableAgents([]);
    setAvailableAgentsError(null);
    setIsLoadingAvailableAgents(false);
    setSelectedAgentId("");
  };

  const handleAttach = async () => {
    if (selectedAgentId === ALL_ACTIVE_AGENTS_VALUE) {
      await attachCampaignAgents(
        campaignId,
        availableAgents.map((agent) => agent.id),
      );
    } else {
      await attachCampaignAgent(campaignId, selectedAgentId);
    }

    await loadCampaignById(campaignId, true);
    closeAttachModal();
  };

  const handleDetach = async () => {
    if (!detachTarget) {
      return;
    }

    await detachCampaignAgent(campaignId, detachTarget.id);
    await loadCampaignById(campaignId, true);
    setDetachTarget(null);
  };

  return (
    <>
      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <CardTitle>Agents affectés</CardTitle>
            <CardDescription>
              Agents réellement affectés à cette campagne depuis le backend.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => void openAttachModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Affecter un agent
          </Button>
        </CardHeader>
        <CardContent>
          {campaignAgentsActionError ? (
            <div className="mb-4 rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {campaignAgentsActionError}
            </div>
          ) : null}
          {campaignAgentsError ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#f0d8de] bg-[#fff8fa] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Impossible de charger les agents affectés.
              </p>
              <p className="mt-2 text-sm text-[#8a5a67]">{campaignAgentsError}</p>
            </div>
          ) : isLoadingCampaignAgents ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Chargement des agents en cours...
              </p>
              <p className="mt-2 text-sm text-[#607287]">
                Les affectations sont récupérées depuis le backend.
              </p>
            </div>
          ) : campaignAgents.length > 0 ? (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <TableHeadCell>Agent</TableHeadCell>
                    <TableHeadCell>Username</TableHeadCell>
                    <TableHeadCell>Email</TableHeadCell>
                    <TableHeadCell>Création</TableHeadCell>
                    <TableHeadCell className="text-right">Action</TableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {campaignAgents.map((agent) => (
                    <tr key={agent.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#102033]">
                            {getAgentDisplayName(agent)}
                          </p>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                            ID {agent.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{agent.username || "-"}</TableCell>
                      <TableCell>{agent.email || "-"}</TableCell>
                      <TableCell>{agent.createdAt || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="danger"
                          className="h-10 px-3"
                          onClick={() => setDetachTarget(agent)}
                        >
                          <Unlink2 className="mr-2 h-4 w-4" />
                          Retirer
                        </Button>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Aucun agent n est affecté à cette campagne.
              </p>
              <p className="mt-2 text-sm text-[#607287]">
                Le panneau n affiche aucune donnée fictive.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={attachOpen}
        title="Affecter un agent"
        description="Choisissez un agent backend à affecter à cette campagne."
        onClose={closeAttachModal}
      >
        <div className="space-y-5">
          {availableAgentsError ? (
            <div className="rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {availableAgentsError}
            </div>
          ) : null}
          {isLoadingAvailableAgents ? (
            <div className="rounded-[1.25rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
              Chargement des agents disponibles...
            </div>
          ) : availableAgents.length > 0 ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#24415d]">Agent disponible</span>
              <Select
                value={selectedAgentId}
                onChange={(event) => setSelectedAgentId(event.target.value)}
              >
                <option value={ALL_ACTIVE_AGENTS_VALUE}>Tous les agents actifs</option>
                {availableAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {getAssignableAgentOptionLabel(agent)}
                  </option>
                ))}
              </Select>
            </label>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
              Aucun agent actif disponible à affecter pour le moment.
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeAttachModal}>
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isMutatingCampaignAgents || isLoadingAvailableAgents || !selectedAgentId}
              onClick={() => void handleAttach()}
            >
              <UserPlus2 className="mr-2 h-4 w-4" />
              {isMutatingCampaignAgents ? "Affectation..." : "Confirmer l affectation"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(detachTarget)}
        title="Retirer l agent"
        description="Confirmez le retrait de cet agent de la campagne."
        onClose={() => setDetachTarget(null)}
      >
        <div className="space-y-5">
          <p className="text-sm text-[#607287]">
            {detachTarget ? getAgentDisplayName(detachTarget) : ""}
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setDetachTarget(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isMutatingCampaignAgents}
              onClick={() => void handleDetach()}
            >
              {isMutatingCampaignAgents ? "Retrait..." : "Retirer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
