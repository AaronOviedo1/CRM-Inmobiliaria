import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { RentalsDashboard } from "@/components/rentals/rentals-dashboard";
import { KpiCard } from "@/components/common/kpi-card";
import { formatMoneyCompact } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { listRentals } from "@/lib/repos/entities";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function RentasPage() {
  const ctx = await requireTenantContext();
  const { rows: rentals, total } = await listRentals(ctx, { status: "ACTIVA", pageSize: 100 });

  const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);
  const totalRent = rentals.reduce((a, r) => a + toN(r.monthlyRent), 0);

  const now = new Date();
  const [paidAgg, overdueCount] = await Promise.all([
    prisma.rentalPayment.aggregate({
      _sum: { amountPaid: true },
      where: {
        rental: { organizationId: ctx.organizationId, status: "ACTIVA" as any },
        dueDate: { gte: startOfMonth(now), lte: endOfMonth(now) },
        status: "PAGADO" as any,
      },
    }),
    prisma.rentalPayment.count({
      where: {
        rental: { organizationId: ctx.organizationId },
        status: "VENCIDO" as any,
      },
    }),
  ]);
  const paidThisMonth = toN(paidAgg._sum.amountPaid);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${total} rentas activas`}
        title="Rentas"
        description="Cartera bajo gestión: cobros, mantenimientos, renovaciones."
        actions={
          <>
            <Button variant="outline" asChild><Link href="/rentas/calendario"><Calendar className="h-4 w-4" /> Calendario global</Link></Button>
            <Button><Plus className="h-4 w-4" /> Nueva renta</Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Renta mensual total" value={formatMoneyCompact(totalRent)} accent="gold" />
        <KpiCard label="Cobrado este mes" value={formatMoneyCompact(paidThisMonth)} accent="success" trend={(paidThisMonth / Math.max(totalRent, 1)) * 100 - 100} trendLabel="del total" />
        <KpiCard label="Pagos vencidos" value={overdueCount} accent="danger" />
      </div>
      <RentalsDashboard rentals={rentals as any} />
    </div>
  );
}
