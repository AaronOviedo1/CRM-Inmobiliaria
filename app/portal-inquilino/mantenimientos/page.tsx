import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import {
  MAINTENANCE_CATEGORY_LABEL,
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

export default async function TenantMaintenancePage() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-inquilino/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "TENANT") redirect("/portal-inquilino/login");

  const rental = await prisma.rental.findFirst({
    where: { tenantClientId: session.subjectId, organizationId: session.organizationId },
    select: { id: true },
  });

  const list = rental ? await prisma.maintenanceRequest.findMany({
    where: { rentalId: rental.id, organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  }) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis solicitudes"
        actions={
          <Button asChild>
            <Link href="/portal-inquilino/reportar-mantenimiento">
              <Plus className="h-4 w-4" /> Nueva solicitud
            </Link>
          </Button>
        }
      />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {list.map((m) => (
          <li key={m.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{m.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {MAINTENANCE_CATEGORY_LABEL[m.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]} · Reportado {formatDate(m.createdAt)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.description}</p>
            </div>
            <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
              {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
            </StatusPill>
          </li>
        ))}
        {list.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">
            Sin solicitudes. Todo en orden.
          </li>
        )}
      </ul>
    </div>
  );
}
