import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { FinanzasClient } from "./finanzas-client";

export default async function FinanzasPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const YEAR = 2026;

  const lines = await prisma.budgetLine.findMany({
    where: { organizationId: oid, year: YEAR },
    orderBy: [{ entity: "asc" }, { month: "asc" }],
    select: {
      entity: true,
      month: true,
      label: true,
      budgeted: true,
      isIncome: true,
    },
  });

  const serialized = lines.map((l) => ({
    entity:   l.entity,
    month:    l.month,
    label:    l.label,
    budgeted: Number(l.budgeted),
    isIncome: l.isIncome,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="2026"
        title="Finanzas"
        description="Presupuesto mensual vs ejecutado por entidad (CRT, TSR, QHS)."
      />
      <FinanzasClient lines={serialized} year={YEAR} />
    </div>
  );
}
