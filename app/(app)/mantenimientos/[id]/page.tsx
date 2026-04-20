import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import {
  MAINTENANCE_CATEGORY_LABEL,
  MAINTENANCE_PRIORITY_LABEL,
  MAINTENANCE_PRIORITY_TONE,
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { getMaintenanceById } from "@/lib/repos/entities";

interface Props { params: Promise<{ id: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function MaintenanceDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const m = await getMaintenanceById(ctx, id);
  if (!m) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/mantenimientos"><ArrowLeft className="h-4 w-4" /> Inbox</Link>
      </Button>
      <PageHeader
        eyebrow={MAINTENANCE_CATEGORY_LABEL[m.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]}
        title={m.title}
        description={`Reportado el ${formatDate(m.createdAt)} por ${m.reporter?.firstName ?? "inquilino"}`}
        actions={
          <>
            <StatusPill tone={MAINTENANCE_PRIORITY_TONE[m.priority as keyof typeof MAINTENANCE_PRIORITY_TONE]}>
              {MAINTENANCE_PRIORITY_LABEL[m.priority as keyof typeof MAINTENANCE_PRIORITY_LABEL]}
            </StatusPill>
            <StatusPill tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
              {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
            </StatusPill>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-6">
            <h4 className="font-serif text-xl">Descripción</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {m.description}
            </p>
          </section>
          {m.images.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-6">
              <h4 className="font-serif text-xl">Fotos del reporte</h4>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {m.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="aspect-square w-full object-cover rounded-md border border-border"
                    alt=""
                  />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <Button className="w-full">Notificar al propietario</Button>
          <Button className="w-full" variant="outline">Cambiar estado</Button>
          <Button className="w-full" variant="ghost">Agregar nota interna</Button>

          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Split de costos</p>
            <p className="mt-2">Propietario: {m.paidByOwner ? "Sí" : "No"}</p>
            <p>Inquilino: {m.paidByTenant ? "Sí" : "No"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Estimado: ${m.estimatedCost ? toN(m.estimatedCost).toLocaleString("es-MX") : "—"}
              <br />
              Real: ${m.actualCost ? toN(m.actualCost).toLocaleString("es-MX") : "—"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
