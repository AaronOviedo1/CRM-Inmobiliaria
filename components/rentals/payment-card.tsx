"use client";

import { CheckCircle2, ExternalLink, MessageSquare } from "lucide-react";
import type { RentalPayment } from "@/lib/types";
import {
  RENTAL_PAYMENT_STATUS_LABEL,
  RENTAL_PAYMENT_STATUS_TONE,
} from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { formatDate, formatMoney, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PaymentCard({ payment }: { payment: RentalPayment }) {
  const overdue = payment.status === "VENCIDO";
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        overdue
          ? "border-danger/30 bg-danger/5"
          : payment.status === "PAGADO"
            ? "border-success/20 bg-success/5"
            : "border-border bg-surface"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {payment.periodMonth}
          </p>
          <p className="mt-1 font-serif text-xl">
            {formatMoney(payment.amountDue)}
          </p>
        </div>
        <StatusPill tone={RENTAL_PAYMENT_STATUS_TONE[payment.status]}>
          {RENTAL_PAYMENT_STATUS_LABEL[payment.status]}
        </StatusPill>
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Vence</span>
          <span>{formatDate(payment.dueDate)}</span>
        </div>
        {payment.paidAt && (
          <div className="flex justify-between">
            <span>Pagado</span>
            <span className="text-success">
              {formatRelative(payment.paidAt)}
            </span>
          </div>
        )}
        {payment.paymentReference && (
          <div className="flex justify-between">
            <span>Ref</span>
            <span>{payment.paymentReference}</span>
          </div>
        )}
        {payment.remindersSentCount > 0 && (
          <div className="flex justify-between">
            <span>Recordatorios</span>
            <span>{payment.remindersSentCount}</span>
          </div>
        )}
      </div>

      {payment.status !== "PAGADO" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              toast.success("Registrado como pagado");
              // TODO(backend): crear RentalPayment.status = PAGADO.
            }}
          >
            <CheckCircle2 className="h-3 w-3" /> Registrar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              toast.info("Recordatorio enviado");
              // TODO(backend): plantilla WhatsApp.
            }}
          >
            <MessageSquare className="h-3 w-3" /> Recordar
          </Button>
        </div>
      )}
      {payment.status === "PAGADO" && (payment as any).receiptUrl && (
        <Button size="sm" variant="ghost" className="mt-3 w-full">
          <ExternalLink className="h-3 w-3" /> Ver comprobante
        </Button>
      )}
    </div>
  );
}
