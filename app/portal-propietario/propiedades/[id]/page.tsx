import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Eye, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/common/kpi-card";
import { Sparkline } from "@/components/common/sparkline";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_TONE, VIEWING_STATUS_LABEL, VIEWING_STATUS_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatDateTime } from "@/lib/format";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function OwnerPropertyPage({ params }: Props) {
  const { id } = await params;
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-propietario/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "OWNER") redirect("/portal-propietario/login");

  const p = await prisma.property.findFirst({
    where: { id, ownerId: session.subjectId, organizationId: session.organizationId, deletedAt: null },
  });
  if (!p) notFound();

  const views = await prisma.viewing.findMany({
    where: { propertyId: p.id, organizationId: session.organizationId },
    include: { lead: { select: { firstName: true, lastName: true } } },
    orderBy: { scheduledAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/portal-propietario/dashboard"><ArrowLeft className="h-4 w-4" /> Mi portal</Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div>
          <StatusPill tone={PROPERTY_STATUS_TONE[p.status as keyof typeof PROPERTY_STATUS_TONE]}>
            {PROPERTY_STATUS_LABEL[p.status as keyof typeof PROPERTY_STATUS_LABEL]}
          </StatusPill>
          <h1 className="mt-3 font-serif text-3xl">{p.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.neighborhood} · {p.code}
          </p>
        </div>
        {p.coverImageUrl && (
          <div className="overflow-hidden rounded-lg border border-border bg-surface aspect-[16/10]">
            <img src={p.coverImageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Vistas" value={p.viewsCount} icon={<Eye className="h-4 w-4" />} accent="gold" />
        <KpiCard label="Consultas" value={p.inquiriesCount} icon={<MessageSquare className="h-4 w-4" />} accent="info" />
        <KpiCard label="Visitas" value={views.length} icon={<Calendar className="h-4 w-4" />} accent="success" />
        <KpiCard label="Días en mercado" value={p.daysOnMarket ?? 0} accent="warning" />
      </div>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-serif text-xl">Interesados recientes</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Por privacidad mostramos solo nombre parcial y nivel de interés.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {views.slice(0, 5).map((v) => (
            <li key={v.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">
                  {v.lead?.firstName?.[0]}. {v.lead?.lastName?.[0]}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Visita {formatDateTime(v.scheduledAt)}
                </p>
              </div>
              <StatusPill tone={VIEWING_STATUS_TONE[v.status as keyof typeof VIEWING_STATUS_TONE]}>
                {VIEWING_STATUS_LABEL[v.status as keyof typeof VIEWING_STATUS_LABEL]}
              </StatusPill>
            </li>
          ))}
          {views.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">Aún no hay visitas.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
