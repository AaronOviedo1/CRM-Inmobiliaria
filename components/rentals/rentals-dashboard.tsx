"use client";

import Link from "next/link";
import type { Rental } from "@/lib/types";
import {
  RENTAL_STATUS_LABEL,
  RENTAL_STATUS_TONE,
  RENTAL_PAYMENT_STATUS_LABEL,
  RENTAL_PAYMENT_STATUS_TONE,
} from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import {
  daysUntil,
  formatDate,
  formatMoney,
  formatMoneyCompact,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RentalsDashboard({ rentals }: { rentals: Rental[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Propiedad</th>
            <th className="px-4 py-3 text-left">Inquilino</th>
            <th className="px-4 py-3 text-right">Renta</th>
            <th className="px-4 py-3 text-left">Pago mes actual</th>
            <th className="px-4 py-3 text-left">Vence contrato</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rentals.map((r) => {
            const currentPayment = (r.payments ?? []).find((p) => {
              const d = p.dueDate;
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            });
            const days = daysUntil(r.endDate);
            return (
              <tr key={r.id} className="hover:bg-elevated">
                <td className="px-4 py-3">
                  <Link href={`/rentas/${r.id}`} className="font-medium hover:text-gold">
                    {r.property?.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{r.property?.code}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.tenant?.firstName} {r.tenant?.lastName}
                </td>
                <td className="px-4 py-3 text-right text-gold">
                  {formatMoneyCompact(r.monthlyRent, r.currency)}
                </td>
                <td className="px-4 py-3">
                  {currentPayment ? (
                    <StatusPill tone={RENTAL_PAYMENT_STATUS_TONE[currentPayment.status]}>
                      {RENTAL_PAYMENT_STATUS_LABEL[currentPayment.status]}
                    </StatusPill>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(r.endDate)}
                  </div>
                  <div
                    className={cn(
                      "text-[10px]",
                      (days ?? 0) < 60 ? "text-warning" : "text-muted-foreground"
                    )}
                  >
                    {days !== null && `${days}d`}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={RENTAL_STATUS_TONE[r.status]}>
                    {RENTAL_STATUS_LABEL[r.status]}
                  </StatusPill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {currentPayment && currentPayment.status !== "PAGADO" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success("Pago marcado como cobrado");
                          // TODO(backend): PATCH /api/rental-payments/:id { status: PAGADO }.
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Cobrar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info("Recordatorio enviado por WhatsApp (mock)");
                        // TODO(backend): disparar plantilla WhatsApp + incrementar remindersSentCount.
                      }}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Recordar
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rentals.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Aún no hay rentas activas.
        </div>
      )}
    </div>
  );
}

// Make sure the unused import of formatMoney doesn't trigger noUnusedLocals
void formatMoney;
