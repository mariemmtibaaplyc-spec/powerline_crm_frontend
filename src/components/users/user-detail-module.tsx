"use client";

import { ArrowLeft, PenSquare, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getRoleLabel, getUserFullName } from "@/features/users/mocks/users.mock";
import { useUsers } from "@/features/users/hooks/use-users";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UserDetailModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getUserById, toggleUserStatus, deleteUser } = useUsers();
  const user = getUserById(params.id);

  if (!user) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-sm text-[var(--muted-foreground)]">Utilisateur introuvable.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title={user.username}
        description="Fiche simple du compte utilisateur avec les informations utiles a la gestion admin V1."
        actions={
          <>
            <Link
              href="/admin/users"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour liste
            </Link>
            <Link
              href={`/admin/users/${user.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <PenSquare className="h-4 w-4" />
              Modifier
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Compte utilisateur</CardTitle>
            <CardDescription>Lecture rapide du role, du statut et de la date de creation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField label="Login" value={user.username} />
            <InfoField label="Role" value={getRoleLabel(user.role)} />
            <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">Statut</p>
              <div className="mt-2">
                <UserStatusBadge status={user.status} />
              </div>
            </div>
            <InfoField label="Date de creation" value={user.createdAt} />
            <Button
              variant={user.status === "active" ? "danger" : "secondary"}
              onClick={async () => {
                try {
                  await toggleUserStatus(user.id);
                } catch (error) {
                  window.alert(
                    error instanceof Error
                      ? error.message
                      : "Impossible de modifier le statut pour le moment.",
                  );
                }
              }}
            >
              <Power className="mr-2 h-4 w-4" />
              {user.status === "active" ? "Desactiver le compte" : "Activer le compte"}
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm("Confirmer la suppression ?")) {
                  return;
                }

                try {
                  await deleteUser(user.id);
                  router.push("/admin/users");
                } catch (error) {
                  window.alert(
                    error instanceof Error
                      ? error.message
                      : "Impossible de supprimer l utilisateur pour le moment.",
                  );
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer le compte
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardHeader>
            <CardTitle>Informations utilisateur</CardTitle>
            <CardDescription>Fiche admin simple, orientee gestion de compte.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoField label="Login" value={user.username} />
            <InfoField label="Prenom" value={user.firstName} />
            <InfoField label="Nom" value={user.lastName} />
            <InfoField label="Role" value={getRoleLabel(user.role)} />
            <InfoField label="Date de creation" value={user.createdAt} />
            <InfoField label="Email" value={user.email} />
            <InfoField label="Equipe" value={user.team} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[#e6edf6] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a8da3]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#24415d]">{value}</p>
    </div>
  );
}
