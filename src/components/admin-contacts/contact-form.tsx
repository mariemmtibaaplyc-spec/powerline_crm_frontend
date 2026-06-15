"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  CONTACT_CAMPAIGN_OPTIONS,
  CONTACT_LIST_OPTIONS,
  CONTACT_SOURCE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
} from "@/features/admin-contacts/mocks/admin-contacts.mock";
import { updateAdminContactSchema } from "@/features/admin-contacts/schemas/admin-contact.schema";
import type { AdminContactFormValues } from "@/types/admin-contact.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormProps {
  initialValues: AdminContactFormValues;
  onSubmit: (values: AdminContactFormValues) => void;
}

export function ContactForm({ initialValues, onSubmit }: ContactFormProps) {
  const [values, setValues] = useState<AdminContactFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = <Key extends keyof AdminContactFormValues>(
    key: Key,
    value: AdminContactFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = updateAdminContactSchema.safeParse(values);

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
        <CardTitle>Modifier le contact</CardTitle>
        <CardDescription>
          Mise a jour front V1 de la fiche contact admin, sans workflow lourd et sans surcharge visuelle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prenom" error={errors.firstName} input={<Input value={values.firstName} onChange={(event) => handleFieldChange("firstName", event.target.value)} />} />
            <Field label="Nom" error={errors.lastName} input={<Input value={values.lastName} onChange={(event) => handleFieldChange("lastName", event.target.value)} />} />
            <Field label="Telephone" error={errors.phone} input={<Input value={values.phone} onChange={(event) => handleFieldChange("phone", event.target.value)} />} />
            <Field label="Telephone 2" error={errors.phone2} input={<Input value={values.phone2 ?? ""} onChange={(event) => handleFieldChange("phone2", event.target.value)} />} />
            <Field label="Email" error={errors.email} input={<Input value={values.email ?? ""} onChange={(event) => handleFieldChange("email", event.target.value)} />} />
            <Field label="Ville" error={errors.city} input={<Input value={values.city} onChange={(event) => handleFieldChange("city", event.target.value)} />} />
            <Field label="Adresse" error={errors.address} input={<Input value={values.address ?? ""} onChange={(event) => handleFieldChange("address", event.target.value)} />} />
            <Field label="Code postal" error={errors.postalCode} input={<Input value={values.postalCode ?? ""} onChange={(event) => handleFieldChange("postalCode", event.target.value)} />} />
            <Field
              label="Campagne"
              error={errors.campaign}
              input={
                <Select value={values.campaign} className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]" onChange={(event) => handleFieldChange("campaign", event.target.value)}>
                  {CONTACT_CAMPAIGN_OPTIONS.map((campaign) => (
                    <option key={campaign} value={campaign}>
                      {campaign}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Liste source"
              error={errors.listName}
              input={
                <Select value={values.listName} className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]" onChange={(event) => handleFieldChange("listName", event.target.value)}>
                  {CONTACT_LIST_OPTIONS.map((list) => (
                    <option key={list} value={list}>
                      {list}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Import source"
              error={errors.sourceImport}
              input={
                <Select value={values.sourceImport} className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]" onChange={(event) => handleFieldChange("sourceImport", event.target.value)}>
                  {CONTACT_SOURCE_OPTIONS.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field
              label="Statut"
              error={errors.status}
              input={
                <Select value={values.status} className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]" onChange={(event) => handleFieldChange("status", event.target.value as AdminContactFormValues["status"])}>
                  {CONTACT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              }
            />
            <Field label="Derniere action" error={errors.lastAction} input={<Input value={values.lastAction} onChange={(event) => handleFieldChange("lastAction", event.target.value)} />} />
            <Field label="Derniere qualification" error={errors.lastQualification} input={<Input value={values.lastQualification} onChange={(event) => handleFieldChange("lastQualification", event.target.value)} />} />
          </div>

          <Field
            label="Note courte"
            error={errors.note}
            input={<Textarea value={values.note} onChange={(event) => handleFieldChange("note", event.target.value)} rows={4} />}
          />

          <div className="flex justify-end border-t border-[#edf2f7] pt-5">
            <Button type="submit">Enregistrer les modifications</Button>
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
