import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { MessageSquare, Phone, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { RENTAL_STATUS_LABEL, RENTAL_STATUS_TONE } from "@/lib/labels";
import { formatDate, formatMoney } from "@/lib/format";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function TenantMyRentalPage() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-inquilino/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "TENANT") redirect("/portal-inquilino/login");

  const rental = await prisma.rental.findFirst({
    where: { tenantClientId: session.subjectId, organizationId: session.organizationId },
    include: {
      property: { select: { title: true } },
      agent: { select: { id: true, name: true, phone: true } },
    },
  });

  if (!rental) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay renta activa. Contacta a tu agente.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mi renta"
        title={rental.property?.title ?? ""}
        description={`Vigente del ${formatDate(rental.startDate)} al ${formatDate(rental.endDate)}`}
        actions={
          <StatusPill tone={RENTAL_STATUS_TONE[rental.status as keyof typeof RENTAL_STATUS_TONE]}>
            {RENTAL_STATUS_LABEL[rental.status as keyof typeof RENTAL_STATUS_LABEL]}
          </StatusPill>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Renta mensual" value={formatMoney(toN(rental.monthlyRent))} />
        <StatCard label="Día de pago" value={`Cada día ${rental.paymentDueDay}`} />
        <StatCard label="Depósito en garantía" value={formatMoney(toN(rental.depositHeld))} />
      </div>

      {rental.agent && (
        <section className="rounded-lg border border-border bg-surface p-6">
          <h3 className="font-serif text-xl">Contacto de tu agente</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-gold font-semibold">
              {rental.agent.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium">{rental.agent.name}</p>
              <p className="text-xs text-muted-foreground">{rental.agent.phone}</p>
            </div>
            <Button variant="outline" size="sm"><Phone className="h-4 w-4" /></Button>
            <Button size="sm"><MessageSquare className="h-4 w-4" /> WhatsApp</Button>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-border bg-surface p-6 flex items-center gap-4">
        <Wrench className="h-6 w-6 text-gold" />
        <div className="flex-1">
          <p className="font-serif text-lg">¿Algo falla en la propiedad?</p>
          <p className="text-xs text-muted-foreground">Reporta con foto y se atiende en menos de 48h.</p>
        </div>
        <Button asChild>
          <Link href="/portal-inquilino/reportar-mantenimiento">Reportar</Link>
        </Button>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-serif text-xl">Servicios incluidos</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {rental.utilitiesIncluded.length > 0 ? (
            rental.utilitiesIncluded.map((u) => (
              <span key={u} className="rounded-full border border-border bg-muted px-3 py-1 text-xs">{u}</span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Ninguno incluido.</p>
          )}
        </div>
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
