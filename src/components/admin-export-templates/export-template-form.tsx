"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  EXPORT_TEMPLATE_FIELD_PRESETS,
  EXPORT_TEMPLATE_FORMAT_OPTIONS,
  EXPORT_TEMPLATE_SOURCE_OPTIONS,
  EXPORT_TEMPLATE_STATUS_OPTIONS,
} from "@/features/admin-export-templates/mocks/admin-export-templates.mock";
import { exportTemplateSchema } from "@/features/admin-export-templates/schemas/admin-export-template.schema";
import type { ExportTemplateFormValues } from "@/types/export-template.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const emptyValues: ExportTemplateFormValues = {
  name: "",
  source: "contacts",
  format: "csv",
  fields: "Nom, Prenom, Telephone, Ville",
  status: "active",
};

export function ExportTemplateForm({
  mode,
  initialValues = emptyValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues?: ExportTemplateFormValues;
  onSubmit: (values: ExportTemplateFormValues) => void;
}) {
  const [values, setValues] = useState<ExportTemplateFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = <Key extends keyof ExportTemplateFormValues>(
    key: Key,
    value: ExportTemplateFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = exportTemplateSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};

      for (const [key, value] of Object.entries(result.error.flatten().fieldErrors)) {
        if (value?.[0]) {
          nextErrors[key] = value[0];
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Creer un modele d exportation" : "Modifier le modele"}
        </CardTitle>
        <CardDescription>
          Configuration simple d un modele reutilisable pour les exportations CRM admin V1.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nom du modele"
              error={errors.name}
              input={
                <Input
                  value={values.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Export contacts residentiels"
                />
              }
            />
            <Field
              label="Source"
              error={errors.source}
              input={
                <Select
                  value={values.source}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("source", event.target.value as ExportTemplateFormValues["source"])}
                >
                  {EXPORT_TEMPLATE_SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Format"
              error={errors.format}
              input={
                <Select
                  value={values.format}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("format", event.target.value as ExportTemplateFormValues["format"])}
                >
                  {EXPORT_TEMPLATE_FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Statut"
              error={errors.status}
              input={
                <Select
                  value={values.status}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("status", event.target.value as ExportTemplateFormValues["status"])}
                >
                  {EXPORT_TEMPLATE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
          </div>

          <div className="rounded-[1.2rem] border border-[#e7eef8] bg-[linear-gradient(135deg,#f8fbff_0%,#f7fcfa_100%)] px-4 py-4">
            <p className="text-sm font-semibold text-[#102033]">Champs conseilles</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPORT_TEMPLATE_FIELD_PRESETS.map((field) => (
                <button
                  key={field}
                  type="button"
                  className="rounded-full border border-[#dce6f0] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#295086]"
                  onClick={() => {
                    const currentFields = values.fields
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean);
                    if (currentFields.includes(field)) return;
                    handleFieldChange("fields", [...currentFields, field].join(", "));
                  }}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Champs inclus"
            error={errors.fields}
            input={
              <Input
                value={values.fields}
                onChange={(event) => handleFieldChange("fields", event.target.value)}
                placeholder="Nom, Prenom, Telephone, Campagne"
              />
            }
          />

          <div className="flex justify-end border-t border-[#edf2f7] pt-5">
            <Button type="submit">
              {mode === "create" ? "Creer le modele" : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
