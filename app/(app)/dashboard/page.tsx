import { Building2, KeySquare, Sparkles, Wrench, Calendar, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Greeting } from "@/components/dashboard/greeting";
import { KpiCard } from "@/components/common/kpi-card";
import { Section } from "@/components/common/section";
import { TasksTodayWidget } from "@/components/dashboard/tasks-today-widget";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { ExpiringContracts } from "@/components/dashboard/expiring-contracts";
import { Button } from "@/components/ui/button";
import { formatMoneyCompact } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function DashboardPage() {
  const [ctx, session] = await Promise.all([requireTenantContext(), requireSession()]);
  const orgId = ctx.organizationId;
  const now = new Date();
  const weekOut = addDays(now, 7);
  const monthOut = addDays(now, 30);

  const [
    activePropertiesCount,
    newLeadsCount,
    todayViewingsCount,
    pendingPayments,
    urgentMaintenance,
    recentInteractions,
    expiringContracts,
    tasks,
    rentals,
    user,
  ] = await Promise.all([
    prisma.property.count({ where: { organizationId: orgId, deletedAt: null, status: "DISPONIBLE" as any } }),
    prisma.lead.count({ where: { organizationId: orgId, deletedAt: null, status: "NUEVO" as any } }),
    prisma.viewing.count({
      where: {
        organizationId: orgId,
        scheduledAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
        },
      },
    }),
    prisma.rentalPayment.count({
      where: {
        rental: { organizationId: orgId },
        status: { in: ["PENDIENTE", "VENCIDO"] as any[] },
        dueDate: { lte: weekOut },
      },
    }),
    prisma.maintenanceRequest.count({
      where: {
        organizationId: orgId,
        priority: { in: ["URGENCIA", "ALTA"] as any[] },
        status: { notIn: ["COMPLETADO", "CERRADO"] as any[] },
      },
    }),
    prisma.interaction.findMany({
      where: { organizationId: orgId },
      orderBy: { occurredAt: "desc" },
      take: 10,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.propertyContract.findMany({
      where: {
        organizationId: orgId,
        status: "ACTIVO" as any,
        endDate: { lte: monthOut, gte: now },
      },
      include: { property: true, owner: true },
      orderBy: { endDate: "asc" },
      take: 10,
    }),
    prisma.task.findMany({
      where: { organizationId: orgId, assignedToId: session.id, status: { not: "COMPLETADA" as any } },
      include: {
        assignedTo: { select: { id: true, name: true } },
        relatedLead: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.rental.findMany({
      where: { organizationId: orgId, status: "ACTIVA" as any },
      select: { monthlyRent: true },
    }),
    prisma.user.findFirst({
      where: { id: session.id },
      select: { name: true },
    }),
  ]);

  const monthlyRentTotal = rentals.reduce((a, r) => a + toN(r.monthlyRent), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Greeting name={user?.name ?? "Agente"} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/visitas"><Calendar className="h-4 w-4" /> Agenda del día</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/leads"><Sparkles className="h-4 w-4" /> Revisar leads</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Propiedades activas" value={activePropertiesCount} icon={<Building2 className="h-4 w-4" />} />
        <KpiCard label="Leads sin contactar" value={newLeadsCount} icon={<Sparkles className="h-4 w-4" />} accent="warning" />
        <KpiCard label="Visitas hoy" value={todayViewingsCount} icon={<Calendar className="h-4 w-4" />} accent="info" />
        <KpiCard label="Pagos pendientes" value={pendingPayments} icon={<KeySquare className="h-4 w-4" />} accent={pendingPayments > 0 ? "warning" : undefined} />
        <KpiCard label="Mant. urgentes" value={urgentMaintenance} icon={<Wrench className="h-4 w-4" />} accent={urgentMaintenance > 0 ? "danger" : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Tus tareas de hoy" description="Marca hecha cada tarea al completarla." className="lg:col-span-2 rounded-lg border border-border bg-surface p-6" actions={<Button variant="ghost" size="sm" asChild><Link href="/tareas">Ver todas →</Link></Button>}>
          <TasksTodayWidget tasks={tasks as any} />
        </Section>
        <Section title="Comisiones estimadas" description="Pipeline en cartera activa" className="rounded-lg border border-border bg-surface p-6">
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Renta mensual bajo gestión</p>
              <p className="font-serif text-2xl">{formatMoneyCompact(monthlyRentTotal)}</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Actividad reciente del equipo" className="rounded-lg border border-border bg-surface p-6">
          <ActivityTimeline interactions={recentInteractions as any} />
        </Section>
        <Section title="Contratos próximos a vencer" description="Próximos 30 días — prioriza renovaciones." className="rounded-lg border border-border bg-surface p-6">
          <ExpiringContracts contracts={expiringContracts as any} />
        </Section>
      </div>

      <Section title="Tu cartera en el mapa" description="Propiedades activas" className="rounded-lg border border-border bg-surface p-6" actions={<Button variant="outline" size="sm" asChild><Link href="/propiedades/mapa"><MapPin className="h-4 w-4" /> Abrir mapa completo<ArrowUpRight className="h-4 w-4" /></Link></Button>}>
        <MapPreview count={activePropertiesCount} />
      </Section>
    </div>
  );
}

function MapPreview({ count }: { count: number }) {
  return (
    <div className="relative h-64 overflow-hidden rounded-md border border-border bg-gradient-to-br from-elevated via-surface to-bg">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <MapPin className="mx-auto h-6 w-6 text-gold" />
        <p className="mt-2 font-serif text-lg">Hermosillo</p>
        <p className="text-xs text-muted-foreground">{count} propiedades activas</p>
      </div>
    </div>
  );
}
