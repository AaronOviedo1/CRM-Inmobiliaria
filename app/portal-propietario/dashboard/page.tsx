import Link from "next/link";
import { ArrowUpRight, Building2, Eye, KeySquare, MessageSquare, Wrench } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card";
import { Button } from "@/components/ui/button";
import { formatMoneyCompact } from "@/lib/format";
import { StatusPill } from "@/components/common/status-pill";
import {
  PROPERTY_STATUS_LABEL,
  PROPERTY_STATUS_TONE,
  RENTAL_STATUS_LABEL,
  RENTAL_STATUS_TONE,
} from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function OwnerDashboardPage() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-propietario/login");
  const session = await validatePortalSession(token, "OWNER");
  if (!session) redirect("/portal-propietario/login");

  const owner = await prisma.owner.findFirst({
    where: { id: session.subjectId, organizationId: session.organizationId },
    select: { id: true, firstName: true, lastName: true },
  });

  const ownerData = owner ?? { id: "owner_1", firstName: "Roberto", lastName: "Salinas" };

  const [properties, rentals, pendingMaintCount] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: ownerData.id, organizationId: session.organizationId, deletedAt: null },
      select: { id: true, title: true, code: true, status: true, coverImageUrl: true, viewsCount: true, inquiriesCount: true, daysOnMarket: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.findMany({
      where: { ownerId: ownerData.id, organizationId: session.organizationId },
      include: {
        property: { select: { id: true, title: true } },
        tenant: { select: { id: true, firstName: true, lastName: true } },
        payments: {
          where: {
            dueDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            },
          },
          take: 1,
        },
      },
    }),
    prisma.maintenanceRequest.count({
      where: {
        organizationId: session.organizationId,
        status: { in: ["REPORTADO", "EN_REVISION"] as any[] },
      },
    }),
  ]);

  const totalViews = properties.reduce((a: number, p: any) => a + (p.viewsCount ?? 0), 0);
  const totalInquiries = properties.reduce((a: number, p: any) => a + (p.inquiriesCount ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Bienvenido</p>
        <h1 className="mt-1 font-serif text-4xl">
          Hola, <span className="gold-gradient-text">{ownerData.firstName}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esto es lo que está pasando con tus propiedades y rentas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Propiedades" value={properties.length} icon={<Building2 className="h-4 w-4" />} />
        <KpiCard label="Rentas activas" value={rentals.length} icon={<KeySquare className="h-4 w-4" />} accent="gold" />
        <KpiCard label="Vistas acumuladas" value={totalViews} icon={<Eye className="h-4 w-4" />} accent="info" />
        <KpiCard label="Consultas" value={totalInquiries} icon={<MessageSquare className="h-4 w-4" />} accent="success" />
      </div>

      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tus propiedades</p>
            <h2 className="mt-1 font-serif text-2xl">Cartera</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal-propietario/propiedades">Ver todas →</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 6).map((p: any) => (
            <Link
              key={p.id}
              href={`/portal-propietario/propiedades/${p.id}`}
              className="group overflow-hidden rounded-lg border border-border bg-surface hover-lift"
            >
              <div className="relative aspect-[4/3] bg-bg">
                {p.coverImageUrl && (
                  <img src={p.coverImageUrl} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
                )}
                <StatusPill
                  tone={PROPERTY_STATUS_TONE[p.status as keyof typeof PROPERTY_STATUS_TONE]}
                  className="absolute left-3 top-3"
                >
                  {PROPERTY_STATUS_LABEL[p.status as keyof typeof PROPERTY_STATUS_LABEL]}
                </StatusPill>
              </div>
              <div className="p-4">
                <p className="truncate font-serif text-lg">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.code}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {p.viewsCount}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {p.inquiriesCount}</span>
                  <span>{p.daysOnMarket ?? 0}d en mercado</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {rentals.length > 0 && (
        <section>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Rentas activas</p>
              <h2 className="mt-1 font-serif text-2xl">Tus inquilinos</h2>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
            {rentals.map((r: any) => {
              const currentPayment = r.payments[0];
              return (
                <li key={r.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{r.property?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Inquilino: {r.tenant?.firstName} {r.tenant?.lastName} ·{" "}
                      {formatMoneyCompact(toN(r.monthlyRent))} /mes
                    </p>
                  </div>
                  <StatusPill tone={RENTAL_STATUS_TONE[r.status as keyof typeof RENTAL_STATUS_TONE]}>
                    {RENTAL_STATUS_LABEL[r.status as keyof typeof RENTAL_STATUS_LABEL]}
                  </StatusPill>
                  {currentPayment && (
                    <StatusPill
                      tone={
                        currentPayment.status === "PAGADO" ? "success"
                          : currentPayment.status === "VENCIDO" ? "danger"
                          : "warning"
                      }
                    >
                      Pago {currentPayment.status}
                    </StatusPill>
                  )}
                  <Link href={`/portal-propietario/rentas/${r.id}`} className="text-gold hover:text-gold-hover">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {pendingMaintCount > 0 && (
        <section className="rounded-lg border border-dashed border-gold/30 bg-gold/5 p-5 flex items-center gap-4">
          <Wrench className="h-8 w-8 text-gold" />
          <div className="flex-1">
            <p className="font-medium">{pendingMaintCount} mantenimiento{pendingMaintCount > 1 ? "s" : ""} esperando tu aprobación</p>
            <p className="text-xs text-muted-foreground">Revísalos para autorizar el gasto y que arranquen los trabajos.</p>
          </div>
          <Button asChild>
            <Link href="/portal-propietario/mantenimientos">Ver mantenimientos</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
