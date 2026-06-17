"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminContactsApi } from "@/features/admin-contacts/api/admin-contacts.api";
import type { AdminContactRecord } from "@/types/admin-contact.types";
import { ContactStatusBadge } from "@/components/admin-contacts/contact-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getContactFullName(contact: Pick<AdminContactRecord, "firstName" | "lastName">) {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  return fullName.length > 0 ? fullName : "Contact sans nom";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Non renseignee";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ContactDetailModule() {
  const params = useParams<{ id: string }>();
  const [contact, setContact] = useState<AdminContactRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Chargement de la fiche contact...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="space-y-3 py-10">
          <p className="text-sm font-medium text-[#24415d]">Impossible de charger la fiche contact.</p>
          <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!contact) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Contact introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={getContactFullName(contact)}
        description="Fiche contact reliee au backend CRM avec lecture directe des donnees reelles disponibles."
        actions={
          <>
            <Link
              href="/admin/contacts"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour repertoire
            </Link>
            <Link
              href={`/admin/contacts/${contact.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <PenSquare className="h-4 w-4" />
              Modifier
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Resume contact</CardTitle>
            <CardDescription>Vue rapide du statut CRM et des metadonnees disponibles cote backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <ContactStatusBadge status={contact.status} />
              </div>
            </div>
            <Metric label="Source" value={contact.source ?? "Non renseignee"} />
            <Metric label="Pays" value={contact.country ?? "Non renseigne"} />
            <Metric label="Cree le" value={formatDate(contact.createdAt)} />
            <Metric label="Mis a jour le" value={formatDate(contact.updatedAt)} />
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Informations contact</CardTitle>
            <CardDescription>Lecture des champs reellement exposes par `GET /contacts/:id`.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoField label="Prenom" value={contact.firstName || "Non renseigne"} />
            <InfoField label="Nom" value={contact.lastName || "Non renseigne"} />
            <InfoField label="Telephone" value={contact.phone || "Non renseigne"} />
            <InfoField label="Telephone 2" value={contact.phone2 ?? "Aucun"} />
            <InfoField label="Email" value={contact.email ?? "Non renseigne"} />
            <InfoField label="Societe" value={contact.company ?? "Non renseignee"} />
            <InfoField label="Ville" value={contact.city || "Non renseignee"} />
            <InfoField label="Code postal" value={contact.postalCode ?? "Non renseigne"} />
            <div className="md:col-span-2">
              <InfoField label="Adresse" value={contact.address ?? "Non renseignee"} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#24415d]">{value}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#24415d]">{value}</p>
    </div>
  );
}
