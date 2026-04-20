import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import {
  RENTAL_PAYMENT_STATUS_LABEL,
  RENTAL_PAYMENT_STATUS_TONE,
} from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatMoneyCompact } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function RentalCalendarPage() {
  const ctx = await requireTenantContext();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

  const payments = await prisma.rentalPayment.findMany({
    where: {
      rental: { organizationId: ctx.organizationId },
      dueDate: { gte: firstDay, lte: lastDay },
    },
    orderBy: { dueDate: "asc" },
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  const byDay = new Map<number, typeof payments>();
  payments.forEach((p) => {
    const d = p.dueDate.getDate();
    const arr = byDay.get(d) ?? [];
    arr.push(p);
    byDay.set(d, arr);
  });

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const monthName = firstDay.toLocaleString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/rentas"><ArrowLeft className="h-4 w-4" /> Volver a rentas</Link>
      </Button>
      <PageHeader
        eyebrow="Calendario global"
        title={monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        description="Vencimientos del portafolio. Color-coded por estado."
      />
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, i) => {
            const dayPayments = cell.day ? byDay.get(cell.day) ?? [] : [];
            return (
              <div
                key={i}
                className={`min-h-[110px] rounded-md border p-2 ${
                  cell.day ? "border-border bg-elevated" : "border-transparent"
                }`}
              >
                {cell.day && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{cell.day}</span>
                      {dayPayments.length > 0 && (
                        <span className="rounded-full bg-gold-faint px-1.5 py-0.5 text-[9px] text-gold">
                          {dayPayments.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayPayments.slice(0, 2).map((p) => (
                        <div key={p.id} className="text-[9px]">
                          <StatusPill size="sm" tone={RENTAL_PAYMENT_STATUS_TONE[p.status as keyof typeof RENTAL_PAYMENT_STATUS_TONE]}>
                            {formatMoneyCompact(p.amountDue)}
                          </StatusPill>
                        </div>
                      ))}
                      {dayPayments.length > 2 && (
                        <p className="text-[9px] text-muted-foreground">+{dayPayments.length - 2} más</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        Leyenda:
        {Object.entries(RENTAL_PAYMENT_STATUS_LABEL).map(([k, v]) => (
          <StatusPill key={k} size="sm" tone={RENTAL_PAYMENT_STATUS_TONE[k as keyof typeof RENTAL_PAYMENT_STATUS_TONE]}>
            {v}
          </StatusPill>
        ))}
      </div>
    </div>
  );
}
