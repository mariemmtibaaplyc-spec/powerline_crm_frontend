"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_TYPE_OPTIONS } from "@/features/campaigns/mocks/campaigns.mock";
import { campaignSchema } from "@/features/campaigns/schemas/campaign.schema";
import type { CampaignFormValues } from "@/types/campaign.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emptyValues: CampaignFormValues = {
  name: "",
  description: "",
  type: "outbound",
  status: "active",
  startDate: "",
  endDate: "",
};

interface CampaignFormProps {
  mode: "create" | "edit";
  initialValues?: CampaignFormValues;
  onSubmit: (values: CampaignFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

function normalizeFormValues(values?: CampaignFormValues): CampaignFormValues {
  return {
    name: values?.name ?? "",
    description: values?.description ?? "",
    type: values?.type ?? "outbound",
    status: values?.status ?? "active",
    startDate: values?.startDate ?? "",
    endDate: values?.endDate ?? "",
  };
}

export function CampaignForm({
  mode,
  initialValues = emptyValues,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: CampaignFormProps) {
  const [values, setValues] = useState<CampaignFormValues>(() =>
    normalizeFormValues(initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(normalizeFormValues(initialValues));
  }, [initialValues]);

  const handleFieldChange = <Key extends keyof CampaignFormValues>(
    key: Key,
    value: CampaignFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = campaignSchema.safeParse(values);

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

    try {
      await onSubmit(result.data);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "fieldErrors" in error &&
        error.fieldErrors &&
        typeof error.fieldErrors === "object"
      ) {
        setErrors(error.fieldErrors as Record<string, string>);
      }
    }
  };

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nouvelle campagne CRM" : "Modifier la campagne"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Creation d une campagne avec les seuls champs actuellement supportes par le backend."
            : "Mise a jour locale des champs essentiels de la campagne."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nom campagne"
              error={errors.name}
              input={
                <Input
                  value={values.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Campagne Test Calls"
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
                  onChange={(event) =>
                    handleFieldChange("type", event.target.value as CampaignFormValues["type"])
                  }
                >
                  {CAMPAIGN_TYPE_OPTIONS.map((option) => (
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
                  onChange={(event) =>
                    handleFieldChange("status", event.target.value as CampaignFormValues["status"])
                  }
                >
                  {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Date de debut"
              error={errors.startDate}
              input={
                <Input
                  type="date"
                  value={values.startDate}
                  onChange={(event) => handleFieldChange("startDate", event.target.value)}
                />
              }
            />
            <Field
              label="Date de fin"
              error={errors.endDate}
              input={
                <Input
                  type="date"
                  value={values.endDate}
                  onChange={(event) => handleFieldChange("endDate", event.target.value)}
                />
              }
            />
            <Field
              label="Description"
              error={errors.description}
              className="md:col-span-2"
              input={
                <Textarea
                  value={values.description}
                  className="min-h-[138px]"
                  onChange={(event) => handleFieldChange("description", event.target.value)}
                  placeholder="Description optionnelle de la campagne"
                />
              }
            />
          </div>

          {submitError ? (
            <div className="rounded-[1.25rem] border border-[#f0d8de] bg-[#fff8fa] px-4 py-3 text-sm text-[#8a5a67]">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf2f7] pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creation en cours..."
                  : "Enregistrement..."
                : mode === "create"
                  ? "Creer la campagne"
                  : "Enregistrer les modifications"}
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
  className,
}: {
  label: string;
  input: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <label className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <span className="text-sm font-medium text-[#24415d]">{label}</span>
      {input}
      {error ? <span className="block text-xs text-[#b55a72]">{error}</span> : null}
    </label>
  );
}
