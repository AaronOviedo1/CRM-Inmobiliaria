import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { formatMoneyCompact } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function PropertiesReport() {
  const ctx = await requireTenantContext();
  const properties = await prisma.property.findMany({
    where: { organizationId: ctx.organizationId, deletedAt: null },
    orderBy: { viewsCount: "desc" },
    take: 20,
    select: { id: true, code: true, title: true, viewsCount: true, inquiriesCount: true, daysOnMarket: true, priceSale: true, priceRent: true },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/reportes"><ArrowLeft className="h-4 w-4" /> Reportes</Link>
      </Button>
      <PageHeader title="Top propiedades más vistas" description="Ranking de vistas acumuladas en portales." />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Propiedad</th>
              <th className="px-4 py-3 text-right">Vistas</th>
              <th className="px-4 py-3 text-right">Consultas</th>
              <th className="px-4 py-3 text-right">Días</th>
              <th className="px-4 py-3 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {properties.map((p, i) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/propiedades/${p.id}`} className="font-medium hover:text-gold">{p.title}</Link>
                  <p className="text-xs text-muted-foreground">{p.code}</p>
                </td>
                <td className="px-4 py-3 text-right text-gold">{p.viewsCount}</td>
                <td className="px-4 py-3 text-right">{p.inquiriesCount}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{p.daysOnMarket ?? 0}</td>
                <td className="px-4 py-3 text-right">{formatMoneyCompact(p.priceSale ?? p.priceRent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
