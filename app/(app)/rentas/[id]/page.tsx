import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, KeyRound, MessageSquare, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentCard } from "@/components/rentals/payment-card";
import {
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
  MAINTENANCE_PRIORITY_LABEL,
  MAINTENANCE_PRIORITY_TONE,
  MAINTENANCE_CATEGORY_LABEL,
  RENTAL_STATUS_LABEL,
  RENTAL_STATUS_TONE,
} from "@/lib/labels";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { getRentalById } from "@/lib/repos/entities";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const r = await getRentalById(ctx, id);
  if (!r) notFound();

  const maintenance = await prisma.maintenanceRequest.findMany({
    where: { rentalId: r.id, organizationId: ctx.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/rentas"><ArrowLeft className="h-4 w-4" /> Todas las rentas</Link>
      </Button>

      <header className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <StatusPill tone={RENTAL_STATUS_TONE[r.status as keyof typeof RENTAL_STATUS_TONE]}>
              {RENTAL_STATUS_LABEL[r.status as keyof typeof RENTAL_STATUS_LABEL]}
            </StatusPill>
            <h1 className="mt-3 font-serif text-3xl font-medium truncate">
              {r.property?.title}
            </h1>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
              <div>
                <p className="uppercase tracking-wider">Inquilino</p>
                <p className="text-foreground">{r.tenant?.firstName} {r.tenant?.lastName}</p>
              </div>
              <div>
                <p className="uppercase tracking-wider">Propietario</p>
                <p className="text-foreground">{r.owner?.firstName} {r.owner?.lastName}</p>
              </div>
              <div>
                <p className="uppercase tracking-wider">Vigencia</p>
                <p className="text-foreground">{formatDate(r.startDate)} → {formatDate(r.endDate)}</p>
              </div>
              <div>
                <p className="uppercase tracking-wider">Renta mensual</p>
                <p className="text-gold">{formatMoney(toN(r.monthlyRent), r.currency as any)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button><MessageSquare className="h-4 w-4" /> WhatsApp inquilino</Button>
            <Button variant="outline"><KeyRound className="h-4 w-4" /> Renovar contrato</Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Pagos ({r.payments?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimientos ({maintenance.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="communication">Comunicación</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Depósito en garantía" value={formatMoney(toN(r.depositHeld))} />
            <StatCard label="Día de pago" value={r.paymentDueDay} />
            <StatCard label="Pagos consecutivos" value={(r.payments ?? []).filter((p) => p.status === "PAGADO").length} />
          </div>
          <div className="rounded-lg border border-border bg-surface p-6">
            <h4 className="font-serif text-xl">Servicios incluidos</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.utilitiesIncluded.length > 0 ? r.utilitiesIncluded.map((u) => (
                <span key={u} className="rounded-full border border-border bg-muted px-3 py-1 text-xs">{u}</span>
              )) : <p className="text-sm text-muted-foreground">No incluye servicios.</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(r.payments ?? []).map((p) => (
              <PaymentCard key={p.id} payment={p as any} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-3">
          {maintenance.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin solicitudes de mantenimiento.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {maintenance.map((m) => (
                <li key={m.id} className="flex items-center gap-3 p-4">
                  <Wrench className="h-4 w-4 text-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/mantenimientos/${m.id}`} className="font-medium hover:text-gold truncate">
                      {m.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {MAINTENANCE_CATEGORY_LABEL[m.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]} · Reportado {formatRelative(m.createdAt)}
                    </p>
                  </div>
                  <StatusPill tone={MAINTENANCE_PRIORITY_TONE[m.priority as keyof typeof MAINTENANCE_PRIORITY_TONE]}>
                    {MAINTENANCE_PRIORITY_LABEL[m.priority as keyof typeof MAINTENANCE_PRIORITY_LABEL]}
                  </StatusPill>
                  <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
                    {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="inventory">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h4 className="font-serif text-xl">Inventario</h4>
            {r.inventoryList ? (
              <pre className="mt-4 rounded-md bg-bg p-4 text-xs overflow-x-auto text-foreground">
{JSON.stringify(r.inventoryList, null, 2)}
              </pre>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Sin inventario capturado.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <p className="text-sm text-muted-foreground">
            Contrato de arrendamiento, inventario firmado, identificaciones.{" "}
            <Link href={`/rentas/${r.id}/documentos`} className="text-gold hover:text-gold-hover">
              Ver documentos →
            </Link>
          </p>
        </TabsContent>

        <TabsContent value="communication">
          <p className="text-sm text-muted-foreground">
            Inbox de WhatsApp del inquilino. Ver{" "}
            <Link href="/comunicacion" className="text-gold hover:text-gold-hover">
              módulo Comunicación →
            </Link>
          </p>
        </TabsContent>
      </Tabs>

      <section className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Reporte mensual para propietario</h3>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" /> Generar reporte
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Incluye pagos del mes, mantenimientos realizados, incidencias y estado general. Se descarga como PDF.
        </p>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
