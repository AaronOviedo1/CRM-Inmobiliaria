"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MAINTENANCE_CATEGORY_LABEL,
  MAINTENANCE_PRIORITY_LABEL,
  MAINTENANCE_PRIORITY_TONE,
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_STATUS_TONE,
} from "@/lib/labels";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

type Request = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date | string;
  estimatedCost?: any;
  actualCost?: any;
  paidByOwner?: boolean;
  paidByTenant?: boolean;
  ownerNotifiedAt?: Date | string | null;
  ownerApprovedAt?: Date | string | null;
  images?: string[];
  propertyId?: string | null;
  property?: { id: string; title: string; code: string } | null;
  reporter?: { firstName: string; lastName: string } | null;
  assignedTo?: { name: string } | null;
};

interface Props {
  requests: Request[];
  total: number;
}

export function MantenimientosClient({ requests, total }: Props) {
  const [selectedId, setSelectedId] = React.useState(requests[0]?.id);
  const selected = requests.find((m) => m.id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${total} solicitudes`}
        title="Mantenimientos"
        description="Inbox global. Prioriza urgencias y manda reporte al propietario."
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar" className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0" />
            <Button size="sm" variant="ghost"><Filter className="h-3 w-3" /></Button>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border">
            {requests.map((m) => (
              <li
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  "cursor-pointer p-4 transition-colors",
                  selectedId === m.id ? "bg-gold/5 border-l-2 border-gold" : "hover:bg-elevated"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-sm">{m.title}</p>
                  <StatusPill size="sm" tone={MAINTENANCE_PRIORITY_TONE[m.priority as keyof typeof MAINTENANCE_PRIORITY_TONE]}>
                    {MAINTENANCE_PRIORITY_LABEL[m.priority as keyof typeof MAINTENANCE_PRIORITY_LABEL]}
                  </StatusPill>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {MAINTENANCE_CATEGORY_LABEL[m.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]} · {m.property?.code}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusPill size="sm" tone={MAINTENANCE_STATUS_TONE[m.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
                    {MAINTENANCE_STATUS_LABEL[m.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
                  </StatusPill>
                  <span className="text-[10px] text-muted-foreground">{formatRelative(new Date(m.createdAt))}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {selected && <MaintenanceDetail request={selected} />}
      </div>
    </div>
  );
}

function MaintenanceDetail({ request }: { request: Request }) {
  const toN = (v: any) => v === null || v === undefined ? null : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-gold">
            {MAINTENANCE_CATEGORY_LABEL[request.category as keyof typeof MAINTENANCE_CATEGORY_LABEL]}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-medium">{request.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/propiedades/${request.propertyId}`} className="hover:text-gold">
              {request.property?.title}
            </Link>{" "}
            · Reportado por {request.reporter?.firstName} {request.reporter?.lastName}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <StatusPill tone={MAINTENANCE_STATUS_TONE[request.status as keyof typeof MAINTENANCE_STATUS_TONE]}>
            {MAINTENANCE_STATUS_LABEL[request.status as keyof typeof MAINTENANCE_STATUS_LABEL]}
          </StatusPill>
          <StatusPill tone={MAINTENANCE_PRIORITY_TONE[request.priority as keyof typeof MAINTENANCE_PRIORITY_TONE]}>
            {MAINTENANCE_PRIORITY_LABEL[request.priority as keyof typeof MAINTENANCE_PRIORITY_LABEL]}
          </StatusPill>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{request.description}</p>
      {(request.images ?? []).length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(request.images ?? []).map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-md border border-border">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <dl className="mt-6 grid grid-cols-2 gap-y-3 border-t border-border pt-4 text-sm">
        <dt className="text-muted-foreground">Costo estimado</dt>
        <dd>{toN(request.estimatedCost) !== null ? `$${toN(request.estimatedCost)?.toLocaleString("es-MX")}` : "—"}</dd>
        <dt className="text-muted-foreground">Costo real</dt>
        <dd>{toN(request.actualCost) !== null ? `$${toN(request.actualCost)?.toLocaleString("es-MX")}` : "—"}</dd>
        <dt className="text-muted-foreground">Paga propietario</dt>
        <dd>{request.paidByOwner ? "Sí" : "No"}</dd>
        <dt className="text-muted-foreground">Paga inquilino</dt>
        <dd>{request.paidByTenant ? "Sí" : "No"}</dd>
        <dt className="text-muted-foreground">Propietario notificado</dt>
        <dd>{request.ownerNotifiedAt ? formatRelative(new Date(request.ownerNotifiedAt)) : "—"}</dd>
        <dt className="text-muted-foreground">Propietario aprobó</dt>
        <dd>{request.ownerApprovedAt ? formatRelative(new Date(request.ownerApprovedAt)) : "Pendiente"}</dd>
      </dl>
      <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button>Cambiar estado</Button>
        <Button variant="outline">Notificar al propietario</Button>
        <Button variant="ghost">Asignar vendor</Button>
      </div>
    </div>
  );
}
