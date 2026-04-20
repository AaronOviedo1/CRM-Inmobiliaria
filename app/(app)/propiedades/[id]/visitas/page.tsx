import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { formatDateTime } from "@/lib/format";
import { VIEWING_STATUS_LABEL, VIEWING_STATUS_TONE } from "@/lib/labels";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function PropertyViewingsPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const property = await prisma.property.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    select: { id: true, title: true },
  });
  if (!property) notFound();

  const viewings = await prisma.viewing.findMany({
    where: { propertyId: property.id, organizationId: ctx.organizationId },
    include: {
      lead: { select: { id: true, firstName: true, lastName: true } },
      agent: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/propiedades/${property.id}`}>
          <ArrowLeft className="h-4 w-4" /> {property.title}
        </Link>
      </Button>
      <PageHeader title="Visitas agendadas" />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {viewings.map((v) => (
          <li key={v.id} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {v.lead?.firstName} {v.lead?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(v.scheduledAt)} · {v.agent?.name}
              </p>
            </div>
            <StatusPill tone={VIEWING_STATUS_TONE[v.status as keyof typeof VIEWING_STATUS_TONE]}>
              {VIEWING_STATUS_LABEL[v.status as keyof typeof VIEWING_STATUS_LABEL]}
            </StatusPill>
          </li>
        ))}
        {viewings.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">Sin visitas registradas.</li>
        )}
      </ul>
    </div>
  );
}
