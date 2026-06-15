import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Tickets"
      description="Suivi des tickets lies au plateau, aux utilisateurs et aux modules techniques."
      highlights={["priorites", "support", "assignation", "resolution"]}
    />
  );
}
