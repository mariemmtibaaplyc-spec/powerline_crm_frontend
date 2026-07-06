import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Tickets bientot disponible"
      description="Le module tickets n entre pas dans le perimetre V1 Powerline CRM et reste desactive pour cette premiere mise en ligne."
      statusLabel="Hors perimetre V1"
      highlights={["support interne", "assignation", "suivi", "resolution"]}
      note="Aucune logique metier tickets n est exposee dans l interface V1. Cette page reste volontairement neutralisee jusqu au developpement du module."
    />
  );
}
