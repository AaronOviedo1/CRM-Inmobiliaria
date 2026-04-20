import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { formatMoney, formatRelative } from "@/lib/format";
import { OFFER_STATUS_LABEL, OFFER_STATUS_TONE, OFFER_KIND_LABEL } from "@/lib/labels";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function PropertyOffersPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const property = await prisma.property.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    select: { id: true, title: true },
  });
  if (!property) notFound();

  const offers = await prisma.offer.findMany({
    where: { propertyId: property.id, organizationId: ctx.organizationId },
    include: {
      lead: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/propiedades/${property.id}`}>
          <ArrowLeft className="h-4 w-4" /> {property.title}
        </Link>
      </Button>
      <PageHeader title="Ofertas recibidas" />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {offers.map((o) => (
          <li key={o.id} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-serif text-xl">
                {formatMoney(toN(o.offeredAmount), o.currency as any)}
              </p>
              <p className="text-xs text-muted-foreground">
                {OFFER_KIND_LABEL[o.offerKind as keyof typeof OFFER_KIND_LABEL]} · {o.lead?.firstName} {o.lead?.lastName} · {formatRelative(o.createdAt)}
              </p>
            </div>
            <StatusPill tone={OFFER_STATUS_TONE[o.status as keyof typeof OFFER_STATUS_TONE]}>
              {OFFER_STATUS_LABEL[o.status as keyof typeof OFFER_STATUS_LABEL]}
            </StatusPill>
          </li>
        ))}
        {offers.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">Sin ofertas.</li>
        )}
      </ul>
    </div>
  );
}
