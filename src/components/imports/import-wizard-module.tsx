"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { importsApi } from "@/features/imports/api/imports.api";
import { getDeduplicationLabel } from "@/features/imports/lib/import-options";
import { useLists } from "@/features/lists/hooks/use-lists";
import { useImportsStore } from "@/features/imports/store/imports.store";
import {
  importDeduplicationSchema,
  importParametersSchema,
  importSetupSchema,
} from "@/features/imports/schemas/import.schema";
import type {
  DeduplicationScopeBackend,
  ImportDetectionResult,
  ImportPreviewStats,
  ImportWizardValues,
} from "@/types/import.types";
import { ImportUploadForm } from "@/components/imports/import-upload-form";
import { DeduplicationStep, ImportParametersStep } from "@/components/imports/mapping-step";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialValues: ImportWizardValues = {
  name: "",
  sourceFile: "",
  listName: "",
  estimatedRows: "0",
  separator: "Point-virgule (;)",
  encoding: "UTF-8",
  firstRowHeader: "yes",
  deduplicationMode: "all_contacts",
  deduplicationListName: "",
};

function guessContactField(sourceColumn: string) {
  const normalized = sourceColumn.trim().toLowerCase();

  if (
    normalized.includes("phone") ||
    normalized.includes("telephone") ||
    normalized.includes("mobile") ||
    normalized.includes("gsm") ||
    normalized.includes("tel")
  ) {
    return "phone";
  }

  if (normalized.includes("first") || normalized.includes("prenom")) {
    return "first_name";
  }

  if (normalized.includes("last") || normalized.includes("nom")) {
    return "last_name";
  }

  if (normalized.includes("mail") || normalized.includes("email")) {
    return "email";
  }

  if (normalized.includes("city") || normalized.includes("ville")) {
    return "city";
  }

  if (normalized.includes("address") || normalized.includes("adresse")) {
    return "address";
  }

  if (normalized.includes("company") || normalized.includes("societe")) {
    return "company";
  }

  if (normalized.includes("postal") || normalized.includes("zip") || normalized.includes("code_postal")) {
    return "postal_code";
  }

  return "";
}

function mapDeduplicationScope(mode: ImportWizardValues["deduplicationMode"]): DeduplicationScopeBackend {
  if (mode === "all_contacts" || mode === "campaign_lists") {
    return "ALL_BASE";
  }

  if (mode === "active_lists") {
    return "ACTIVE_LISTS";
  }

  if (mode === "specific_list") {
    return "SPECIFIC_LIST";
  }

  return "NONE";
}

