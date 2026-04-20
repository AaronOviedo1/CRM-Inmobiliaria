import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import {
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
  MAINTENANCE_CATEGORY_LABEL,
} from "@/lib/labels";
import { formatRelative } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function RentalMaintenancePage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const r = await prisma.rental.findFirst({
    where: { id, organizationId: ctx.organizationId },
    select: { id: true, property: { select: { title: true } } },
  });
  if (!r) notFound();

  const list = await prisma.maintenanceRequest.findMany({
    where: { rentalId: r.id, organizationId: ctx.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/rentas/${r.id}`}><ArrowLeft className="h-4 w-4" /> {r.property?.title}</Link>
      </Button>
      <PageHeader title="Mantenimientos de la renta" />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {list.map((m) => (
          <li key={m.id} className="flex items-center gap-3 p-4">
            <Wrench className="h-4 w-4 text-gold shrink-0" />
            <div className="flex-1 min-w-0">
              <Link href={`/mantenimientos/${m.id}`} className="font-medium hover:text-gold">
                {m.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {MAINTENANCE_CATEGORY_LABEL[m.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]} · {formatRelative(m.createdAt)}
              </p>
            </div>
            <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
              {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
            </StatusPill>
          </li>
        ))}
        {list.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">Sin solicitudes de mantenimiento.</li>
        )}
      </ul>
    </div>
  );
}
