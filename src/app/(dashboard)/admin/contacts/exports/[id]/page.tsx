import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Detail exportation"
      description="Le detail d export n affiche plus de donnees mockees tant que le backend n expose pas l historique reel."
      note="Le design de la page est conserve, mais le contenu faux a ete retire pour ne pas induire en erreur avant hebergement."
      backHref="/admin/contacts/exports"
      backLabel="Retour exportations"
    />
  );
}
