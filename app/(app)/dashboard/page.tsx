import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const CURRENT_PERIOD = "2026-04";
  const CURRENT_YEAR   = 2026;

  // Totals
  const [locales, contracts, payments, openMaint, budgetIncome, budgetExpense] =
    await Promise.all([
      prisma.local.count({ where: { organizationId: oid } }),
      prisma.contract.count({ where: { organizationId: oid, isActive: true } }),
      prisma.payment.findMany({
        where: { organizationId: oid, period: CURRENT_PERIOD },
        select: { status: true, amount: true },
      }),
      prisma.maintenance.count({
        where: { organizationId: oid, status: { in: ["ABIERTO", "EN_PROGRESO"] } },
      }),
      prisma.budgetLine.aggregate({
        where: { organizationId: oid, year: CURRENT_YEAR, month: 4, isIncome: true },
        _sum: { budgeted: true },
      }),
      prisma.budgetLine.aggregate({
        where: { organizationId: oid, year: CURRENT_YEAR, month: 4, isIncome: false },
        _sum: { budgeted: true },
      }),
    ]);

  const totalLocales   = locales;
  const rentados       = contracts;
  const ocupacion      = totalLocales > 0 ? Math.round((rentados / totalLocales) * 100) : 0;

  const pagado    = payments.filter((p) => p.status === "PAGADO").reduce((s, p) => s + Number(p.amount), 0);
  const vencido   = payments.filter((p) => p.status === "VENCIDO").reduce((s, p) => s + Number(p.amount), 0);
  const pendiente = payments.filter((p) => p.status === "PENDIENTE").reduce((s, p) => s + Number(p.amount), 0);
  const totalEsperado = pagado + vencido + pendiente;
  const cobranzaPct = totalEsperado > 0 ? Math.round((pagado / totalEsperado) * 100) : 0;

  const presupuestoIngresos = Number(budgetIncome._sum.budgeted ?? 0);
  const presupuestoEgresos  = Number(budgetExpense._sum.budgeted ?? 0);
  const utilidadEstimada    = presupuestoIngresos - presupuestoEgresos;

  // Recent alerts
  const vencidosDetail = await prisma.payment.findMany({
    where: { organizationId: oid, status: "VENCIDO" },
    include: {
      contract: {
        include: {
          tenant: { select: { name: true } },
          local:  { select: { nickname: true, plaza: { select: { name: true } } } },
        },
      },
    },
    take: 5,
    orderBy: { period: "desc" },
  });

  const maintOpen = await prisma.maintenance.findMany({
    where: { organizationId: oid, status: { in: ["ABIERTO", "EN_PROGRESO"] } },
    include: { local: { select: { nickname: true, plaza: { select: { name: true } } } } },
    orderBy: [{ priority: "desc" }, { reportedAt: "desc" }],
    take: 4,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Abril 2026"
        title="Dashboard"
        description="Vista ejecutiva — CRT Inmobiliaria"
      />

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ocupación"
          value={`${ocupacion}%`}
          sub={`${rentados} de ${totalLocales} locales`}
          icon={Building2}
          trend={ocupacion >= 90 ? "up" : ocupacion >= 75 ? "neutral" : "down"}
        />
        <KpiCard
          label="Cobranza Abr"
          value={`${cobranzaPct}%`}
          sub={`${formatCurrency(pagado)} cobrado`}
          icon={CreditCard}
          trend={cobranzaPct >= 90 ? "up" : cobranzaPct >= 75 ? "neutral" : "down"}
        />
        <KpiCard
          label="Ingresos Presup."
          value={formatCurrency(presupuestoIngresos)}
          sub="Presupuesto Abr 2026"
          icon={TrendingUp}
          trend="neutral"
        />
        <KpiCard
          label="Utilidad Estimada"
          value={formatCurrency(utilidadEstimada)}
          sub={`Egresos: ${formatCurrency(presupuestoEgresos)}`}
          icon={TrendingUp}
          trend={utilidadEstimada > 0 ? "up" : "down"}
        />
      </div>

      {/* Alerts & Maintenance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pagos vencidos */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger" />
              <h2 className="font-medium text-foreground">Pagos vencidos</h2>
            </div>
            <Link href="/cobranza" className="flex items-center gap-1 text-xs text-gold hover:underline">
              Ver cobranza <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {vencidosDetail.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Sin pagos vencidos
            </div>
          ) : (
            <div className="space-y-2">
              {vencidosDetail.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.contract.tenant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.contract.local.nickname} · {p.contract.local.plaza.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-danger">{formatCurrency(Number(p.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mantenimientos abiertos */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-warning" />
              <h2 className="font-medium text-foreground">Mantenimientos</h2>
              {openMaint > 0 && (
                <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                  {openMaint}
                </span>
              )}
            </div>
            <Link href="/mantenimientos" className="flex items-center gap-1 text-xs text-gold hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {maintOpen.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Sin mantenimientos pendientes
            </div>
          ) : (
            <div className="space-y-2">
              {maintOpen.map((m) => (
                <div key={m.id} className="flex items-start gap-3 rounded-md bg-muted px-3 py-2">
                  <PriorityDot priority={m.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.local.nickname} · {m.local.plaza.name}
                    </p>
                  </div>
                  <StatusChip status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/cobranza",       label: "Matriz de Cobranza",  desc: "Estado de pagos por local y mes" },
          { href: "/plazas",         label: "Mis Plazas",           desc: "Locales, contratos y ocupación" },
          { href: "/finanzas",       label: "Presupuesto 2026",     desc: "Ingresos vs egresos por entidad" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 shadow-card hover:border-gold/40 hover:shadow-gold-glow transition-all"
          >
            <div>
              <p className="font-medium text-foreground group-hover:text-gold transition-colors">{q.label}</p>
              <p className="text-xs text-muted-foreground">{q.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div
          className={
            trend === "up"
              ? "rounded-md bg-success/10 p-1.5 text-success"
              : trend === "down"
              ? "rounded-md bg-danger/10 p-1.5 text-danger"
              : "rounded-md bg-muted p-1.5 text-muted-foreground"
          }
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const cls =
    priority === "URGENTE" ? "bg-danger" :
    priority === "ALTA"    ? "bg-warning" :
    priority === "MEDIA"   ? "bg-gold" :
                             "bg-muted-foreground";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cls}`} />;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    ABIERTO:     "bg-danger/10 text-danger",
    EN_PROGRESO: "bg-warning/10 text-warning",
    CERRADO:     "bg-success/10 text-success",
  };
  const label: Record<string, string> = {
    ABIERTO: "Abierto", EN_PROGRESO: "En prog.", CERRADO: "Cerrado"
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </span>
  );
}

// React import needed for JSX
import React from "react";
