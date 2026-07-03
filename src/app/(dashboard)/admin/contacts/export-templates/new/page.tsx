import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Creer un modele d exportation"
      description="La creation de modele n utilise plus de faux stockage local."
      note="Aucune API backend de templates d export n a ete trouvee. La creation est suspendue jusqu a l exposition d un endpoint reel."
      backHref="/admin/contacts/export-templates"
      backLabel="Retour modeles"
    />
  );
}
