"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
  DEDUPLICATION_OPTIONS,
  IMPORT_ENCODING_OPTIONS,
  IMPORT_SEPARATOR_OPTIONS,
} from "@/features/imports/lib/import-options";
import { importDeduplicationSchema, importParametersSchema } from "@/features/imports/schemas/import.schema";
import type { ContactFieldTarget, DetectedImportColumn, ImportWizardValues } from "@/types/import.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const CONTACT_FIELD_OPTIONS: Array<{ value: ContactFieldTarget; label: string }> = [
  { value: "phone", label: "Telephone (phone)" },
  { value: "first_name", label: "Prenom" },
  { value: "last_name", label: "Nom" },
  { value: "email", label: "Email" },
  { value: "city", label: "Ville" },
  { value: "address", label: "Adresse" },
  { value: "company", label: "Societe" },
  { value: "postal_code", label: "Code postal" },
  { value: "notes", label: "Notes" },
];

export function ImportParametersStep({
  values,
  errors,
  detectedColumns,
  previewRows,
  mapping,
  onChange,
  onMappingChange,
}: {
  values: ImportWizardValues;
  errors: Record<string, string>;
  detectedColumns: DetectedImportColumn[];
  previewRows: Array<Record<string, string>>;
  mapping: Record<string, string>;
  onChange: <Key extends keyof ImportWizardValues>(key: Key, value: ImportWizardValues[Key]) => void;
  onMappingChange: (sourceColumn: string, targetField: string) => void;
}) {
  importParametersSchema.safeParse(values);

  const previewColumns = detectedColumns.length > 0 ? detectedColumns : [];
  const firstPreviewRow = previewRows[0] ?? {};

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Volume estime"
          error={errors.estimatedRows}
          input={
            <Input
              type="number"
              min="0"
              value={values.estimatedRows}
              onChange={(event) => onChange("estimatedRows", event.target.value)}
            />
          }
        />
        <Field
          label="Separateur"
          error={errors.separator}
          input={
            <Select
              value={values.separator}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => onChange("separator", event.target.value)}
            >
              {IMPORT_SEPARATOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          }
        />
        <Field
          label="Encodage"
          error={errors.encoding}
          input={
            <Select
              value={values.encoding}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => onChange("encoding", event.target.value)}
            >
              {IMPORT_ENCODING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          }
        />
        <Field
          label="Premiere ligne"
          error={errors.firstRowHeader}
          input={
            <Select
              value={values.firstRowHeader}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => onChange("firstRowHeader", event.target.value as ImportWizardValues["firstRowHeader"])}
            >
              <option value="yes">Contient les entetes</option>
              <option value="no">Sans entetes</option>
            </Select>
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-[#e3ebf4] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] p-5 shadow-[0_12px_30px_rgba(20,32,53,0.05)]">
          <p className="text-sm font-semibold text-[#102033]">Mapping des contacts</p>
          <p className="mt-1 text-sm leading-6 text-[#607287]">
            Verifie les colonnes detectees avant de connecter le mapping final vers les champs CRM contacts.
          </p>

          <div className="mt-4 space-y-3">
            {previewColumns.length > 0 ? (
              previewColumns.map((column) => (
                <div
                  key={column.name}
                  className="flex items-center justify-between rounded-[1.15rem] border border-[#e3ebf4] bg-white px-4 py-3 text-[#24415d]"
                >
                  <div>
                    <p className="text-sm font-medium">{column.name}</p>
                    <p className="mt-1 text-xs text-[#607287]">
                      {mapping[column.name] || column.target || "Champ CRM a definir"}
                    </p>
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8e4ef] bg-white text-[#7a8da3]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[1.15rem] border border-dashed border-[#d7e2ee] bg-[#fbfdff] px-4 py-5 text-sm text-[#607287]">
                Les colonnes detectees apparaitront ici apres analyse du fichier.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e3ebf4] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] p-5 shadow-[0_12px_30px_rgba(20,32,53,0.05)]">
          <p className="text-sm font-semibold text-[#102033]">Apercu du fichier</p>
          <p className="mt-1 text-sm leading-6 text-[#607287]">
            Apercu de la structure detectee avant controle et dedoublonnage.
          </p>

          <div className="mt-4 overflow-hidden rounded-[1.15rem] border border-[#e2ebf4]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7fbff]">
                <tr>
                  {["Colonne source", "Champ CRM cible", "Exemple"].map((label) => (
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
                {previewColumns.length > 0 ? (
                  previewColumns.map((column) => (
                    <tr key={column.name}>
                      <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">{column.name}</td>
                      <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                        <Select
                          value={mapping[column.name] || column.target || ""}
                          className="h-10 rounded-xl border-[var(--border)] bg-white/80 px-3 text-[#102033]"
                          onChange={(event) => onMappingChange(column.name, event.target.value)}
                        >
                          <option value="">A definir</option>
                          {CONTACT_FIELD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="border-b border-[#edf2f7] px-4 py-3 text-[#24415d]">
                        {column.sample || firstPreviewRow[column.name] || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-[#607287]">
                      Aucune colonne detectee pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeduplicationStep({
  values,
  errors,
  listOptions,
  onChange,
}: {
  values: ImportWizardValues;
  errors: Record<string, string>;
  listOptions: Array<{ id: string; name: string }>;
  onChange: <Key extends keyof ImportWizardValues>(key: Key, value: ImportWizardValues[Key]) => void;
}) {
  importDeduplicationSchema.safeParse(values);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 xl:grid-cols-2">
        {DEDUPLICATION_OPTIONS.map((option) => {
          const active = values.deduplicationMode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange("deduplicationMode", option.value)}
              className={`rounded-[1.45rem] border p-5 text-left transition ${
                active
                  ? "border-[#2d6fcb] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] shadow-[0_18px_38px_rgba(45,111,203,0.12)]"
                  : "border-[#e2ebf4] bg-white shadow-[0_12px_28px_rgba(20,32,53,0.04)] hover:border-[#cfe0f2] hover:bg-[#fbfdff]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#102033]">{option.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#607287]">{option.description}</p>
                </div>
                <span
                  className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${
                    active
                      ? "border-[#2d6fcb] bg-[#2d6fcb] text-white"
                      : "border-[#d8e4ef] bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {values.deduplicationMode === "specific_list" ? (
        <Field
          label="Liste specifique"
          error={errors.deduplicationListName}
          input={
            <Select
              value={values.deduplicationListName}
              className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
              onChange={(event) => onChange("deduplicationListName", event.target.value)}
            >
              <option value="">Selectionner une liste</option>
              {listOptions.map((option) => (
                <option key={`${option.id}-${option.name}`} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          }
        />
      ) : null}
    </div>
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
