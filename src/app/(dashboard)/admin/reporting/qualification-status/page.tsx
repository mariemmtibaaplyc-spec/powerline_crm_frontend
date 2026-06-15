import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Etat des qualifications"
      description="Module en cours de connexion."
      highlights={["repartition", "statuts", "stocks", "campagnes"]}
    />
  );
}
