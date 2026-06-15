"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  EXPORT_FORMAT_OPTIONS,
  EXPORT_SOURCE_OPTIONS,
  EXPORT_SOURCE_TYPE_OPTIONS,
  EXPORT_TEMPLATE_OPTIONS,
} from "@/features/admin-exports/mocks/admin-exports.mock";
import { exportSchema } from "@/features/admin-exports/schemas/admin-export.schema";
import type { ExportFormValues, ExportSourceType } from "@/types/export.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const emptyValues: ExportFormValues = {
  name: "",
  sourceType: "campaign",
  sourceName: EXPORT_SOURCE_OPTIONS.campaign[0] ?? "",
  modelName: EXPORT_TEMPLATE_OPTIONS[0],
  format: "csv",
  volume: "0",
};

export function ExportForm({
  initialValues = emptyValues,
  onSubmit,
}: {
  initialValues?: ExportFormValues;
  onSubmit: (values: ExportFormValues) => void;
}) {
  const [values, setValues] = useState<ExportFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sourceOptions = useMemo(
    () => EXPORT_SOURCE_OPTIONS[values.sourceType] ?? [],
    [values.sourceType],
  );

  const handleFieldChange = <Key extends keyof ExportFormValues>(
    key: Key,
    value: ExportFormValues[Key],
  ) => {
    setValues((current) => {
      if (key === "sourceType") {
        const nextType = value as ExportSourceType;
        return {
          ...current,
          sourceType: nextType,
          sourceName: EXPORT_SOURCE_OPTIONS[nextType][0] ?? "",
        };
      }

      return {
        ...current,
        [key]: value,
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = exportSchema.safeParse(values);

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
        <CardTitle>Nouvelle exportation</CardTitle>
        <CardDescription>
          Preparation V1 d un export admin depuis une campagne, une liste ou le repertoire contacts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nom de l export"
              error={errors.name}
              input={
                <Input
                  value={values.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Export callbacks habitat matin"
                />
              }
            />
            <Field
              label="Type de source"
              error={errors.sourceType}
              input={
                <Select
                  value={values.sourceType}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) =>
                    handleFieldChange("sourceType", event.target.value as ExportFormValues["sourceType"])
                  }
                >
                  {EXPORT_SOURCE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Source"
              error={errors.sourceName}
              input={
                <Select
                  value={values.sourceName}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("sourceName", event.target.value)}
                >
                  {sourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Modele d export"
              error={errors.modelName}
              input={
                <Select
                  value={values.modelName}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("modelName", event.target.value)}
                >
                  {EXPORT_TEMPLATE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  onChange={(event) => handleFieldChange("format", event.target.value as ExportFormValues["format"])}
                >
                  {EXPORT_FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Volume estime"
              error={errors.volume}
              input={
                <Input
                  type="number"
                  min="0"
                  value={values.volume}
                  onChange={(event) => handleFieldChange("volume", event.target.value)}
                />
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-[1.25rem] border border-[#e7eef8] bg-[linear-gradient(135deg,#f8fbff_0%,#f3faf8_100%)] px-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#102033]">Simulation front uniquement</p>
              <p className="text-sm text-[#607287]">
                Aucun fichier reel n est genere. Le lot sera ajoute a l historique des exportations.
              </p>
            </div>
            <Button type="submit">Lancer exportation</Button>
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
