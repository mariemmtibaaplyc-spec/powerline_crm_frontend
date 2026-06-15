"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUsers } from "@/features/users/hooks/use-users";
import type { UserFormValues } from "@/types/user.types";
import { UserForm } from "@/components/users/user-form";
import { PageHeader } from "@/components/layout/page-header";

export function UserCreateModule() {
  const router = useRouter();
  const { createUser, roles, teams } = useUsers();

  const handleSubmit = async (values: UserFormValues) => {
    await createUser(values);
    router.push("/admin/users");
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Creer un utilisateur"
        description="Ouverture d un nouveau compte admin, superviseur ou agent avec affectation immediate equipe, groupe et statut."
        actions={
          <Link
            href="/admin/users"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
        }
      />
      <UserForm mode="create" roles={roles} teams={teams} onSubmit={handleSubmit} />
    </section>
  );
}
