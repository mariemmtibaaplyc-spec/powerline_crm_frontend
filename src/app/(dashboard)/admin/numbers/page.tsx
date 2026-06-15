import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Numeros"
      description="Administration des numerotations, pools et affectations disponibles pour le plateau."
      highlights={["pools", "rotation", "masques", "disponibilite"]}
    />
  );
}
