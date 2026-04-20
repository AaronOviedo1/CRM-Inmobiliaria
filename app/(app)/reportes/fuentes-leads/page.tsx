import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { LEAD_SOURCE_LABEL } from "@/lib/labels";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function LeadSourcesReport() {
  const ctx = await requireTenantContext();
  const grouped = await prisma.lead.groupBy({
    by: ["source"],
    where: { organizationId: ctx.organizationId, deletedAt: null },
    _count: true,
    orderBy: { _count: { source: "desc" } },
  });
  const total = grouped.reduce((a, g) => a + g._count, 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/reportes"><ArrowLeft className="h-4 w-4" /> Reportes</Link>
      </Button>
      <PageHeader title="Leads por fuente" description="Invierte donde ya te funciona." />
      <div className="rounded-lg border border-border bg-surface p-6 space-y-3">
        {grouped.map(({ source, _count: n }) => {
          const pct = total > 0 ? (n / total) * 100 : 0;
          return (
            <div key={source}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">
                  {LEAD_SOURCE_LABEL[source as keyof typeof LEAD_SOURCE_LABEL] ?? source}
                </span>
                <span className="text-muted-foreground">
                  {n} · {pct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gradient-to-r from-gold to-gold-hover" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {grouped.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay datos de fuentes de leads aún.</p>
        )}
      </div>
    </div>
  );
}
