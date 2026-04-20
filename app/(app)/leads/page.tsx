import Link from "next/link";
import { Plus, Table as TableIcon } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { LeadKanban } from "@/components/leads/lead-kanban";
import { requireTenantContext } from "@/lib/auth/session";
import { listLeads } from "@/lib/repos/leads";
import { LeadFiltersSchema } from "@/lib/validators/lead";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const filters = LeadFiltersSchema.parse({ q: raw.q, status: raw.status, pageSize: 100 });
  const { rows: leads, total } = await listLeads(ctx, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${total} leads activos`}
        title="Leads"
        description="Arrastra tarjetas entre columnas. Rojo = follow-up vencido."
        actions={
          <>
            <Button variant="outline" asChild><Link href="/leads/tabla"><TableIcon className="h-4 w-4" /> Vista tabla</Link></Button>
            <Button asChild><Link href="/leads/nuevo"><Plus className="h-4 w-4" /> Nuevo lead</Link></Button>
          </>
        }
      />
      <LeadKanban leads={leads as any} />
    </div>
  );
}
