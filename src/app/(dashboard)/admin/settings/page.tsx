import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Parametres"
      description="Reglages transverses du frontend CRM."
      highlights={["telephonie", "exports", "qualite", "configurations globales"]}
    />
  );
}
