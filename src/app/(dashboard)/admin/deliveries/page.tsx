import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Livraisons"
      description="Pilotage des livraisons, des lots confirmes et des remises de production cote admin."
      highlights={["lots livres", "statuts", "controle", "traceabilite"]}
    />
  );
}
