"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useLogin } from "@/features/auth/hooks/use-login";
import { getDefaultDashboard } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth.schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const demoAccounts = [
  {
    label: "Admin",
    email: "admin@powerline.test",
    role: "Pilotage global",
    icon: ShieldCheck,
  },
  {
    label: "Superviseur",
    email: "supervisor@powerline.test",
    role: "Monitoring live",
    icon: Users,
  },
  {
    label: "Agent",
    email: "agent@powerline.test",
    role: "Production appels",
    icon: Headphones,
  },
] as const;

interface LoginFormProps {
  variant?: "default" | "minimal" | "bare";
}

export function LoginForm({ variant = "default" }: LoginFormProps) {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("admin@powerline.test");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDemoEmail, setActiveDemoEmail] = useState("admin@powerline.test");
  const isMinimal = variant === "minimal";
  const isBare = variant === "bare";
  const bareInputClass =
    "h-12 rounded-full border-white/32 bg-white/[0.06] pl-12 text-white shadow-[0_18px_34px_rgba(7,14,35,0.08)] backdrop-blur-xl placeholder:text-white/56 hover:border-[#ffd6ae]/54 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.08)_100%)] hover:shadow-[0_0_0_1px_rgba(255,214,174,0.2),0_0_22px_rgba(227,165,109,0.16),0_18px_34px_rgba(7,14,35,0.12)] focus:border-white/58 focus:ring-[rgba(255,255,255,0.12)] focus:shadow-[0_0_0_1px_rgba(255,214,174,0.2),0_0_22px_rgba(227,165,109,0.16),0_18px_34px_rgba(7,14,35,0.12)]";

  if (isBare) {
    return (
      <form
        className="mx-auto flex min-h-[452px] w-full max-w-[420px] flex-col gap-6"
        onSubmit={async (event) => {
          event.preventDefault();

          const parsed = loginSchema.safeParse({ email, password });
          if (!parsed.success) {
            setErrorMessage(
              parsed.error.issues[0]?.message ?? "Formulaire invalide.",
            );
            return;
          }

          try {
            setErrorMessage(null);
            const session = await login.submit(parsed.data);
            startTransition(() => {
              router.push(getDefaultDashboard(session.user.role));
            });
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Impossible de se connecter pour le moment.",
            );
          }
        }}
      >
        <div className="space-y-5">
          <div className="flex justify-center pb-1">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#f3c596] bg-[linear-gradient(180deg,#f0b57d_0%,#d99556_100%)] shadow-[0_18px_44px_rgba(217,149,86,0.34)]">
              <span className="absolute -right-1 top-1 h-3.5 w-3.5 rounded-full border border-white/32 bg-[#ffd9b4] shadow-[0_0_14px_rgba(227,165,109,0.72)]" />
              <User className="h-9 w-9 text-white" strokeWidth={1.7} />
            </div>
          </div>

          <div className="space-y-1 text-center">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-white/42">
              Secure access
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Connexion
            </h2>
          </div>

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7fc5ff]/24 bg-[#eaf4ff] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#2d6fcb] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#2d6fcb]" />
              Realtime preview
            </span>
          </div>

          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/66" />
            <Input
              id="email"
              type="text"
              value={email}
              placeholder="Email ou username"
              className={bareInputClass}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/66" />
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="Mot de passe"
              className={bareInputClass}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage ? (
            <div className="rounded-[1rem] border border-[#ffb8ad] bg-[#fff1ef] px-4 py-3 text-sm text-[#8c2c21]">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="ghost"
          className="mt-auto h-12 w-full rounded-full border border-[#f3c596] bg-[linear-gradient(180deg,#f0b57d_0%,#d99556_100%)] text-white shadow-[0_18px_42px_rgba(217,149,86,0.28)] hover:border-[#ffe0bf] hover:shadow-[0_0_0_1px_rgba(255,214,174,0.28),0_0_26px_rgba(227,165,109,0.28),0_18px_42px_rgba(217,149,86,0.32)]"
          disabled={login.isLoading}
        >
          {login.isLoading ? "Connexion..." : "Login"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden backdrop-blur-2xl",
        isMinimal
          ? "max-w-[450px] rounded-[1.9rem] border border-white/12 bg-[linear-gradient(180deg,rgba(8,19,38,0.42)_0%,rgba(10,22,43,0.58)_100%)] p-5 shadow-[0_28px_70px_rgba(3,9,24,0.24)] sm:p-6"
          : "max-w-[580px] rounded-[2.15rem] border border-white/16 bg-[linear-gradient(180deg,rgba(11,23,38,0.68)_0%,rgba(16,32,51,0.9)_100%)] p-6 shadow-[0_42px_100px_rgba(4,11,32,0.42)] sm:p-8 lg:p-10",
      )}
    >
      <div className="absolute inset-[1px] rounded-[calc(2.15rem-1px)] border border-white/7" />
      <div
        className={cn(
          "pointer-events-none absolute -right-14 top-0 rounded-full blur-3xl",
          isMinimal
            ? "h-28 w-28 bg-[#2d6fcb]/14"
            : "h-36 w-36 bg-[#0f6a66]/20",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute top-0 rounded-full blur-3xl",
          isMinimal
            ? "left-6 h-16 w-24 bg-white/8"
            : "left-10 h-24 w-32 bg-white/9",
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_70%)] blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-white/55">
              Powerline CRM
            </p>
            <h2
              className={cn(
                "font-semibold tracking-tight text-white",
                isMinimal ? "text-2xl" : "text-3xl",
              )}
            >
              Connexion
            </h2>
            <p className="text-sm leading-6 text-white/66">
              {isMinimal
                ? "Acces rapide a l'interface de demonstration."
                : "Acces rapide aux interfaces admin, superviseur et agent en mode demo."}
            </p>
          </div>

          {!isMinimal ? (
            <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/64">
              Secure preview
            </div>
          ) : null}
        </div>
      </div>

      {!isMinimal ? (
        <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
          {demoAccounts.map((account) => {
            const Icon = account.icon;
            const isActive = activeDemoEmail === account.email;

            return (
              <button
                key={account.email}
                type="button"
                className={`rounded-[1.15rem] border px-3 py-3 text-left transition ${
                  isActive
                    ? "border-[#4f81d7] bg-[linear-gradient(180deg,rgba(45,111,203,0.18)_0%,rgba(255,255,255,0.08)_100%)] shadow-[0_16px_34px_rgba(12,25,69,0.24)]"
                    : "border-white/10 bg-white/[0.05] hover:bg-white/[0.09]"
                }`}
                onClick={() => {
                  setEmail(account.email);
                  setPassword("password");
                  setActiveDemoEmail(account.email);
                  setErrorMessage(null);
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/14 text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">
                  {account.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/58">
                  {account.role}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      <form
        className={cn("space-y-5", isMinimal ? "mt-6" : "mt-7")}
        onSubmit={async (event) => {
          event.preventDefault();

          const parsed = loginSchema.safeParse({ email, password });
          if (!parsed.success) {
            setErrorMessage(
              parsed.error.issues[0]?.message ?? "Formulaire invalide.",
            );
            return;
          }

          try {
            setErrorMessage(null);
            const session = await login.submit(parsed.data);
            startTransition(() => {
              router.push(getDefaultDashboard(session.user.role));
            });
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Impossible de se connecter pour le moment.",
            );
          }
        }}
      >
        <div className={cn("gap-4", isMinimal ? "grid" : "grid sm:grid-cols-2")}>
          <div className="space-y-2">
            <label
              className="text-xs uppercase tracking-[0.18em] text-white/58"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              type="text"
              value={email}
              placeholder="Email ou username"
              className="h-12 rounded-[1rem] border-white/12 bg-white/94 text-[#13233d] shadow-[0_12px_28px_rgba(7,14,35,0.12)] placeholder:text-[#8090a3] focus:border-[#2d6fcb] focus:ring-[rgba(45,111,203,0.18)]"
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-xs uppercase tracking-[0.18em] text-white/58"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="password"
                className="h-12 rounded-[1rem] border-white/12 bg-white/94 pr-12 text-[#13233d] shadow-[0_12px_28px_rgba(7,14,35,0.12)] placeholder:text-[#8090a3] focus:border-[#2d6fcb] focus:ring-[rgba(45,111,203,0.18)]"
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#667892] transition hover:bg-[#eef3fb]"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {!isMinimal ? (
          <div className="flex items-center justify-between gap-4 pt-1">
            <Link
              className="text-sm text-white/72 underline-offset-4 transition hover:text-white hover:underline"
              href="/forgot-password"
            >
              Mot de passe oublie ?
            </Link>
            <div className="rounded-full bg-[#0f6a66]/22 px-3 py-1 text-xs font-medium text-[#b9ece7]">
              password
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[1rem] border border-[#ffb8ad] bg-[#fff1ef] px-4 py-3 text-sm text-[#8c2c21]">
            {errorMessage}
          </div>
        ) : null}

        <div className={cn("flex gap-3", isMinimal ? "flex-col" : "flex-col sm:flex-row")}>
          {!isMinimal ? (
            <Button
              type="button"
              variant="ghost"
              className="h-12 flex-1 rounded-[0.95rem] border border-white/16 bg-white/[0.08] text-white hover:bg-white/[0.12]"
            >
              Register
            </Button>
          ) : null}
          <Button
            type="submit"
            className={cn(
              "h-12 rounded-[0.95rem] bg-[linear-gradient(135deg,#2450a6_0%,#2d6fcb_100%)] text-white shadow-[0_18px_42px_rgba(36,80,166,0.28)] hover:shadow-[0_20px_46px_rgba(36,80,166,0.34)]",
              isMinimal ? "w-full" : "flex-1",
            )}
            disabled={login.isLoading}
          >
            {login.isLoading ? "Connexion..." : "Login"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {isMinimal ? (
          <p className="text-xs leading-6 text-white/52">
            Demo par defaut: admin@powerline.test / password
          </p>
        ) : (
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-white/48">
              Mode preview / demo
            </p>
            <p className="mt-2 text-sm leading-6 text-white/64">
              Choisis un profil puis connecte-toi. L&apos;interface redirige
              vers le dashboard correspondant sans backend reel.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
