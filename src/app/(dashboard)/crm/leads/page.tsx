import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Powerline" title="Leads" description="Liste des leads a traiter et a qualifier." />
      <Card>
        <CardHeader>
          <CardTitle>Structure prete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            Cette route a ete creee pour accueillir la logique metier, les hooks et les composants du domaine concerne.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
