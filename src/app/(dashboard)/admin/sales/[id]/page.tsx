import { SalesDetailModule } from "@/components/admin-sales/sales-detail-module";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SalesDetailModule saleId={id} />;
}
