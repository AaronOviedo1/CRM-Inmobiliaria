import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_TYPE_LABEL } from "@/lib/labels";
import { PageHeader } from "@/components/common/page-header";
import { formatDate, formatMoneyCompact, formatPhone } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { getClientById } from "@/lib/repos/entities";

interface Props { params: Promise<{ id: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const client = await getClientById(ctx, id);
  if (!client) notFound();
  const rentals = client.rentalsAsTenant ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/clientes"><ArrowLeft className="h-4 w-4" /> Todos los clientes</Link>
      </Button>
      <PageHeader
        eyebrow={CLIENT_TYPE_LABEL[client.type as keyof typeof CLIENT_TYPE_LABEL]}
        title={`${client.firstName} ${client.lastName}`}
        description={`Cliente desde ${formatDate(client.createdAt)}`}
        actions={
          <>
            <Button variant="outline"><Phone className="h-4 w-4" /> Llamar</Button>
            <Button><MessageSquare className="h-4 w-4" /> WhatsApp</Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Operaciones" value={client.totalOperations} />
        <Stat label="LTV" value={formatMoneyCompact(toN(client.lifetimeValueMxn))} />
        <Stat label="Teléfono" value={formatPhone(client.phone ?? "")} />
      </div>

      {rentals.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-xl">Rentas activas</h3>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {rentals.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/rentas/${r.id}`} className="font-medium hover:text-gold">
                    {r.property?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatMoneyCompact(toN(r.monthlyRent))} /mes · Vigente hasta {formatDate(r.endDate)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
