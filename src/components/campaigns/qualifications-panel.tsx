import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QualificationsPanel({ flow }: { flow: string[] }) {
  return (
    <Card className="border border-[#dce6f0] bg-white shadow-[0_18px_42px_rgba(20,32,53,0.08)]">
      <CardHeader>
        <CardTitle>Parcours de qualification</CardTitle>
        <CardDescription>Issues metier mockees associees a la campagne pour la V1.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {flow.map((item) => (
          <span
            key={item}
            className="inline-flex rounded-full bg-[#eef6ff] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#295086]"
          >
            {item}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
