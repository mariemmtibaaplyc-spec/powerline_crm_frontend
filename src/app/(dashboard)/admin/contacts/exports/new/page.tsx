import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Nouvelle exportation"
      description="La creation d export CRM reste visible, mais elle ne lance plus de faux flux local sans backend."
      note="Aucune route backend de creation d export n a ete trouvee dans cette passe. L action est volontairement desactivee pour eviter d exposer un faux succes."
      backHref="/admin/contacts/exports"
      backLabel="Retour exportations"
    />
  );
}
