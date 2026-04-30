import Link from "next/link";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ContratosPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const contracts = await prisma.contract.findMany({
    where: { organizationId: oid, isActive: true },
    include: {
      tenant: { select: { name: true } },
      local: {
        select: {
          code: true,
          nickname: true,
          plaza: { select: { name: true, entity: true } },
        },
      },
    },
    orderBy: [{ local: { plaza: { name: "asc" } } }, { local: { code: "asc" } }],
  });

  const totalRenta = contracts.reduce((s, c) => s + Number(c.monthlyRent), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description={`${contracts.length} contratos activos · ${formatCurrency(totalRenta)}/mes en renta total`}
      />

      <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Local</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plaza</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Inquilino</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Renta</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Inicio</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{c.local.code}</span>
                    {c.local.nickname && (
                      <span className="ml-1.5 text-xs font-medium text-foreground">{c.local.nickname}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EntityDot entity={c.local.plaza.entity} />
                      <span className="text-xs text-foreground">{c.local.plaza.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{c.tenant.name}</td>
                  <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums text-foreground">
                    {formatCurrency(Number(c.monthlyRent))}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {new Date(c.startDate).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40">
                <td colSpan={3} className="px-4 py-3 text-xs font-bold text-foreground">
                  Total ({contracts.length} contratos)
                </td>
                <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-foreground">
                  {formatCurrency(totalRenta)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function EntityDot({ entity }: { entity: string }) {
  const color =
    entity === "CRT" ? "bg-gold" :
    entity === "TSR" ? "bg-blue-500" :
    "bg-purple-500";
  return <span className={cn("h-2 w-2 rounded-full shrink-0", color)} />;
}
