"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { blacklistSchema } from "@/features/admin-blacklist/schemas/admin-blacklist.schema";
import type { BlacklistFormValues } from "@/types/blacklist.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const emptyValues: BlacklistFormValues = {
  phone: "",
  reason: "",
};

export function BlacklistForm({
  mode,
  initialValues = emptyValues,
  onSubmit,
  isSubmitting = false,
}: {
  mode: "create" | "edit";
  initialValues?: BlacklistFormValues;
  onSubmit: (values: BlacklistFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}) {
  const [values, setValues] = useState<BlacklistFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = <Key extends keyof BlacklistFormValues>(
    key: Key,
    value: BlacklistFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = blacklistSchema.safeParse(values);

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
    void onSubmit(result.data);
  };

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Ajouter un numero blacklist" : "Modifier l entree blacklist"}</CardTitle>
        <CardDescription>
          Gestion V1 des exclusions CRM avec les champs reels supportes par le backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Numero"
              error={errors.phone}
              input={
                <Input
                  value={values.phone}
                  onChange={(event) => handleFieldChange("phone", event.target.value)}
                  placeholder="+216 27 901 115"
                />
              }
            />
            <Field
              label="Raison"
              error={errors.reason}
              input={
                <Input
                  value={values.reason}
                  onChange={(event) => handleFieldChange("reason", event.target.value)}
                  placeholder="Client oppose"
                />
              }
            />
            {mode === "edit" ? (
              <Field
                label="Contact ID"
                error={errors.contactId}
                input={
                  <Input
                    value={values.contactId ?? ""}
                    onChange={(event) => handleFieldChange("contactId", event.target.value)}
                    placeholder="42"
                  />
                }
              />
            ) : null}
          </div>

          <div className="flex justify-end border-t border-[#edf2f7] pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : mode === "create"
                  ? "Ajouter a la liste rouge"
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