export function ImportWizardModule() {
  const router = useRouter();
  const loadImports = useImportsStore((state) => state.loadImports);
  const loadImportById = useImportsStore((state) => state.loadImportById);
  const { lists, listsError, isLoadingLists } = useLists({ page: 1, limit: 500 });
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<ImportWizardValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [targetListMode, setTargetListMode] = useState<"existing" | "new">("existing");
  const [selectedExistingListId, setSelectedExistingListId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  const [detection, setDetection] = useState<ImportDetectionResult | null>(null);
  const [isDetectingFile, setIsDetectingFile] = useState(false);
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);
  const [isConfirmingImport, setIsConfirmingImport] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<ImportPreviewStats | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const listOptions = useMemo(
    () =>
      lists.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [lists],
  );
  const deduplicationListOptions = useMemo(
    () =>
      lists.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [lists],
  );

  useEffect(() => {
    if (targetListMode !== "existing" || listOptions.length === 0) {
      return;
    }

    const selectedStillExists = listOptions.some((option) => option.id === selectedExistingListId);
    if (!selectedStillExists) {
      setSelectedExistingListId(listOptions[0]?.id ?? "");
    }
  }, [listOptions, selectedExistingListId, targetListMode]);

  const handleChange = <Key extends keyof ImportWizardValues>(
    key: Key,
    value: ImportWizardValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleTargetListModeChange = (nextMode: "existing" | "new") => {
    setTargetListMode(nextMode);
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.listName;
      return nextErrors;
    });

    if (nextMode === "existing") {
      if (!selectedExistingListId && listOptions[0]) {
        setSelectedExistingListId(listOptions[0].id);
      }
      setValues((current) => ({
        ...current,
        listName: "",
      }));
      return;
    }

    setSelectedExistingListId("");
  };

  const handleExistingListChange = (listId: string) => {
    setSelectedExistingListId(listId);
    setValues((current) => ({
      ...current,
      listName: "",
    }));
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.listName;
      return nextErrors;
    });
  };

  const handleNewListNameChange = (value: string) => {
    handleChange("listName", value);
  };

  const runValidation = () => {
    if (step === 1) {
      return importSetupSchema.safeParse(
        targetListMode === "existing"
          ? {
              ...values,
              listName: selectedExistingListId || values.listName,
            }
          : values,
      );
    }
    if (step === 2) {
      return importParametersSchema.safeParse(values);
    }
    return importDeduplicationSchema.safeParse(values);
  };

  const nextStep = async () => {
    const validation = runValidation();
    if (!validation.success) {
      const nextErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(validation.error.flatten().fieldErrors)) {
        if (value?.[0]) {
          nextErrors[key] = value[0];
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    if (step === 1) {
      const currentFile = selectedFileRef.current ?? selectedFile;
      let resolvedTargetListName = values.listName.trim();

      if (!currentFile) {
        setErrors({ sourceFile: "Selectionne un fichier CSV ou XLSX." });
        return;
      }

      if (targetListMode === "existing") {
        if (isLoadingLists) {
          setErrors({ listName: "Chargement des listes en cours. Reessaie dans un instant." });
          return;
        }

        if (listsError) {
          setErrors({ listName: listsError });
          return;
        }

        const selectedTargetList = lists.find((item) => item.id === selectedExistingListId);
        if (!selectedTargetList) {
          setErrors({ listName: "Selectionne une liste cible existante." });
          return;
        }

        resolvedTargetListName = selectedTargetList.name;
      } else {
        const requestedListName = values.listName.trim();
        if (requestedListName.length < 2) {
          setErrors({ listName: "Le nom de la nouvelle liste est requis." });
          return;
        }
        resolvedTargetListName = requestedListName;
      }

      const extension = currentFile.name.split(".").pop()?.toLowerCase();
      if (extension !== "csv" && extension !== "xlsx") {
        setErrors({ sourceFile: "Format non accepte. Utilise un fichier CSV ou XLSX." });
        return;
      }

      setIsDetectingFile(true);

      try {
        const detected = await importsApi.detectImportFile(currentFile);
        const initialMapping = Object.fromEntries(
          detected.columns.map((column) => [column.name, column.target || guessContactField(column.name)]),
        );

        setDetection(detected);
        setColumnMapping(initialMapping);
        setValues((current) => ({
          ...current,
          listName: resolvedTargetListName,
          sourceFile: detected.fileName || currentFile.name,
          estimatedRows:
            detected.totalRows != null ? String(detected.totalRows) : current.estimatedRows,
          separator: detected.separator || current.separator,
          encoding: detected.encoding || current.encoding,
          firstRowHeader:
            detected.hasHeader == null
              ? current.firstRowHeader
              : detected.hasHeader
                ? "yes"
                : "no",
        }));
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Impossible de detecter ce fichier.";

        setErrors({ sourceFile: message });
        setIsDetectingFile(false);
        return;
      }

      setIsDetectingFile(false);
    }

    if (step === 3) {
      const currentFile = selectedFileRef.current ?? selectedFile;

      if (!currentFile) {
        setErrors({ sourceFile: "Veuillez selectionner un fichier avant de preparer l import." });
        return;
      }

      const normalizedMapping = Object.fromEntries(
        Object.entries(columnMapping).filter(([, target]) => target.trim().length > 0),
      );

      const hasPhoneMapping = Object.values(normalizedMapping).includes("phone");
      if (!hasPhoneMapping) {
        setErrors({ columnMapping: "La colonne telephone doit etre mappee vers le champ phone." });
        return;
      }

      setIsUploadingPreview(true);

      try {
        const deduplicationScope = mapDeduplicationScope(values.deduplicationMode);
        const specificList = lists.find((item) => item.id === values.deduplicationListName);
        const uploadPreview = await importsApi.uploadImportPreview({
          file: currentFile,
          listName: values.listName,
          deduplicationScope,
          listId: deduplicationScope === "SPECIFIC_LIST" ? specificList?.id : undefined,
          targetListId: targetListMode === "existing" ? selectedExistingListId || undefined : undefined,
          columnMapping: normalizedMapping,
        });

        setPreviewToken(uploadPreview.previewToken);
        setPreviewStats(uploadPreview.stats);
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Impossible de preparer l import.";

        setErrors({ upload: message });
        setIsUploadingPreview(false);
        return;
      }

      setIsUploadingPreview(false);
      setStep(4);
      return;
    }

    setStep((current) => current + 1);
  };

  const previousStep = () => {
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  };

  const handleFileChange = (file: File | null) => {
    selectedFileRef.current = file;
    setSelectedFile(file);
    setDetection(null);
    setPreviewToken(null);
    setPreviewStats(null);
    setColumnMapping({});
    setErrors((current) => {
      if (!current.sourceFile) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.sourceFile;
      return nextErrors;
    });
  };

  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    setColumnMapping((current) => ({
      ...current,
      [sourceColumn]: targetField,
    }));
    setErrors((current) => {
      if (!current.columnMapping) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.columnMapping;
      return nextErrors;
    });
  };

  const handleConfirmImport = async () => {
    if (!previewToken) {
      setErrors({ confirm: "Le previewToken est absent. Reprepare l import avant confirmation." });
      return;
    }

    setErrors((current) => {
      if (!current.confirm) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.confirm;
      return nextErrors;
    });

    setIsConfirmingImport(true);

    try {
      const result = await importsApi.confirmImport(previewToken);
      const importId = result.importLogId || result.id;

      await loadImports(true);

      if (importId) {
        await loadImportById(importId, true);
      }

      router.push(importId ? `/admin/imports/${importId}` : "/admin/imports");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Impossible de confirmer l import.";

      setErrors({ confirm: message });
      setIsConfirmingImport(false);
      return;
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Nouvel import"
        description="Import reel de contacts CSV/XLSX avec detection des colonnes et dedoublonnage."
        actions={
          <Link
            href="/admin/imports"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour imports
          </Link>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Parcours d importation</CardTitle>
              <CardDescription>
                Fichier, parametrage, dedoublonnage et verification avant confirmation finale.
              </CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                "Configuration",
                "Parametres",
                "Dedoublonnage",
                "Fin d importation",
              ].map((label, index) => {
                const itemStep = index + 1;
                const active = itemStep === step;
                const done = itemStep < step;

                return (
                  <div
                    key={label}
                    className={`rounded-[1.15rem] border px-4 py-3 text-center ${
                      active
                        ? "border-[#2d6fcb] bg-[#eef5ff] text-[#295086]"
                        : done
                          ? "border-[#d9eee9] bg-[#f3fbf8] text-[#0f6a66]"
                          : "border-[#e2ebf4] bg-[#fbfdff] text-[#7a8da3]"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                      Etape {itemStep}
                    </p>
                    <p className="mt-2 text-sm font-medium">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <ImportUploadForm
              values={values}
              errors={errors}
              listOptions={listOptions}
              targetListMode={targetListMode}
              selectedExistingListId={selectedExistingListId}
              isDetecting={isDetectingFile}
              onChange={handleChange}
              onTargetListModeChange={handleTargetListModeChange}
              onExistingListChange={handleExistingListChange}
              onNewListNameChange={handleNewListNameChange}
              onFileChange={handleFileChange}
              onNext={nextStep}
            />
          ) : null}

          {step === 2 ? (
            <ImportParametersStep
              values={values}
              errors={errors}
              detectedColumns={detection?.columns ?? []}
              previewRows={detection?.previewRows ?? []}
              mapping={columnMapping}
              onChange={handleChange}
              onMappingChange={handleMappingChange}
            />
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-[#e3ebf4] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] p-5 shadow-[0_12px_30px_rgba(20,32,53,0.05)]">
                <p className="text-sm font-semibold text-[#102033]">Dedoublonnage</p>
                <p className="mt-2 text-sm leading-6 text-[#607287]">
                  Choisis la portee de controle avant creation finale des contacts et de leur liaison a la liste.
                </p>
              </div>
              {errors.columnMapping ? (
                <div className="rounded-[1.25rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
                  {errors.columnMapping}
                </div>
              ) : null}
              {errors.upload ? (
                <div className="rounded-[1.25rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
                  {errors.upload}
                </div>
              ) : null}
              <DeduplicationStep
                values={values}
                errors={errors}
                listOptions={deduplicationListOptions}
                onChange={handleChange}
              />
            </div>
          ) : null}

          {step === 4 && detection ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-[#d9eee9] bg-[linear-gradient(180deg,#f7fcfa_0%,#effaf6_100%)] p-5 shadow-[0_12px_30px_rgba(15,106,102,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f6a66] text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#102033]">Fin d importation</p>
                    <p className="mt-1 text-sm leading-6 text-[#607287]">
                      Fichier prepare. Import pret a etre confirme.
                    </p>
                  </div>
                </div>
              </div>

              {errors.confirm ? (
                <div className="rounded-[1.25rem] border border-dashed border-[#e8cfcf] bg-[#fff6f6] px-4 py-3 text-sm text-[#a14c4c]">
                  {errors.confirm}
                </div>
              ) : null}

              <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
                  <CardHeader>
                    <CardTitle>Resume de previsualisation</CardTitle>
                    <CardDescription>Statistiques reelles calculees avant confirmation definitive.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Metric label="Fichier detecte" value={detection.fileName || values.sourceFile} />
                    <Metric label="Total lignes" value={String(previewStats?.total_rows ?? detection.totalRows ?? 0)} />
                    <Metric label="Lignes valides" value={String(previewStats?.valid_rows ?? 0)} />
                    <Metric label="Doublons internes" value={String(previewStats?.internal_duplicates ?? 0)} />
                    <Metric label="Faux numeros" value={String(previewStats?.invalid_phones ?? 0)} />
                    <Metric label="Blacklistes" value={String(previewStats?.blacklisted ?? 0)} />
                    <Metric label="Doublons externes" value={String(previewStats?.external_duplicates ?? 0)} />
                    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Preview token</p>
                      <p className="mt-2 break-all text-sm leading-6 text-[#24415d]">{previewToken || "-"}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Confirmation</p>
                      <p className="mt-2 text-sm leading-6 text-[#24415d]">
                        Le fichier a ete envoye au backend et attend maintenant la confirmation finale de l import.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
                  <CardHeader>
                    <CardTitle>Apercu detecte</CardTitle>
                    <CardDescription>Colonnes et echantillon reels renvoyes par l etape detect.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-[1.15rem] border border-[#e2ebf4]">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#f7fbff]">
                          <tr>
                            {["Colonne", "Exemple"].map((label) => (
                              <th
                                key={label}
                                className="border-b border-[#edf2f7] px-4 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {detection.columns.length > 0 ? (
                            detection.columns.map((column) => (
                              <tr key={column.name}>
                                <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                                  {column.name}
                                </td>
                                <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                                  {column.sample ||
                                    detection.previewRows[0]?.[column.name] ||
                                    "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-[#607287]">
                                Aucune colonne detectee.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2f7] pt-5">
            <div className="text-sm text-[#607287]">
              {step < 4
                ? "Import reel de contacts avec detection de colonnes et verification avant confirmation."
                : "L import est prepare et pret pour l etape de confirmation finale."}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {step > 1 && step < 4 ? (
                <Button variant="ghost" onClick={previousStep} disabled={isUploadingPreview || isConfirmingImport}>
                  Precedent
                </Button>
              ) : null}
              {step < 4 ? (
                <Button onClick={() => void nextStep()} disabled={isDetectingFile || isUploadingPreview || isConfirmingImport}>
                  {isUploadingPreview
                    ? "Preparation de l import..."
                    : step === 3
                      ? "Preparer l import"
                      : "Suivant"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push("/admin/imports")}>
                    Retour aux imports
                  </Button>
                  <Button onClick={() => void handleConfirmImport()} disabled={isConfirmingImport}>
                    {isConfirmingImport ? "Confirmation de l import..." : "Confirmer l import"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#24415d]">{value}</p>
    </div>
  );
}
