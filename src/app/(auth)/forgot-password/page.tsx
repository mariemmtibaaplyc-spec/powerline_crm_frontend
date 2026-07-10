import { redirect } from "next/navigation";

// Fonctionnalité désactivée pour la v1 (mot de passe partagé par agent,
// pas de flux de réinitialisation individuel) — accès direct par URL bloqué.
export default function ForgotPasswordPage() {
  redirect("/login");
}
