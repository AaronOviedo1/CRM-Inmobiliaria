import { PageHeader } from "@/components/common/page-header";
import { CONTRACT_KIND_LABEL, CONTRACT_STATUS_LABEL, CONTRACT_STATUS_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatDate, formatMoney } from "@/lib/format";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requireTenantContext } from "@/lib/auth/session";
import { listContracts } from "@/lib/repos/entities";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ContratosPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const { rows, total } = await listContracts(ctx, { status: raw.status });

  const today = new Date();
  const daysUntil = (d: Date) => Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${total} contratos`} title="Contratos" description="Mandatos, arrendamientos y compraventas vigentes." actions={
        <Button asChild><Link href="/contratos/nuevo"><Plus className="h-4 w-4" /> Nuevo contrato</Link></Button>
      } />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Propiedad</th>
              <th className="px-4 py-3 text-right">Valor acordado</th>
              <th className="px-4 py-3 text-left">Vence en</th>
              <th className="px-4 py-3 text-left">Vencimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.map((c) => {
              const days = c.endDate ? daysUntil(c.endDate) : null;
              return (
                <tr key={c.id} className="hover:bg-elevated">
                  <td className="px-4 py-3">{CONTRACT_KIND_LABEL[c.contractKind as keyof typeof CONTRACT_KIND_LABEL]}</td>
                  <td className="px-4 py-3"><StatusPill tone={CONTRACT_STATUS_TONE[c.status as keyof typeof CONTRACT_STATUS_TONE]}>{CONTRACT_STATUS_LABEL[c.status as keyof typeof CONTRACT_STATUS_LABEL]}</StatusPill></td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(c as any).property ? (
                      <Link href={`/propiedades/${c.propertyId}`} className="hover:text-gold">{(c as any).property.title}</Link>
                    ) : c.propertyId}
                  </td>
                  <td className="px-4 py-3 text-right">{c.agreedPrice ? formatMoney(c.agreedPrice) : "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {days !== null && (
                      <span className={days < 0 ? "text-danger" : days < 30 ? "text-warning" : "text-muted-foreground"}>
                        {days < 0 ? `Vencido ${Math.abs(days)}d` : `${days}d`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.endDate ? formatDate(c.endDate) : "Sin fecha"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
