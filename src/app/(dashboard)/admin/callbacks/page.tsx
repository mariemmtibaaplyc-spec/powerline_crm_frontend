import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Rappels"
      description="Suivi des rappels admin, des files de reprise et de la priorisation de contacts."
      highlights={["rappels chauds", "files", "planning", "priorites"]}
    />
  );
}
