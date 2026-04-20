import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { LEAD_KANBAN_ORDER } from "@/lib/types";
import { LEAD_STATUS_LABEL } from "@/lib/labels";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function ConversionFunnelPage() {
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;

  const counts = await Promise.all(
    LEAD_KANBAN_ORDER.map(async (status) => ({
      status,
      count: await prisma.lead.count({ where: { organizationId: orgId, deletedAt: null, status: status as any } }),
    }))
  );
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/reportes"><ArrowLeft className="h-4 w-4" /> Reportes</Link>
      </Button>
      <PageHeader title="Funnel de conversión" description="Todo el embudo, del primer contacto al cierre." />
      <div className="rounded-lg border border-border bg-surface p-6 space-y-2">
        {counts.map((c, i) => {
          const width = 30 + ((c.count / max) * 70);
          return (
            <div key={c.status} className="flex items-center gap-3">
              <span className="w-48 text-xs text-muted-foreground">
                {i + 1}. {LEAD_STATUS_LABEL[c.status as keyof typeof LEAD_STATUS_LABEL]}
              </span>
              <div
                className="relative h-10 rounded-md border border-gold/20 bg-gradient-to-r from-gold/20 to-gold-faint"
                style={{ width: `${width}%` }}
              >
                <span className="absolute inset-0 flex items-center justify-end pr-3 font-serif text-lg text-foreground">
                  {c.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
