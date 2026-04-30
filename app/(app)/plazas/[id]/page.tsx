import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  RENTADO:       { label: "Rentado",       color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
  DISPONIBLE:    { label: "Disponible",    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  MANTENIMIENTO: { label: "Mantenimiento", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  RESERVADO:     { label: "Reservado",     color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
};

export default async function PlazaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const plaza = await prisma.plaza.findFirst({
    where: { id, organizationId: oid },
    include: {
      locales: {
        orderBy: { code: "asc" },
        include: {
          contracts: {
            where: { isActive: true },
            include: {
              tenant: { select: { name: true } },
              payments: {
                where: { period: { in: ["2026-01","2026-02","2026-03","2026-04"] } },
                orderBy: { period: "asc" },
              },
            },
          },
          maintenances: {
            where: { status: { in: ["ABIERTO","EN_PROGRESO"] } },
            select: { id: true, priority: true, description: true },
          },
        },
      },
    },
  });

  if (!plaza) notFound();

  const totalLocales = plaza.locales.length;
  const rentados     = plaza.locales.filter((l) => l.status === "RENTADO").length;
  const ingresoMensual = plaza.locales.reduce((s, l) => {
    return s + l.contracts.reduce((cs, c) => cs + Number(c.monthlyRent), 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/plazas" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Plazas
        </Link>
        <PageHeader
          eyebrow={plaza.entity}
          title={plaza.name}
          description={plaza.address ?? undefined}
        />
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total locales",   value: totalLocales.toString() },
          { label: "Rentados",        value: `${rentados} (${Math.round((rentados/totalLocales)*100)}%)` },
          { label: "Ingreso mensual", value: formatCurrency(ingresoMensual) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Locales grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Locales</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {plaza.locales.map((local) => {
            const contract = local.contracts[0];
            const s = STATUS_CONFIG[local.status] ?? STATUS_CONFIG.DISPONIBLE!;
            const hasIssues = local.maintenances.length > 0;

            return (
              <div
                key={local.id}
                className={cn(
                  "rounded-xl border bg-surface p-4 shadow-card",
                  hasIssues ? "border-warning/40" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{local.code}</span>
                    {local.nickname && (
                      <p className="text-sm font-medium text-foreground mt-0.5">{local.nickname}</p>
                    )}
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", s.color)}>
                    {s.label}
                  </span>
                </div>

                {contract ? (
                  <>
                    <p className="text-xs text-muted-foreground truncate">{contract.tenant.name}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {formatCurrency(Number(contract.monthlyRent))}
                      <span className="text-xs font-normal text-muted-foreground">/mes</span>
                    </p>

                    {/* Mini payment history */}
                    <div className="mt-3 flex gap-1">
                      {contract.payments.map((pay) => (
                        <PayDot key={pay.period} status={pay.status} period={pay.period} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground italic">Sin contrato activo</p>
                )}

                {hasIssues && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-warning">
                    <span>⚠</span>
                    <span>{local.maintenances.length} mantenimiento(s) abierto(s)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PayDot({ status, period }: { status: string; period: string }) {
  const color =
    status === "PAGADO"    ? "bg-emerald-500" :
    status === "VENCIDO"   ? "bg-red-500" :
    status === "PARCIAL"   ? "bg-blue-500" :
    status === "NO_APLICA" ? "bg-slate-300 dark:bg-slate-700" :
    "bg-amber-400";

  const month = period.slice(5, 7);
  const labels = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} title={`${labels[parseInt(month)]} — ${status}`} />
      <span className="text-[8px] text-muted-foreground">{labels[parseInt(month)]}</span>
    </div>
  );
}
