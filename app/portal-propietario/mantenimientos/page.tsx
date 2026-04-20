import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import {
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
  MAINTENANCE_PRIORITY_LABEL,
  MAINTENANCE_PRIORITY_TONE,
  MAINTENANCE_CATEGORY_LABEL,
} from "@/lib/labels";
import { formatMoney, formatRelative } from "@/lib/format";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function OwnerMaintenancePage() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-propietario/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "OWNER") redirect("/portal-propietario/login");

  const myMaint = await prisma.maintenanceRequest.findMany({
    where: {
      organizationId: session.organizationId,
      property: { ownerId: session.subjectId },
    },
    include: { property: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mantenimientos"
        description="Solicitudes reportadas por tus inquilinos. Aprueba presupuestos desde aquí."
      />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {myMaint.map((m) => (
          <li key={m.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{m.title}</p>
                <StatusPill tone={MAINTENANCE_PRIORITY_TONE[m.priority as keyof typeof MAINTENANCE_PRIORITY_TONE]} size="sm">
                  {MAINTENANCE_PRIORITY_LABEL[m.priority as keyof typeof MAINTENANCE_PRIORITY_LABEL]}
                </StatusPill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {MAINTENANCE_CATEGORY_LABEL[m.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]} · {m.property?.title} · {formatRelative(m.createdAt)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{m.description}</p>
              {m.estimatedCost && (
                <p className="mt-2 text-xs">
                  Presupuesto estimado:{" "}
                  <span className="text-gold">{formatMoney(toN(m.estimatedCost))}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-stretch gap-2 md:items-end">
              <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
                {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
              </StatusPill>
              {(m.status === "EN_REVISION" || m.status === "REPORTADO") && (
                <div className="flex gap-2">
                  <Button size="sm">Aprobar</Button>
                  <Button size="sm" variant="ghost">Rechazar</Button>
                </div>
              )}
            </div>
          </li>
        ))}
        {myMaint.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">Sin mantenimientos.</li>
        )}
      </ul>
    </div>
  );
}
