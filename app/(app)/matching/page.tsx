import Link from "next/link";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/matching/match-card";
import { LEAD_INTENT_LABEL } from "@/lib/labels";
import { formatMoneyCompact } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function MatchingPage() {
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;

  const leadsWithMatches = await prisma.lead.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { notIn: ["GANADO", "PERDIDO"] as any },
      matches: { some: { status: "PROPUESTO" as any } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      matches: {
        where: { status: "PROPUESTO" as any },
        orderBy: { score: "desc" },
        take: 5,
        include: {
          property: {
            select: { id: true, code: true, title: true, priceSale: true, priceRent: true, coverImageUrl: true, neighborhood: true, bedrooms: true, bathrooms: true, transactionType: true, category: true, status: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Matcher"
        title="Propiedad ↔ Lead"
        description="Top matches por score. Envíalos al lead con plantilla WhatsApp prellenada."
      />
      <div className="space-y-6">
        {leadsWithMatches.map((lead) => {
          const matches = (lead as any).matches as any[];
          if (!matches || matches.length === 0) return null;
          return (
            <section key={lead.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/leads/${lead.id}`} className="font-serif text-xl hover:text-gold">
                    {lead.firstName} {lead.lastName}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {LEAD_INTENT_LABEL[lead.intent as keyof typeof LEAD_INTENT_LABEL]} · {lead.desiredZones.slice(0, 3).join(", ")} · hasta{" "}
                    {formatMoneyCompact(lead.budgetMax)}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4" /> Enviar carrusel
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {matches.map((m: any) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          );
        })}
        {leadsWithMatches.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay matches pendientes. Ejecuta el cron de matching para generar sugerencias.</p>
        )}
      </div>
    </div>
  );
}
