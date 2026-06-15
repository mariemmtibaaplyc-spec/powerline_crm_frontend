"use client";

import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getContactFullName } from "@/features/admin-contacts/mocks/admin-contacts.mock";
import { useAdminContacts } from "@/features/admin-contacts/hooks/use-admin-contacts";
import { ContactStatusBadge } from "@/components/admin-contacts/contact-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactDetailModule() {
  const params = useParams<{ id: string }>();
  const { getContactById } = useAdminContacts();
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

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={getContactFullName(contact)}
        description="Fiche contact admin V1 liee aux campagnes, listes et imports du cockpit CRM."
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
            <CardDescription>Vue rapide du statut, du rattachement metier et de la derniere action connue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <ContactStatusBadge status={contact.status} />
              </div>
            </div>
            <Metric label="Campagne associee" value={contact.campaign ?? "Non renseignee"} />
            <Metric label="Liste source" value={contact.listName ?? "Non renseignee"} />
            <Metric label="Import source" value={contact.sourceImport ?? "Non renseigne"} />
            <Metric label="Derniere action" value={contact.lastAction ?? "Non renseignee"} />
            <Metric label="Derniere qualification" value={contact.lastQualification ?? "Non renseignee"} />
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Informations contact</CardTitle>
            <CardDescription>Lecture simple de la fiche CRM front mockee pour la V1 admin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoField label="Prenom" value={contact.firstName} />
            <InfoField label="Nom" value={contact.lastName} />
            <InfoField label="Telephone" value={contact.phone} />
            <InfoField label="Telephone 2" value={contact.phone2 ?? "Aucun"} />
            <InfoField label="Email" value={contact.email ?? "Non renseigne"} />
            <InfoField label="Ville" value={contact.city} />
            <InfoField label="Adresse" value={contact.address ?? "Non renseignee"} />
            <InfoField label="Code postal" value={contact.postalCode ?? "Non renseigne"} />
            <div className="md:col-span-2">
              <InfoField label="Note courte" value={contact.note ?? "Non renseignee"} />
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
