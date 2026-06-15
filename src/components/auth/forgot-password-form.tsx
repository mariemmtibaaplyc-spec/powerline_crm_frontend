"use client";

import Link from "next/link";
import { useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Reinitialisation du mot de passe</CardTitle>
        <CardDescription>
          Envoyez un lien de reinitialisation a l&apos;utilisateur concerne.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await authApi.forgotPassword(email);
            setSubmitted(true);
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="forgot-email">
              Adresse e-mail
            </label>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              className="text-sm text-[var(--muted-foreground)] underline-offset-4 hover:underline"
              href="/login"
            >
              Retour a la connexion
            </Link>
            <Button type="submit">Envoyer</Button>
          </div>
          {submitted ? (
            <p className="text-sm text-[var(--accent)]">
              Une demande de reinitialisation a ete simulee.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
