"use client";

import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminContacts } from "@/features/admin-contacts/hooks/use-admin-contacts";
import type { AdminContactFormValues } from "@/types/admin-contact.types";
import { ContactForm } from "@/components/admin-contacts/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ContactEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getContactById, updateContact } = useAdminContacts();
  const contact = getContactById(params.id);

  if (!contact) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Contact introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  const initialValues: AdminContactFormValues = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    phone2: contact.phone2 ?? "",
    email: contact.email ?? "",
    address: contact.address ?? "",
    city: contact.city,
    postalCode: contact.postalCode ?? "",
    campaign: contact.campaign ?? "",
    listName: contact.listName ?? "",
    sourceImport: contact.sourceImport ?? "",
    status: contact.status,
    lastAction: contact.lastAction ?? "",
    lastQualification: contact.lastQualification ?? "",
    note: contact.note ?? "",
  };

  const handleSubmit = (values: AdminContactFormValues) => {
    updateContact(contact.id, values);
    router.push(`/admin/contacts/${contact.id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier contact"
        description="Edition admin V1 d une fiche contact synchronisee avec les campagnes, les listes et les imports CRM."
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
              Edition V1
            </span>
          </>
        }
      />
      <ContactForm initialValues={initialValues} onSubmit={handleSubmit} />
    </section>
  );
}
