"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminContactsApi } from "@/features/admin-contacts/api/admin-contacts.api";
import type { AdminContactFormValues, AdminContactRecord } from "@/types/admin-contact.types";
import { ContactForm } from "@/components/admin-contacts/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

function createInitialValues(contact: AdminContactRecord): AdminContactFormValues {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    phone2: contact.phone2 ?? "",
    email: contact.email ?? "",
    company: contact.company ?? "",
    address: contact.address ?? "",
    city: contact.city,
    postalCode: contact.postalCode ?? "",
    source: contact.source ?? "",
    country: contact.country ?? "",
    status: contact.status,
  };
}

export function ContactEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<AdminContactRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContact = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextContact = await adminContactsApi.getContactById(params.id);

        if (!isMounted) {
          return;
        }

        setContact(nextContact);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setContact(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger cette fiche contact.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadContact();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleSubmit = async (values: AdminContactFormValues) => {
    if (!contact) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedContact = await adminContactsApi.updateContact(contact.id, values);
      setContact(updatedContact);
      router.push(`/admin/contacts/${contact.id}`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d'enregistrer les modifications.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Chargement du contact...</p>
        </CardContent>
      </Card>
    );
  }

  if (!contact) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10">
          <p className="text-sm font-medium text-[#24415d]">Contact introuvable.</p>
          {error ? <p className="text-sm text-[var(--muted-foreground)]">{error}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier contact"
        description="Edition de la fiche contact via les champs reellement supportes par le backend CRM."
        actions={
          <>
            <Link
              href={`/admin/contacts/${contact.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour fiche
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7f3] bg-white px-3 py-2 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)]">
              <PenSquare className="h-4 w-4 text-[#295086]" />
              Edition backend V1
            </span>
          </>
        }
      />

      {error ? (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-[#b55a72]">{error}</p>
          </CardContent>
        </Card>
      ) : null}

      <ContactForm
        initialValues={createInitialValues(contact)}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />
    </section>
  );
}
