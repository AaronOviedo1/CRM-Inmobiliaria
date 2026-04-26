import { notFound } from "next/navigation";
import Link from "next/link";
import { PropertyHero } from "@/components/property/property-hero";
import { PropertyDetailTabs } from "@/components/property/property-tabs";
import { ImageReorderDialog } from "@/components/property/image-reorder-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Eye, ExternalLink } from "lucide-react";
import { requireTenantContext } from "@/lib/auth/session";
import { getPropertyById } from "@/lib/repos/properties";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;

  const [property, viewings, offers, matches, leads, agents] = await Promise.all([
    getPropertyById(ctx, id),
    prisma.viewing.findMany({ where: { organizationId: orgId, propertyId: id }, orderBy: { scheduledAt: "desc" }, take: 20, include: { lead: true, client: true, agent: { select: { name: true } } } }),
    prisma.offer.findMany({ where: { organizationId: orgId, propertyId: id }, orderBy: { createdAt: "desc" }, take: 20, include: { lead: true, client: true, agent: { select: { name: true } } } }),
    prisma.matchSuggestion.findMany({ where: { organizationId: orgId, propertyId: id }, orderBy: { score: "desc" }, take: 10, include: { lead: true } }),
    prisma.lead.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 500,
    }),
    prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: { in: ["ADMINISTRADOR", "ASESOR"] as any[] },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/propiedades"><ArrowLeft className="h-4 w-4" /> Volver al listado</Link>
        </Button>
        <div className="flex items-center gap-2">
          <ImageReorderDialog
            propertyId={property.id}
            images={property.images.map((img) => ({
              id: img.id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
            }))}
            size="sm"
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/p/${property.slug}`} target="_blank">
              <Eye className="h-4 w-4" /> Vista pública<ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/propiedades/${property.id}/editar`}>
              <Edit3 className="h-4 w-4" /> Editar
            </Link>
          </Button>
        </div>
      </div>
      <PropertyHero property={property as any} leads={leads} />
      <PropertyDetailTabs
        property={property as any}
        viewings={viewings as any}
        offers={offers as any}
        matches={matches as any}
        documents={property.documents as any}
        leads={leads}
        agents={agents}
        currentUserId={ctx.userId}
      />
    </div>
  );
}
