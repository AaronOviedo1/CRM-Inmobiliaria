import Link from "next/link";
import { Calendar, MessageSquare, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { VIEWING_STATUS_LABEL, VIEWING_STATUS_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatDate, formatTime } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { listViewings } from "@/lib/repos/entities";
import { addDays } from "date-fns";

export default async function VisitasPage() {
  const ctx = await requireTenantContext();
  const { rows: viewings, total } = await listViewings(ctx, {
    from: new Date(),
    to: addDays(new Date(), 30),
    pageSize: 100,
  });

  const byDay = new Map<string, typeof viewings>();
  const sorted = [...viewings].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  sorted.forEach((v) => {
    const key = new Date(v.scheduledAt).toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(v);
    byDay.set(key, arr);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${total} visitas`}
        title="Agenda global"
        description="Próximas 30 días. Drag para reagendar."
        actions={<Button><Plus className="h-4 w-4" /> Agendar visita</Button>}
      />
      <div className="space-y-6">
        {Array.from(byDay.entries()).map(([day, views]) => (
          <section key={day} className="rounded-lg border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-xl">{formatDate(new Date(day))}</h3>
              <span className="text-xs text-muted-foreground">{views.length} visita{views.length === 1 ? "" : "s"}</span>
            </div>
            <ul className="space-y-2">
              {views.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-md border border-border bg-elevated p-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md border border-gold/30 bg-gold-faint text-gold">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs font-medium">{formatTime(new Date(v.scheduledAt))}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/propiedades/${v.propertyId}`} className="truncate block text-sm font-medium hover:text-gold">
                      {(v as any).property?.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {(v as any).lead?.firstName} {(v as any).lead?.lastName} · Agente {(v as any).agent?.name?.split(" ")[0]}
                    </p>
                  </div>
                  <StatusPill tone={VIEWING_STATUS_TONE[v.status as keyof typeof VIEWING_STATUS_TONE]}>
                    {VIEWING_STATUS_LABEL[v.status as keyof typeof VIEWING_STATUS_LABEL]}
                  </StatusPill>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-3 w-3" /> Confirmar
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {viewings.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay visitas programadas en los próximos 30 días.</p>
        )}
      </div>
    </div>
  );
}
