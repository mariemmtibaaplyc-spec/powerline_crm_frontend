"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CONTACT_STATUS_OPTIONS } from "@/features/admin-contacts/mocks/admin-contacts.mock";
import { updateAdminContactSchema } from "@/features/admin-contacts/schemas/admin-contact.schema";
import type { AdminContactFormValues } from "@/types/admin-contact.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ContactFormProps {
  initialValues: AdminContactFormValues;
  onSubmit: (values: AdminContactFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ContactForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Enregistrer les modifications",
}: ContactFormProps) {
  const [values, setValues] = useState<AdminContactFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleFieldChange = <Key extends keyof AdminContactFormValues>(
    key: Key,
    value: AdminContactFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    const sanitizedValues: AdminContactFormValues = {
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      phone: result.data.phone,
      phone2: result.data.phone2 ?? "",
      email: result.data.email ?? "",
      company: result.data.company ?? "",
      address: result.data.address ?? "",
      city: result.data.city,
      postalCode: result.data.postalCode ?? "",
      source: result.data.source ?? "",
      country: result.data.country ?? "",
      status: result.data.status,
    };

    await onSubmit(sanitizedValues);
  };

  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>Modifier le contact</CardTitle>
        <CardDescription>
          Mise a jour de la fiche contact sur les champs reels exposes par le backend CRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prenom" error={errors.firstName} input={<Input value={values.firstName} onChange={(event) => handleFieldChange("firstName", event.target.value)} />} />
            <Field label="Nom" error={errors.lastName} input={<Input value={values.lastName} onChange={(event) => handleFieldChange("lastName", event.target.value)} />} />
            <Field label="Telephone" error={errors.phone} input={<Input value={values.phone} onChange={(event) => handleFieldChange("phone", event.target.value)} />} />
            <Field label="Telephone 2" error={errors.phone2} input={<Input value={values.phone2} onChange={(event) => handleFieldChange("phone2", event.target.value)} />} />
            <Field label="Email" error={errors.email} input={<Input value={values.email} onChange={(event) => handleFieldChange("email", event.target.value)} />} />
            <Field label="Societe" error={errors.company} input={<Input value={values.company} onChange={(event) => handleFieldChange("company", event.target.value)} />} />
            <Field label="Ville" error={errors.city} input={<Input value={values.city} onChange={(event) => handleFieldChange("city", event.target.value)} />} />
            <Field label="Code postal" error={errors.postalCode} input={<Input value={values.postalCode} onChange={(event) => handleFieldChange("postalCode", event.target.value)} />} />
            <Field label="Adresse" error={errors.address} input={<Input value={values.address} onChange={(event) => handleFieldChange("address", event.target.value)} />} />
            <Field label="Source" error={errors.source} input={<Input value={values.source} onChange={(event) => handleFieldChange("source", event.target.value)} />} />
            <Field label="Pays" error={errors.country} input={<Input value={values.country} onChange={(event) => handleFieldChange("country", event.target.value)} />} />
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
          </div>

          <div className="flex justify-end border-t border-[#edf2f7] pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : submitLabel}
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
