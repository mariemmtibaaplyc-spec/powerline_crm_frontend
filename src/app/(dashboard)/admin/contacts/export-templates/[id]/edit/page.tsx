import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Modifier un modele d exportation"
      description="L edition de modele est suspendue tant que le backend n expose pas de persistence reelle."
      note="Le formulaire local a ete retire pour eviter de simuler des modifications qui ne seraient jamais sauvegardees."
      backHref="/admin/contacts/export-templates"
      backLabel="Retour modeles"
    />
  );
}
