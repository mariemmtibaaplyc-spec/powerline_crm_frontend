import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="space-y-8">
        <div className="text-center">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Powerline CRM</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Mot de passe oublie</h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted-foreground)]">Declenchement de la reinitialisation pour les utilisateurs CRM.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
