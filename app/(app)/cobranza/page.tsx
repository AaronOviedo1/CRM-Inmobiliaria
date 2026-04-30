import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { CobranzaGrid } from "./cobranza-grid";

export default async function CobranzaPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const YEAR = 2026;
  const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const plazas = await prisma.plaza.findMany({
    where: { organizationId: oid },
    orderBy: [{ entity: "asc" }, { name: "asc" }],
    include: {
      locales: {
        orderBy: { code: "asc" },
        include: {
          contracts: {
            where: { isActive: true },
            include: {
              tenant: { select: { name: true } },
              payments: {
                where: { period: { in: MONTHS.map((m) => `${YEAR}-${String(m).padStart(2, "0")}`) } },
                select: { period: true, status: true, amount: true },
              },
            },
          },
        },
      },
    },
  });

  // Serialize Decimal → number for client component
  const serialized = plazas.map((plaza) => ({
    ...plaza,
    locales: plaza.locales.map((local) => ({
      ...local,
      contracts: local.contracts.map((contract) => ({
        id: contract.id,
        tenant: contract.tenant,
        monthlyRent: Number(contract.monthlyRent),
        payments: contract.payments.map((p) => ({
          period: p.period,
          status: p.status as string,
          amount: Number(p.amount),
        })),
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`CRT · ${YEAR}`}
        title="Cobranza"
        description="Estado de pagos mensual por local. Verde = pagado · Rojo = vencido · Amarillo = pendiente · Gris = no aplica."
      />
      <CobranzaGrid plazas={serialized as any} year={YEAR} months={MONTHS} />
    </div>
  );
}
