import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="surface max-w-xl rounded-[2rem] p-10 text-center">
        <p className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
          Erreur 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-4 text-base text-[var(--muted-foreground)]">
          Cette route n&apos;existe pas encore dans le CRM ou a ete deplacee.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-95"
          >
            Retour a la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
