import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Joignabilite des contacts"
      description="Module en cours de connexion."
      highlights={["joignabilite", "essais", "taux", "segments"]}
    />
  );
}
