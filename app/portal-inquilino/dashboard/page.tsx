import Link from "next/link";
import { AlertTriangle, Calendar, ChevronRight, Receipt, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/status-pill";
import {
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
  RENTAL_PAYMENT_STATUS_LABEL,
  RENTAL_PAYMENT_STATUS_TONE,
} from "@/lib/labels";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

// TODO(backend): restore cookie-based portal auth when backend is wired up.
const MOCK_SESSION = { organizationId: "org_1", kind: "TENANT" as const, subjectId: "client_1" };

export default async function TenantDashboardPage() {
  const session = MOCK_SESSION;

  const client = await prisma.client.findFirst({
    where: { id: session.subjectId, organizationId: session.organizationId },
    select: { id: true, firstName: true, lastName: true },
  });

  const clientData = client ?? { id: "client_1", firstName: "Ana", lastName: "Torres" };

  const now = new Date();
  const rental = await prisma.rental.findFirst({
    where: { tenantClientId: clientData.id, organizationId: session.organizationId },
    include: {
      property: { select: { title: true } },
      payments: { orderBy: { dueDate: "desc" }, take: 6 },
    },
  });

  const currentPayment = rental?.payments?.find(
    (p: any) => new Date(p.dueDate).getMonth() === now.getMonth() &&
            new Date(p.dueDate).getFullYear() === now.getFullYear()
  );
  const nextPayment = rental?.payments?.find((p: any) => p.status === "PENDIENTE");

  const myMaint = rental ? await prisma.maintenanceRequest.findMany({
    where: { rentalId: rental.id, organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    take: 4,
  }) : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Hola</p>
        <h1 className="mt-1 font-serif text-3xl">
          {clientData.firstName} {clientData.lastName}
        </h1>
      </div>

      {rental && (
        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Tu renta</p>
              <p className="mt-1 font-serif text-xl">{rental.property?.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Vigente hasta {formatDate(rental.endDate)}{" "}
                ({daysUntil(rental.endDate)} días)
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/portal-inquilino/mi-renta">
                Ver detalle <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border bg-elevated p-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gold" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Pago del mes</p>
              </div>
              {currentPayment ? (
                <>
                  <p className="mt-2 font-serif text-2xl">{formatMoney(toN(currentPayment.amountDue))}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusPill tone={RENTAL_PAYMENT_STATUS_TONE[currentPayment.status as keyof typeof RENTAL_PAYMENT_STATUS_TONE]}>
                      {RENTAL_PAYMENT_STATUS_LABEL[currentPayment.status as keyof typeof RENTAL_PAYMENT_STATUS_LABEL]}
                    </StatusPill>
                    <p className="text-xs text-muted-foreground">Vence {formatDate(currentPayment.dueDate)}</p>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Al corriente este mes ✓</p>
              )}
            </div>
            <div className="rounded-md border border-border bg-elevated p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Próximo pago</p>
              </div>
              {nextPayment ? (
                <>
                  <p className="mt-2 font-serif text-2xl">{formatMoney(toN(nextPayment.amountDue))}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Vence {formatDate(nextPayment.dueDate)}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Nada pendiente.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-2">
        <Link
          href="/portal-inquilino/reportar-mantenimiento"
          className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold-faint p-5 hover-lift"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold text-black">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Reportar un problema</p>
            <p className="text-xs text-muted-foreground">Con foto desde tu cámara.</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/portal-inquilino/pagos"
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-5 hover-lift"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-faint text-gold">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Subir comprobante de pago</p>
            <p className="text-xs text-muted-foreground">Adjunta tu transferencia.</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      {myMaint.length > 0 && (
        <section>
          <h3 className="font-serif text-xl">Tus solicitudes de mantenimiento</h3>
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
            {myMaint.map((m: any) => (
              <li key={m.id} className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-4 w-4 text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">Reportado {formatDate(m.createdAt)}</p>
                </div>
                <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
                  {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
                </StatusPill>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
