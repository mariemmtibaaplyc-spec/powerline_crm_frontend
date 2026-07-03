import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Exportations"
      description="La navigation reste disponible, mais aucune API backend d export CRM n est exposee pour remplacer les donnees locales."
      note="Les lots d export et leur historique ne sont plus affiches en faux mode demo. Il faudra exposer un endpoint backend dedie avant de reactiver cette page."
      backHref="/admin/contacts"
      backLabel="Retour contacts"
    />
  );
}
