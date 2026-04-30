import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { formatCurrency } from "@/lib/format";

export default async function InquilinosPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const tenants = await prisma.tenant.findMany({
    where: { organizationId: oid },
    include: {
      contracts: {
        where: { isActive: true },
        include: {
          local: {
            select: {
              code: true,
              nickname: true,
              plaza: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const active   = tenants.filter((t) => t.contracts.length > 0);
  const inactive = tenants.filter((t) => t.contracts.length === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquilinos"
        description={`${active.length} activos · ${inactive.length} sin contrato activo`}
      />

      {/* Active tenants */}
      <div className="space-y-2">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Con contrato activo</h2>
        <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Inquilino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Razón social</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Local</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plaza</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Renta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {active.map((tenant) =>
                  tenant.contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{tenant.name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{tenant.legalName ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        <span className="font-mono text-muted-foreground">{c.local.code}</span>
                        {c.local.nickname && <span className="ml-1">{c.local.nickname}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.local.plaza.name}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-foreground">
                        {formatCurrency(Number(c.monthlyRent))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inactive tenants */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sin contrato activo</h2>
          <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {inactive.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{t.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.legalName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Inactivo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
