import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Powerline" title="Creer une equipe" description="Creation d une nouvelle equipe avec superviseur dedie." />
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
