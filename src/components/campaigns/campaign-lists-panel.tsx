"use client";

import { Link2, Plus, Unlink2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listsApi } from "@/features/lists/api/lists.api";
import { useCampaignLists } from "@/features/campaign-lists/hooks/use-campaign-lists";
import type { CampaignListRecord } from "@/types/campaign-list.types";
import type { ListRecord } from "@/types/list.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

function isActiveListStatus(status: string | undefined) {
  if (!status) {
    return true;
  }

  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === "active" || normalizedStatus === "attached" || normalizedStatus === "ready";
}

export function CampaignListsPanel({ campaignId }: { campaignId: string }) {
  const {
    campaignLists,
    isLoadingCampaignLists,
    campaignListsError,
    isMutatingCampaignLists,
    campaignListsActionError,
    loadCampaignLists,
    attachCampaignList,
    detachCampaignList,
  } = useCampaignLists(campaignId);
  const [attachOpen, setAttachOpen] = useState(false);
  const [availableLists, setAvailableLists] = useState<ListRecord[]>([]);
  const [availableListsError, setAvailableListsError] = useState<string | null>(null);
  const [isLoadingAvailableLists, setIsLoadingAvailableLists] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [detachTarget, setDetachTarget] = useState<CampaignListRecord | null>(null);

  useEffect(() => {
    void loadCampaignLists(campaignId, true);
  }, [campaignId, loadCampaignLists]);

  const attachedListIds = useMemo(
    () => new Set(campaignLists.map((list) => list.id)),
    [campaignLists],
  );

  const activeLists = useMemo(
    () => campaignLists.filter((list) => isActiveListStatus(list.status)),
    [campaignLists],
  );

  const attachableLists = useMemo(
    () =>
      availableLists.filter(
        (list) => list.status !== "archived" && !attachedListIds.has(list.id),
      ),
    [attachedListIds, availableLists],
  );

  const openAttachModal = async () => {
    setAttachOpen(true);
    setAvailableListsError(null);
    setIsLoadingAvailableLists(true);
    setAvailableLists([]);
    setSelectedListId("");

    try {
      const firstPage = await listsApi.getLists({ page: 1, limit: 100 });
      const totalPages = firstPage.meta.totalPages;
      let allLists = firstPage.data;

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await listsApi.getLists({ page, limit: 100 });
        allLists = [...allLists, ...response.data];
      }

      const filteredLists = allLists.filter(
        (list) => list.status !== "archived" && !attachedListIds.has(list.id),
      );

      setAvailableLists(allLists);
      setSelectedListId(filteredLists[0]?.id ?? "");
    } catch (error) {
      setAvailableListsError(
        error instanceof Error
          ? error.message
          : "Impossible de charger les listes disponibles.",
      );
    } finally {
      setIsLoadingAvailableLists(false);
    }
  };

  const closeAttachModal = () => {
    setAttachOpen(false);
    setAvailableLists([]);
    setAvailableListsError(null);
    setIsLoadingAvailableLists(false);
    setSelectedListId("");
  };

  const handleAttach = async () => {
    await attachCampaignList(campaignId, selectedListId);
    closeAttachModal();
  };

  const handleDetach = async () => {
    if (!detachTarget) {
      return;
    }

    await detachCampaignList(campaignId, detachTarget.id);
    setDetachTarget(null);
  };

  return (
    <>
      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <CardTitle>Listes rattachees</CardTitle>
            <CardDescription>
              Listes actives rattachees a cette campagne depuis le backend.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => void openAttachModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Attacher une liste
          </Button>
        </CardHeader>
        <CardContent>
          {campaignListsActionError ? (
            <div className="mb-4 rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {campaignListsActionError}
            </div>
          ) : null}
          {campaignListsError ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#f0d8de] bg-[#fff8fa] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Impossible de charger les listes.
              </p>
              <p className="mt-2 text-sm text-[#8a5a67]">{campaignListsError}</p>
            </div>
          ) : isLoadingCampaignLists ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Chargement des listes en cours...
              </p>
              <p className="mt-2 text-sm text-[#607287]">
                Les listes sont recuperees depuis le backend.
              </p>
            </div>
          ) : activeLists.length > 0 ? (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <TableHeadCell>Liste</TableHeadCell>
                    <TableHeadCell>Statut</TableHeadCell>
                    <TableHeadCell>Contacts</TableHeadCell>
                    <TableHeadCell>Creation</TableHeadCell>
                    <TableHeadCell className="text-right">Action</TableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {activeLists.map((list) => (
                    <tr key={list.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#102033]">{list.name}</p>
                          <p className="text-xs text-[#7a8da3]">
                            {list.description || `ID ${list.id}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{list.status || "-"}</TableCell>
                      <TableCell>
                        {typeof list.contactCount === "number"
                          ? list.contactCount.toLocaleString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell>{list.createdAt || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="danger"
                          className="h-10 px-3"
                          onClick={() => setDetachTarget(list)}
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
                Aucune liste active rattachee a cette campagne.
              </p>
              <p className="mt-2 text-sm text-[#607287]">
                Le panneau n affiche aucune donnee fictive.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={attachOpen}
        title="Attacher une liste"
        description="Choisissez une liste backend disponible a rattacher a cette campagne."
        onClose={closeAttachModal}
      >
        <div className="space-y-5">
          {availableListsError ? (
            <div className="rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {availableListsError}
            </div>
          ) : null}
          {isLoadingAvailableLists ? (
            <div className="rounded-[1.25rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
              Chargement des listes disponibles...
            </div>
          ) : attachableLists.length > 0 ? (
            <label className="space-y-2">
              <span className="text-sm font-medium text-[#24415d]">Liste disponible</span>
              <Select
                value={selectedListId}
                onChange={(event) => setSelectedListId(event.target.value)}
              >
                {attachableLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({typeof list.contactsCount === "number"
                      ? list.contactsCount.toLocaleString("fr-FR")
                      : 0} contacts)
                  </option>
                ))}
              </Select>
            </label>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
              Aucune liste active disponible a attacher pour le moment.
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeAttachModal}>
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isMutatingCampaignLists || isLoadingAvailableLists || !selectedListId}
              onClick={() => void handleAttach()}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {isMutatingCampaignLists ? "Attachement..." : "Confirmer l attachement"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(detachTarget)}
        title="Retirer la liste"
        description="Confirmez le retrait de cette liste de la campagne."
        onClose={() => setDetachTarget(null)}
      >
        <div className="space-y-5">
          <p className="text-sm text-[#607287]">
            {detachTarget?.name || `Liste ${detachTarget?.id ?? ""}`}
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setDetachTarget(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isMutatingCampaignLists}
              onClick={() => void handleDetach()}
            >
              {isMutatingCampaignLists ? "Retrait..." : "Retirer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
