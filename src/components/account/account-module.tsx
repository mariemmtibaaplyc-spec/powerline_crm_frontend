
"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Globe2,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useSessionStore } from "@/store/session.store";
import type { AuthSession, SessionUser, UserRole } from "@/types/auth.types";

interface AccountFormState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  team: string;
  createdAt: string;
  language: string;
  timezone: string;
  emailNotifications: "enabled" | "disabled";
}

const DEFAULT_ACCOUNT: AccountFormState = {
  firstName: "Nadia",
  lastName: "Admin",
  username: "root admin",
  email: "admin@powerline.test",
  role: "admin",
  team: "Pilotage global",
  createdAt: "2026-01-08",
  language: "fr",
  timezone: "Africa/Tunis",
  emailNotifications: "enabled",
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  supervisor: "Superviseur",
  agent: "Agent",
};

function buildFormStateFromSession(session: AuthSession | null): AccountFormState {
  if (!session) {
    return DEFAULT_ACCOUNT;
  }

  return {
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    username:
      session.user.role === "admin"
        ? "root admin"
        : session.user.email.split("@")[0],
    email: session.user.email,
    role: session.user.role,
    team:
      session.user.role === "admin"
        ? "Pilotage global"
        : session.user.role === "supervisor"
          ? "Supervision plateau"
          : "Production terrain",
    createdAt:
      session.user.role === "admin"
        ? "2026-01-08"
        : session.user.role === "supervisor"
          ? "2026-02-16"
          : "2026-03-05",
    language: "fr",
    timezone: "Africa/Tunis",
    emailNotifications: "enabled",
  };
}

