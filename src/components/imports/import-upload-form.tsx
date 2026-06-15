"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import type { ImportWizardValues } from "@/types/import.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function ImportUploadForm({
  values,
  errors,
  listOptions,
  targetListMode,
  selectedExistingListId,
  isDetecting,
  onChange,
  onTargetListModeChange,
  onExistingListChange,
  onNewListNameChange,
  onFileChange,
  onNext,
}: {
  values: ImportWizardValues;
  errors: Record<string, string>;
  listOptions: Array<{ id: string; name: string }>;
  targetListMode: "existing" | "new";
  selectedExistingListId: string;
  isDetecting: boolean;
  onChange: <Key extends keyof ImportWizardValues>(key: Key, value: ImportWizardValues[Key]) => void;
  onTargetListModeChange: (value: "existing" | "new") => void;
  onExistingListChange: (listId: string) => void;
  onNewListNameChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onNext: () => Promise<void> | void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onNext();
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(nextFile);
    onChange("sourceFile", nextFile?.name ?? "");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nom de l import"
          error={errors.name}
          input={
            <Input
              value={values.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Import contacts mai"
            />
          }
        />
        <Field
          label="Source / fichier"
          error={errors.sourceFile}
          input={
            <div className="space-y-2">
              <Input
                type="file"
                accept=".csv,.xlsx"
                className="cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-[#eef5ff] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#295086]"
                onChange={handleFileInput}
              />
              <p className="text-xs text-[#607287]">
                Formats acceptes : CSV, XLSX
                {isDetecting ? " • Preparation en cours..." : values.sourceFile ? ` • ${values.sourceFile}` : ""}
              </p>
            </div>
          }
        />
        <Field
          label="Mode de liste"
          input={
            <Select
              value={targetListMode}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) =>
                onTargetListModeChange(event.target.value as "existing" | "new")
              }
            >
              <option value="existing">Liste existante</option>
              <option value="new">Nouvelle liste</option>
            </Select>
          }
        />
        <Field
          label={targetListMode === "existing" ? "Liste cible" : "Nom de la nouvelle liste"}
          error={errors.listName}
          input={
            targetListMode === "existing" ? (
              <Select
                value={selectedExistingListId}
                className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                onChange={(event) => onExistingListChange(event.target.value)}
              >
                <option value="">Selectionner une liste</option>
                {listOptions.length > 0 ? (
                  listOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))
                ) : (
                  <option value="">Aucune liste disponible</option>
                )}
              </Select>
            ) : (
              <Input
                value={values.listName}
                onChange={(event) => onNewListNameChange(event.target.value)}
                placeholder="Nouvelle liste imports juillet"
              />
            )
          }
        />
      </div>
      <div className="rounded-[1.4rem] border border-[#e3ebf4] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-5 py-4 shadow-[0_12px_30px_rgba(20,32,53,0.04)]">
        <p className="text-sm font-semibold text-[#102033]">Configuration d entree</p>
        <p className="mt-1 text-sm leading-6 text-[#607287]">
          Cette premiere etape prepare le fichier et la liste qui recevra les contacts apres detection.
        </p>
      </div>
      <button type="submit" className="hidden" />
    </form>
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: ReactNode;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-[#24415d]">{label}</span>
      {input}
      {error ? <span className="block text-xs text-[#b55a72]">{error}</span> : null}
    </label>
  );
}
