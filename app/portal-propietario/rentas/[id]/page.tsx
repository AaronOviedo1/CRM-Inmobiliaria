import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import {
  RENTAL_STATUS_LABEL,
  RENTAL_STATUS_TONE,
  RENTAL_PAYMENT_STATUS_LABEL,
  RENTAL_PAYMENT_STATUS_TONE,
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
} from "@/lib/labels";
import { formatDate, formatMoney } from "@/lib/format";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function OwnerRentalPage({ params }: Props) {
  const { id } = await params;
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-propietario/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "OWNER") redirect("/portal-propietario/login");

  const r = await prisma.rental.findFirst({
    where: { id, ownerId: session.subjectId, organizationId: session.organizationId },
    include: {
      property: { select: { title: true } },
      tenant: { select: { firstName: true, lastName: true } },
      payments: { orderBy: { dueDate: "desc" }, take: 12 },
    },
  });
  if (!r) notFound();

  const maint = await prisma.maintenanceRequest.findMany({
    where: { rentalId: r.id, organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const currentPayment = r.payments.find(
    (p) => new Date(p.dueDate).getMonth() === now.getMonth() &&
            new Date(p.dueDate).getFullYear() === now.getFullYear()
  );
  const lastPaid = r.payments
    .filter((p) => p.status === "PAGADO")
    .sort((a, b) => (b.paidAt?.getTime() ?? 0) - (a.paidAt?.getTime() ?? 0))[0];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/portal-propietario/dashboard">
          <ArrowLeft className="h-4 w-4" /> Volver al dashboard
        </Link>
      </Button>
      <PageHeader
        eyebrow="Tu renta"
        title={r.property?.title ?? "Renta"}
        description={`Contrato del ${formatDate(r.startDate)} al ${formatDate(r.endDate)}`}
        actions={
          <StatusPill tone={RENTAL_STATUS_TONE[r.status as keyof typeof RENTAL_STATUS_TONE]}>
            {RENTAL_STATUS_LABEL[r.status as keyof typeof RENTAL_STATUS_LABEL]}
          </StatusPill>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Renta mensual" value={formatMoney(toN(r.monthlyRent))} />
        <StatCard
          label="Pago mes actual"
          value={
            currentPayment ? (
              <StatusPill tone={RENTAL_PAYMENT_STATUS_TONE[currentPayment.status as keyof typeof RENTAL_PAYMENT_STATUS_TONE]}>
                {RENTAL_PAYMENT_STATUS_LABEL[currentPayment.status as keyof typeof RENTAL_PAYMENT_STATUS_LABEL]}
              </StatusPill>
            ) : "—"
          }
        />
        <StatCard
          label="Último pago recibido"
          value={lastPaid ? formatDate(lastPaid.paidAt ?? new Date()) : "—"}
        />
      </div>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-serif text-xl">Inquilino actual</h3>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-faint text-gold font-semibold">
            {r.tenant?.firstName[0]}{r.tenant?.lastName[0]}
          </div>
          <div>
            <p className="font-medium">{r.tenant?.firstName} {r.tenant?.lastName}</p>
            <p className="text-xs text-muted-foreground">Datos detallados disponibles con tu agente por privacidad.</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl">Mantenimientos</h3>
          <span className="text-xs text-muted-foreground">{maint.length} solicitudes</span>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {maint.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</p>
              </div>
              <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
                {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
              </StatusPill>
              {(m.status === "EN_REVISION" || m.status === "REPORTADO") && (
                <Button size="sm">Aprobar</Button>
              )}
            </li>
          ))}
          {maint.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">Sin mantenimientos reportados.</li>
          )}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 flex items-center gap-4">
        <Calendar className="h-6 w-6 text-gold" />
        <div className="flex-1">
          <p className="font-serif text-lg">Reporte mensual</p>
          <p className="text-xs text-muted-foreground">Descarga el PDF con pagos, mantenimientos e incidencias del mes.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" /> Descargar
        </Button>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 font-serif text-2xl">{value}</div>
    </div>
  );
}
