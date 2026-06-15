import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Evolution de la prod"
      description="Module en cours de connexion."
      highlights={["tendance", "volumes", "jours", "comparaison"]}
    />
  );
}
