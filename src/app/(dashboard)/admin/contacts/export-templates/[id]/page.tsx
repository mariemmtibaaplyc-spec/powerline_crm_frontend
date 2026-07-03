import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Detail modele d exportation"
      description="Le detail du modele n affiche plus de contenu local non synchronise."
      note="Cette vue attend une API backend pour charger un vrai modele d export. En attendant, le faux detail a ete retire."
      backHref="/admin/contacts/export-templates"
      backLabel="Retour modeles"
    />
  );
}
