import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Phone, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from "@/components/property/property-card";
import { formatPhone, formatRelative, formatMoneyCompact } from "@/lib/format";
import { StatusPill } from "@/components/common/status-pill";
import { RENTAL_STATUS_LABEL, RENTAL_STATUS_TONE, CONTRACT_STATUS_LABEL, CONTRACT_STATUS_TONE, CONTRACT_KIND_LABEL } from "@/lib/labels";
import { EmptyState } from "@/components/common/empty-state";
import { Home } from "lucide-react";
import { requireTenantContext } from "@/lib/auth/session";
import { getOwnerById } from "@/lib/repos/entities";

interface Props { params: Promise<{ id: string }>; }

export default async function OwnerDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const owner = await getOwnerById(ctx, id);
  if (!owner) notFound();

  const properties = owner.properties ?? [];
  const rentals = (owner as any).rentals ?? [];
  const contracts = (owner as any).contracts ?? [];
  const interactions = (owner as any).interactions ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/propietarios">
          <ArrowLeft className="h-4 w-4" /> Todos los propietarios
        </Link>
      </Button>

      <header className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 md:flex-row md:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-lg font-semibold text-gold">
          {owner.firstName[0]}{owner.lastName[0]}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-gold">
            Propietario · Cliente desde {formatRelative(owner.createdAt)}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium">
            {owner.firstName} {owner.lastName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {owner.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {formatPhone(owner.phone)}</span>}
            {owner.whatsapp && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> WhatsApp</span>}
            {owner.email && <span>{owner.email}</span>}
            {owner.bankName && <span>· {owner.bankName} ****{owner.accountLast4}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button>
            <Send className="h-4 w-4" /> Enviar link de portal
          </Button>
          {owner.portalAccessEnabled && (
            <span className="inline-flex items-center gap-1 justify-center rounded-full border border-gold/30 bg-gold-faint px-3 py-1 text-xs text-gold">
              <Shield className="h-3 w-3" /> Portal habilitado
            </span>
          )}
        </div>
      </header>

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">Propiedades ({properties.length})</TabsTrigger>
          <TabsTrigger value="rentals">Rentas activas ({rentals.length})</TabsTrigger>
          <TabsTrigger value="contracts">Contratos ({contracts.length})</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="portal">Portal</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {properties.length === 0 ? (
            <EmptyState icon={<Home className="h-5 w-5" />} title="Sin propiedades aún" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p as any} index={i} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rentals">
          {rentals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este propietario no tiene rentas activas.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {rentals.map((r: any) => (
                <li key={r.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/rentas/${r.id}`} className="font-medium hover:text-gold truncate">
                      {r.property?.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Inquilino {r.tenant?.firstName} {r.tenant?.lastName} · {formatMoneyCompact(r.monthlyRent)} /mes
                    </p>
                  </div>
                  <StatusPill tone={RENTAL_STATUS_TONE[r.status as keyof typeof RENTAL_STATUS_TONE]}>
                    {RENTAL_STATUS_LABEL[r.status as keyof typeof RENTAL_STATUS_LABEL]}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="contracts">
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {contracts.map((c: any) => (
              <li key={c.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/contratos/${c.id}`} className="font-medium hover:text-gold truncate">
                    {c.property?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {CONTRACT_KIND_LABEL[c.contractKind as keyof typeof CONTRACT_KIND_LABEL]} · {formatMoneyCompact(c.agreedPrice)} · Comisión {String(c.commissionPct)}%
                  </p>
                </div>
                <StatusPill tone={CONTRACT_STATUS_TONE[c.status as keyof typeof CONTRACT_STATUS_TONE]}>
                  {CONTRACT_STATUS_LABEL[c.status as keyof typeof CONTRACT_STATUS_LABEL]}
                </StatusPill>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-2">
            {interactions.length > 0 ? (
              <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                {interactions.map((i: any) => (
                  <li key={i.id} className="p-4 text-sm">
                    <p className="font-medium">{i.summary ?? i.kind}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatRelative(i.occurredAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin interacciones registradas.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="portal">
          <div className="rounded-lg border border-border bg-surface p-6 space-y-3">
            <h4 className="font-serif text-xl">Portal del propietario</h4>
            <p className="text-sm text-muted-foreground">
              Compártele este link privado (válido por 30 días) para que vea en vivo el estado de sus propiedades y rentas.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-2">
              <code className="flex-1 text-xs text-gold truncate">
                https://casadorada.crm.mx/portal-propietario?token={owner.portalAccessToken ?? "…"}
              </code>
              <Button size="sm" variant="outline">Copiar</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4" /> Enviar por WhatsApp
              </Button>
              <Button variant="ghost">Revocar link</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
