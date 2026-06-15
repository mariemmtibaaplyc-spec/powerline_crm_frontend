"use client";

import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUsers } from "@/features/users/hooks/use-users";
import type { UserFormValues } from "@/types/user.types";
import { UserForm } from "@/components/users/user-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function UserEditModule() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getUserById, updateUser, roles, teams } = useUsers();
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

  const initialValues: UserFormValues = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    role: user.role,
    team: user.team,
    status: user.status,
    password: "",
  };

  const handleSubmit = async (values: UserFormValues) => {
    await updateUser(user.id, values);
    router.push(`/admin/users/${user.id}`);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Modifier utilisateur"
        description="Mise a jour du compte utilisateur, du role, de l equipe et du statut dans le cockpit admin."
        actions={
          <>
            <Link
              href={`/admin/users/${user.id}`}
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
      <UserForm
        mode="edit"
        initialValues={initialValues}
        roles={roles}
        teams={teams}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
