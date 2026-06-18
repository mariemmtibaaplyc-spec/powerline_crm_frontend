"use client";

import { ArrowLeft, FileUp } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ListCreateModule() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Creation de liste desactivee"
        description="La creation d une liste se fait depuis le parcours d import de contacts."
        actions={
          <Link
            href="/admin/lists"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour liste
          </Link>
        }
      />

      <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
        <CardHeader>
          <CardTitle>Creation via import uniquement</CardTitle>
          <CardDescription>
            Pour la V1, une nouvelle liste doit etre creee depuis le workflow d import afin de
            garantir un rattachement correct des contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[1.4rem] border border-[#e3ebf4] bg-[linear-gradient(180deg,#fbfdff_0%,#f6faff_100%)] px-5 py-5 text-sm leading-7 text-[#607287]">
            La creation d une liste se fait depuis le parcours d import.
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/imports/new"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] shadow-[0_18px_40px_rgba(36,80,166,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
            >
              <FileUp className="h-4 w-4" />
              Ouvrir le parcours d import
            </Link>
            <Link
              href="/admin/lists"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#dce6f0] bg-white px-4 text-sm font-medium text-[#24415d] shadow-[0_10px_22px_rgba(20,32,53,0.06)] transition hover:-translate-y-0.5 hover:bg-[#f8fbff]"
            >
              Voir les listes
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