function formatLastLogin() {
  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function AccountModule() {
  const authSession = useAuthStore((state) => state.session);
  const persistedSession = useSessionStore((state) => state.session);
  const setAuthSession = useAuthStore((state) => state.setSession);
  const setPersistedSession = useSessionStore((state) => state.setSession);

  const currentSession = authSession ?? persistedSession;
  const initialState = useMemo(
    () => buildFormStateFromSession(currentSession),
    [currentSession],
  );

  const [form, setForm] = useState<AccountFormState>(initialState);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const lastLogin = useMemo(() => formatLastLogin(), []);

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  function updateField<Key extends keyof AccountFormState>(
    field: Key,
    value: AccountFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSaveMessage(null);
  }

  function handleSave() {
    const nextUser: SessionUser = {
      id: currentSession?.user.id ?? "admin_demo",
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
    };

    const nextSession: AuthSession = {
      accessToken: currentSession?.accessToken ?? "demo-token-admin",
      refreshToken: currentSession?.refreshToken ?? "demo-refresh-token-admin",
      user: nextUser,
    };

    setAuthSession(nextSession);
    setPersistedSession(nextSession);
    setSaveMessage("Informations enregistrees localement pour cette session.");
  }

  function handlePasswordAction() {
    setSecurityMessage(
      "Action mockee : le parcours de changement de mot de passe sera branche en V2.",
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Administration CRM"
        title="Mon compte"
        description="Gestion simple de votre profil admin, de la securite du compte et des preferences personnelles de session."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2d6fcb_0%,#5d8fe0_100%)] text-white shadow-[0_16px_34px_rgba(45,111,203,0.24)]">
                <UserRound className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#6c7f93]">
                  Profil admin
                </p>
                <h2 className="text-2xl font-semibold text-[#102033]">{fullName}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-[#dce7f8] bg-[#eef5ff] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#295086]">
                    {ROLE_LABELS[form.role]}
                  </span>
                  <span className="inline-flex rounded-full border border-[#d3efe3] bg-[#effbf5] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#15795d]">
                    Session active
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Login", form.username],
                ["Email", form.email],
                ["Equipe / Groupe", form.team],
                ["Date de creation", form.createdAt],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-4"
                >
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#102033]">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.3rem] border border-[#dce6f0] bg-white px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7e8] text-[#a76b18]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#102033]">Derniere connexion</p>
                  <p className="text-sm text-[#607287]">{lastLogin}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-1">
                <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#6c7f93]">
                  Informations personnelles
                </p>
                <h2 className="text-xl font-semibold text-[#102033]">
                  Modifier mon profil
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Prenom</span>
                  <Input
                    value={form.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Nom</span>
                  <Input
                    value={form.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Login</span>
                  <Input
                    value={form.username}
                    onChange={(event) => updateField("username", event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Email</span>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Role</span>
                  <Select
                    value={form.role}
                    className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                    onChange={(event) => updateField("role", event.target.value as UserRole)}
                  >
                    <option value="admin">Admin</option>
                    <option value="supervisor">Superviseur</option>
                    <option value="agent">Agent</option>
                  </Select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Equipe / Groupe</span>
                  <Input
                    value={form.team}
                    onChange={(event) => updateField("team", event.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
                {saveMessage ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#d3efe3] bg-[#effbf5] px-3 py-2 text-sm text-[#15795d]">
                    <CheckCircle2 className="h-4 w-4" />
                    {saveMessage}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#fffaf1_0%,#ffffff_100%)] shadow-[0_18px_42px_rgba(20,32,53,0.06)]">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0da] text-[#c57b1c]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                      Securite
                    </p>
                    <h3 className="text-lg font-semibold text-[#102033]">
                      Mot de passe
                    </h3>
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-[#f3e2bf] bg-white px-4 py-4">
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#708399]">
                    Mot de passe actuel
                  </p>
                  <p className="mt-2 text-base font-semibold tracking-[0.28em] text-[#102033]">
                    ••••••••••••
                  </p>
                </div>

                <Button variant="secondary" onClick={handlePasswordAction}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Modifier le mot de passe
                </Button>

                {securityMessage ? (
                  <p className="text-sm leading-6 text-[#607287]">{securityMessage}</p>
                ) : (
                  <p className="text-sm leading-6 text-[#607287]">
                    Action front-only pour cette V1, sans workflow de reinitialisation reel.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[#dce6f0] bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] shadow-[0_18px_42px_rgba(20,32,53,0.06)]">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#295086]">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6c7f93]">
                      Preferences
                    </p>
                    <h3 className="text-lg font-semibold text-[#102033]">
                      Reglages simples
                    </h3>
                  </div>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Langue</span>
                  <Select
                    value={form.language}
                    className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                    onChange={(event) => updateField("language", event.target.value)}
                  >
                    <option value="fr">Francais</option>
                    <option value="en">English</option>
                    <option value="ar">Arabe</option>
                  </Select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#24415d]">Fuseau horaire</span>
                  <Select
                    value={form.timezone}
                    className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                    onChange={(event) => updateField("timezone", event.target.value)}
                  >
                    <option value="Africa/Tunis">Africa/Tunis</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </label>

                <label className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[#24415d]">
                    <BellRing className="h-4 w-4 text-[#295086]" />
                    Notifications email
                  </span>
                  <Select
                    value={form.emailNotifications}
                    className="h-11 rounded-2xl border-[var(--border)] bg-white/80 px-4 text-[#102033]"
                    onChange={(event) =>
                      updateField(
                        "emailNotifications",
                        event.target.value as "enabled" | "disabled",
                      )
                    }
                  >
                    <option value="enabled">Oui</option>
                    <option value="disabled">Non</option>
                  </Select>
                </label>

                <div className="rounded-[1.2rem] border border-[#dce6f0] bg-white px-4 py-4">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-[#24415d]">
                    <Mail className="h-4 w-4 text-[#295086]" />
                    Etat des notifications
                  </div>
                  <p className="mt-2 text-sm text-[#607287]">
                    {form.emailNotifications === "enabled"
                      ? "Les alertes systeme et suivis CRM seront envoyes sur votre adresse admin."
                      : "Les notifications email sont desactivees pour cette session mockee."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
