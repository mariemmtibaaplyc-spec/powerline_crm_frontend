"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  LIST_CAMPAIGN_OPTIONS,
  LIST_SOURCE_OPTIONS,
  LIST_STATUS_OPTIONS,
  LIST_TYPE_OPTIONS,
} from "@/features/lists/mocks/lists.mock";
import { listSchema } from "@/features/lists/schemas/list.schema";
import type { ListFormValues } from "@/types/list.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emptyValues: ListFormValues = {
  name: "",
  type: "prospects",
  source: LIST_SOURCE_OPTIONS[0],
  status: "ready",
  campaign: LIST_CAMPAIGN_OPTIONS[0],
  contactsCount: "0",
  description: "",
};

export function ListForm({
  mode,
  initialValues = emptyValues,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues?: ListFormValues;
  onSubmit: (values: ListFormValues) => void;
}) {
  const [values, setValues] = useState<ListFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = <Key extends keyof ListFormValues>(
    key: Key,
    value: ListFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = listSchema.safeParse(values);

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
          {mode === "create" ? "Nouvelle liste CRM" : "Modifier la liste"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Creation V1 d une liste admin avec source, statut, campagne et volumetrie."
            : "Mise a jour des metadonnees et du rattachement de la liste dans le CRM."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nom de la liste"
              error={errors.name}
              input={
                <Input
                  value={values.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Base B2B Avril"
                />
              }
            />
            <Field
              label="Type"
              error={errors.type}
              input={
                <Select
                  value={values.type}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("type", event.target.value as ListFormValues["type"])}
                >
                  {LIST_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Source"
              error={errors.source}
              input={
                <Select
                  value={values.source}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("source", event.target.value)}
                >
                  {LIST_SOURCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
                  onChange={(event) => handleFieldChange("status", event.target.value as ListFormValues["status"])}
                >
                  {LIST_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Campagne associee"
              error={errors.campaign}
              input={
                <Select
                  value={values.campaign}
                  className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                  onChange={(event) => handleFieldChange("campaign", event.target.value)}
                >
                  {LIST_CAMPAIGN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Volume total"
              error={errors.contactsCount}
              input={
                <Input
                  type="number"
                  min="0"
                  value={values.contactsCount}
                  onChange={(event) => handleFieldChange("contactsCount", event.target.value)}
                />
              }
            />
          </div>

          <Field
            label="Description"
            error={errors.description}
            input={
              <Textarea
                value={values.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Description courte de la liste et de son origine metier..."
              />
            }
          />

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf2f7] pt-5">
            <Button type="submit">
              {mode === "create" ? "Creer la liste" : "Enregistrer les modifications"}
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
