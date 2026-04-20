import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { CLIENT_TYPE_LABEL } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { formatMoneyCompact, formatPhone, formatRelative } from "@/lib/format";
import { Plus } from "lucide-react";
import { requireTenantContext } from "@/lib/auth/session";
import { listClients } from "@/lib/repos/entities";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ClientesPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const { rows, total } = await listClients(ctx, { q: raw.q, page: raw.page ? Number(raw.page) : 1 });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${total} clientes`} title="Clientes" description="Leads convertidos + cartera histórica." actions={<Button><Plus className="h-4 w-4" /> Nuevo cliente</Button>} />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Contacto</th>
              <th className="px-4 py-3 text-right">LTV</th>
              <th className="px-4 py-3 text-left">Cliente desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-elevated">
                <td className="px-4 py-3"><Link href={`/clientes/${c.id}`} className="font-medium hover:text-gold">{c.firstName} {c.lastName}</Link></td>
                <td className="px-4 py-3 text-muted-foreground">{CLIENT_TYPE_LABEL[(c as any).type as keyof typeof CLIENT_TYPE_LABEL] ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.phone ? formatPhone(c.phone) : c.email ?? "—"}</td>
                <td className="px-4 py-3 text-right text-gold">{formatMoneyCompact((c as any).lifetimeValueMxn)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
