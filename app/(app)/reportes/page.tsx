import Link from "next/link";
import { ArrowRight, Building2, FlaskConical, MapPin, Sparkles, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { KpiCard } from "@/components/common/kpi-card";
import { formatMoneyCompact } from "@/lib/format";
import { Section } from "@/components/common/section";
import { Sparkline } from "@/components/common/sparkline";
import { LEAD_SOURCE_LABEL } from "@/lib/labels";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, endOfMonth } from "date-fns";

export default async function ReportesPage() {
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    activeProperties,
    totalLeads,
    wonLeads,
    visitLeads,
    monthViewings,
    rentals,
    leadsBySource,
    dailyLeads,
    dailyViewings,
    dailyClosed,
  ] = await Promise.all([
    prisma.property.count({ where: { organizationId: orgId, deletedAt: null, status: "DISPONIBLE" } }),
    prisma.lead.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.lead.count({ where: { organizationId: orgId, deletedAt: null, status: "GANADO" as any } }),
    prisma.lead.count({ where: { organizationId: orgId, deletedAt: null, status: { in: ["VISITA_REALIZADA", "OFERTA", "NEGOCIACION", "GANADO"] as any } } }),
    prisma.viewing.count({ where: { organizationId: orgId, scheduledAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.rental.findMany({ where: { organizationId: orgId, status: "ACTIVA" as any }, select: { monthlyRent: true } }),
    prisma.lead.groupBy({ by: ["source"], where: { organizationId: orgId, deletedAt: null }, _count: true }),
    Promise.all(Array.from({ length: 14 }, (_, i) => {
      const d = subDays(now, 13 - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      return prisma.lead.count({ where: { organizationId: orgId, createdAt: { gte: start, lte: end } } });
    })),
    Promise.all(Array.from({ length: 14 }, (_, i) => {
      const d = subDays(now, 13 - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      return prisma.viewing.count({ where: { organizationId: orgId, scheduledAt: { gte: start, lte: end } } });
    })),
    Promise.all(Array.from({ length: 14 }, (_, i) => {
      const d = subDays(now, 13 - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      return prisma.lead.count({ where: { organizationId: orgId, status: "GANADO" as any, updatedAt: { gte: start, lte: end } } });
    })),
  ]);

  const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);
  const wonRate = wonLeads / Math.max(totalLeads, 1);
  const visitRate = visitLeads / Math.max(totalLeads, 1);
  const totalRent = rentals.reduce((a, r) => a + toN(r.monthlyRent), 0);
  const sourceMap = Object.fromEntries(leadsBySource.map((s) => [s.source, s._count]));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reportes"
        title="Inteligencia de negocio"
        description="KPIs, funnels, churn y desempeño por agente."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Propiedades activas" value={activeProperties} icon={<Building2 className="h-4 w-4" />} accent="gold" />
        <KpiCard label="Leads este mes" value={totalLeads} icon={<Sparkles className="h-4 w-4" />} accent="info" />
        <KpiCard label="Conversión visita" value={`${(visitRate * 100).toFixed(1)}%`} icon={<TrendingUp className="h-4 w-4" />} accent="gold" />
        <KpiCard label="Conversión cierre" value={`${(wonRate * 100).toFixed(1)}%`} icon={<Users className="h-4 w-4" />} accent="success" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Renta mensual gestionada" value={formatMoneyCompact(totalRent)} accent="gold" />
        <KpiCard label="Visitas del mes" value={monthViewings} accent="info" />
      </div>

      <Section title="Explorar por dimensión" description="Abre cada módulo para drill-downs.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            { href: "/reportes/agentes", label: "Desempeño por agente", icon: Users },
            { href: "/reportes/propiedades", label: "Propiedades más vistas", icon: Building2 },
            { href: "/reportes/fuentes-leads", label: "Leads por fuente", icon: Sparkles },
            { href: "/reportes/conversion", label: "Funnel de conversión", icon: TrendingUp },
            { href: "/reportes/rentas", label: "Churn de rentas", icon: FlaskConical },
            { href: "#", label: "Mapa de calor por zona", icon: MapPin },
          ].map((r) => (
            <Link key={r.href} href={r.href} className="group flex items-center justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-gold/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-faint text-gold">
                  <r.icon className="h-4 w-4" />
                </div>
                <p className="font-medium">{r.label}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Leads por fuente">
        <div className="space-y-2 rounded-lg border border-border bg-surface p-5">
          {(Object.keys(LEAD_SOURCE_LABEL) as Array<keyof typeof LEAD_SOURCE_LABEL>).map((src) => {
            const count = sourceMap[src as string] ?? 0;
            const pct = (count / Math.max(totalLeads, 1)) * 100;
            if (count === 0) return null;
            return (
              <div key={src} className="flex items-center gap-3">
                <p className="w-36 text-xs text-muted-foreground">{LEAD_SOURCE_LABEL[src]}</p>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Tendencias últimos 14 días">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Leads nuevos", data: dailyLeads },
            { label: "Visitas realizadas", data: dailyViewings },
            { label: "Operaciones cerradas", data: dailyClosed },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <Sparkline data={s.data} className="mt-3 h-12 w-full" />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
