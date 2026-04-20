import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  LEAD_INTENT_LABEL,
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_TONE,
} from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatMoneyCompact, formatRelative } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { listLeads } from "@/lib/repos/leads";
import { LeadFiltersSchema } from "@/lib/validators/lead";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LeadsTablePage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const filters = LeadFiltersSchema.parse({ q: raw.q, status: raw.status, page: raw.page ? Number(raw.page) : 1, pageSize: 100 });
  const { rows: leads, total } = await listLeads(ctx, filters);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/leads"><ArrowLeft className="h-4 w-4" /> Vista Kanban</Link>
      </Button>
      <PageHeader
        title="Leads · Tabla"
        eyebrow={`${total} leads`}
        description="Vista densa para bulk-actions y export."
        actions={<Button asChild><Link href="/leads/nuevo"><Plus className="h-4 w-4" /> Nuevo</Link></Button>}
      />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Intent</th>
              <th className="px-4 py-3 text-left">Fuente</th>
              <th className="px-4 py-3 text-left">Zonas</th>
              <th className="px-4 py-3 text-right">Presupuesto máx.</th>
              <th className="px-4 py-3 text-left">Agente</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Último contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {leads.map((l) => (
              <tr key={l.id} className="group hover:bg-elevated transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/leads/${l.id}`} className="font-medium hover:text-gold">
                    {l.firstName} {l.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {LEAD_INTENT_LABEL[l.intent as keyof typeof LEAD_INTENT_LABEL]}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {LEAD_SOURCE_LABEL[l.source as keyof typeof LEAD_SOURCE_LABEL]}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {l.desiredZones.slice(0, 2).join(", ")}
                </td>
                <td className="px-4 py-3 text-right text-gold">
                  {formatMoneyCompact(l.budgetMax, l.currency as any)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {(l as any).assignedAgent?.name?.split(" ")[0]}
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={LEAD_STATUS_TONE[l.status as keyof typeof LEAD_STATUS_TONE]}>
                    {LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL]}
                  </StatusPill>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatRelative(l.lastContactAt ?? l.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
