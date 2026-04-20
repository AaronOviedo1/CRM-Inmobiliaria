import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { KpiCard } from "@/components/common/kpi-card";
import { RENTAL_STATUS_LABEL, RENTAL_STATUS_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatMoneyCompact } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function RentalsReport() {
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;
  const now = new Date();

  const [activeCount, expiringCount, rentals, paidAgg] = await Promise.all([
    prisma.rental.count({ where: { organizationId: orgId, status: "ACTIVA" as any } }),
    prisma.rental.count({ where: { organizationId: orgId, status: "POR_VENCER" as any } }),
    prisma.rental.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, status: true, monthlyRent: true, property: { select: { id: true, title: true } } },
    }),
    prisma.rentalPayment.aggregate({
      _sum: { amountPaid: true },
      where: {
        rental: { organizationId: orgId },
        dueDate: { gte: startOfMonth(now), lte: endOfMonth(now) },
        status: "PAGADO" as any,
      },
    }),
  ]);

  const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);
  const totalRent = rentals.reduce((a, r) => a + toN(r.monthlyRent), 0);
  const paidThisMonth = toN(paidAgg._sum.amountPaid);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/reportes"><ArrowLeft className="h-4 w-4" /> Reportes</Link>
      </Button>
      <PageHeader title="Rentas: churn y cobranza" description="Seguimiento del core de retención del negocio." />
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Activas" value={activeCount} accent="success" />
        <KpiCard label="Por vencer" value={expiringCount} accent="warning" />
        <KpiCard label="Renta total gestionada" value={formatMoneyCompact(totalRent)} accent="gold" />
        <KpiCard label="Cobrado este mes" value={formatMoneyCompact(paidThisMonth)} accent="info" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Propiedad</th>
              <th className="px-4 py-3 text-right">Renta</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rentals.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  {r.property ? <Link href={`/propiedades/${r.property.id}`} className="hover:text-gold">{r.property.title}</Link> : "—"}
                </td>
                <td className="px-4 py-3 text-right">{formatMoneyCompact(r.monthlyRent)}</td>
                <td className="px-4 py-3">
                  <StatusPill tone={RENTAL_STATUS_TONE[r.status as keyof typeof RENTAL_STATUS_TONE]}>
                    {RENTAL_STATUS_LABEL[r.status as keyof typeof RENTAL_STATUS_LABEL]}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
