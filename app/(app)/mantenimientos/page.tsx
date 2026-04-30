import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  URGENTE: { label: "Urgente",  color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  ALTA:    { label: "Alta",     color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
  MEDIA:   { label: "Media",    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  BAJA:    { label: "Baja",     color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
} as const;

const STATUS_CONFIG = {
  ABIERTO:     { label: "Abierto",    color: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800" },
  EN_PROGRESO: { label: "En progreso", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" },
  CERRADO:     { label: "Cerrado",    color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" },
} as const;

export default async function MantenimientosPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const items = await prisma.maintenance.findMany({
    where: { organizationId: oid },
    include: {
      local: {
        select: {
          code: true,
          nickname: true,
          plaza: { select: { name: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { priority: "asc" }, { reportedAt: "desc" }],
  });

  const open       = items.filter((i) => i.status === "ABIERTO");
  const inProgress = items.filter((i) => i.status === "EN_PROGRESO");
  const closed     = items.filter((i) => i.status === "CERRADO");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mantenimientos"
        description={`${open.length + inProgress.length} pendientes · ${closed.length} resueltos`}
      />

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Abiertos",     count: open.length,       color: "text-danger" },
          { label: "En progreso",  count: inProgress.length, color: "text-warning" },
          { label: "Cerrados",     count: closed.length,     color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 shadow-card text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Descripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Local</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plaza</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Prioridad</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const pCfg = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG];
                const sCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-foreground max-w-xs">
                      <span className="line-clamp-2">{item.description}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      <span className="font-mono text-muted-foreground">{item.local.code}</span>
                      {item.local.nickname && <span className="ml-1">{item.local.nickname}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.local.plaza.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", pCfg?.color)}>
                        {pCfg?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", sCfg?.color)}>
                        {sCfg?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {new Date(item.reportedAt).toLocaleDateString("es-MX", {
                        day: "2-digit", month: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
