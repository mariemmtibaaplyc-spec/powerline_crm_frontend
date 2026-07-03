import { ComingSoonModule } from "@/components/shared/coming-soon-module";

export default function Page() {
  return (
    <ComingSoonModule
      title="Modeles d exportation"
      description="La bibliotheque de modeles reste accessible, mais aucun backend ne pilote encore ces donnees."
      note="Les modeles d export etaient encore 100 % locaux. Ils sont remplaces par un etat propre en attente d une vraie API."
      backHref="/admin/contacts"
      backLabel="Retour contacts"
    />
  );
}
