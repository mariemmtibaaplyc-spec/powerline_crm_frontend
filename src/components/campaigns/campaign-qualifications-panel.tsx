"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCampaignQualifications } from "@/features/campaign-qualifications/hooks/use-campaign-qualifications";
import {
  CAMPAIGN_QUALIFICATION_TYPES,
  type CampaignQualificationRecord,
  type CampaignQualificationType,
} from "@/types/campaign-qualification.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TableCell, TableHeadCell, TableWrapper } from "@/components/ui/table";

type QualificationDraft = {
  name: string;
  type: CampaignQualificationType;
  isActive: boolean;
};

const emptyDraft: QualificationDraft = {
  name: "",
  type: "POSITIVE",
  isActive: true,
};

const CAMPAIGN_QUALIFICATION_TYPE_LABELS: Record<CampaignQualificationType, string> = {
  POSITIVE: "Positive",
  NEGATIVE: "Négative",
  NEUTRAL: "Neutre",
};

function getQualificationTypeLabel(type?: CampaignQualificationType) {
  return type ? CAMPAIGN_QUALIFICATION_TYPE_LABELS[type] : "-";
}

export function CampaignQualificationsPanel({ campaignId }: { campaignId: string }) {
  const {
    qualifications,
    isLoadingQualifications,
    qualificationsError,
    isMutatingQualifications,
    qualificationActionError,
    loadCampaignQualifications,
    createCampaignQualification,
    updateCampaignQualification,
    deleteCampaignQualification,
  } = useCampaignQualifications(campaignId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CampaignQualificationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignQualificationRecord | null>(null);
  const [draft, setDraft] = useState<QualificationDraft>(emptyDraft);

  useEffect(() => {
    void loadCampaignQualifications(campaignId, true);
  }, [campaignId, loadCampaignQualifications]);

  const openCreate = () => {
    setDraft(emptyDraft);
    setCreateOpen(true);
  };

  const openEdit = (qualification: CampaignQualificationRecord) => {
    setDraft({
      name: qualification.name ?? "",
      type: qualification.type ?? "POSITIVE",
      isActive: qualification.isActive ?? true,
    });
    setEditTarget(qualification);
  };

  const closeFormModals = () => {
    setCreateOpen(false);
    setEditTarget(null);
    setDraft(emptyDraft);
  };

  const handleCreate = async () => {
    await createCampaignQualification(campaignId, draft);
    closeFormModals();
  };

  const handleUpdate = async () => {
    if (!editTarget) {
      return;
    }

    await updateCampaignQualification(campaignId, editTarget.id, draft);
    closeFormModals();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteCampaignQualification(campaignId, deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <CardTitle>Qualifications campagne</CardTitle>
            <CardDescription>
              Qualifications reelles chargees depuis le backend pour cette campagne.
            </CardDescription>
          </div>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une qualification
          </Button>
        </CardHeader>
        <CardContent>
          {qualificationActionError ? (
            <div className="mb-4 rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {qualificationActionError}
            </div>
          ) : null}
          {qualificationsError ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#f0d8de] bg-[#fff8fa] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Impossible de charger les qualifications.
              </p>
              <p className="mt-2 text-sm text-[#8a5a67]">{qualificationsError}</p>
            </div>
          ) : isLoadingQualifications ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Chargement des qualifications en cours...
              </p>
              <p className="mt-2 text-sm text-[#607287]">
                Les qualifications sont recuperees depuis le backend.
              </p>
            </div>
          ) : qualifications.length > 0 ? (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <TableHeadCell>Nom</TableHeadCell>
                    <TableHeadCell>Type</TableHeadCell>
                    <TableHeadCell>Active</TableHeadCell>
                    <TableHeadCell>Creation</TableHeadCell>
                    <TableHeadCell>Mise a jour</TableHeadCell>
                    <TableHeadCell className="text-right">Actions</TableHeadCell>
                  </tr>
                </thead>
                <tbody>
                  {qualifications.map((qualification) => (
                    <tr key={qualification.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-[#102033]">
                            {qualification.name || `Qualification ${qualification.id}`}
                          </p>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#7a8da3]">
                            ID {qualification.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getQualificationTypeLabel(qualification.type)}</TableCell>
                      <TableCell>
                        {qualification.isActive === undefined ? "-" : qualification.isActive ? "Oui" : "Non"}
                      </TableCell>
                      <TableCell>{qualification.createdAt || "-"}</TableCell>
                      <TableCell>{qualification.updatedAt || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 px-3"
                            onClick={() => openEdit(qualification)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="h-10 px-3"
                            onClick={() => setDeleteTarget(qualification)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-6 py-10 text-center">
              <p className="text-base font-semibold text-[#102033]">
                Aucune qualification n est associee a cette campagne.
              </p>
              <p className="mt-2 text-sm text-[#607287]">
                Le panneau n affiche aucune donnee fictive.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        title="Ajouter une qualification"
        description="Ajoute une qualification backend a cette campagne."
        onClose={closeFormModals}
      >
        <QualificationForm
          draft={draft}
          onDraftChange={setDraft}
          isSubmitting={isMutatingQualifications}
          submitLabel="Ajouter"
          onCancel={closeFormModals}
          onSubmit={() => void handleCreate()}
        />
      </Modal>

      <Modal
        open={Boolean(editTarget)}
        title="Modifier la qualification"
        description="Met a jour cette qualification backend pour la campagne."
        onClose={closeFormModals}
      >
        <QualificationForm
          draft={draft}
          onDraftChange={setDraft}
          isSubmitting={isMutatingQualifications}
          submitLabel="Enregistrer"
          onCancel={closeFormModals}
          onSubmit={() => void handleUpdate()}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer la qualification"
        description="Confirmez la suppression de cette qualification de campagne."
        onClose={() => setDeleteTarget(null)}
      >
        <div className="space-y-5">
          <p className="text-sm text-[#607287]">
            {deleteTarget?.name || `Qualification ${deleteTarget?.id ?? ""}`}
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isMutatingQualifications}
              onClick={() => void handleDelete()}
            >
              {isMutatingQualifications ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function QualificationForm({
  draft,
  onDraftChange,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  draft: QualificationDraft;
  onDraftChange: (nextDraft: QualificationDraft) => void;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[#24415d]">Nom</span>
          <Input
            value={draft.name}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                name: event.target.value,
              })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[#24415d]">Type</span>
          <Select
            value={draft.type}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                type: event.target.value as CampaignQualificationType,
              })
            }
          >
            {CAMPAIGN_QUALIFICATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {CAMPAIGN_QUALIFICATION_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex items-center gap-3 rounded-[1.1rem] border border-[#dce6f0] bg-[#fbfdff] px-4 py-3 text-sm font-medium text-[#24415d]">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                isActive: event.target.checked,
              })
            }
          />
          Qualification active
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="button" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Traitement..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
