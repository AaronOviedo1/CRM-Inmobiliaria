/// Lógica de rentas (tracking, no procesamiento bancario).
///
/// Cron diario 9am: genera RentalPayment del mes para cada Rental ACTIVA.
/// Cron diario: detecta pagos próximos/vencidos y envía recordatorios.

import { prisma } from "../prisma";
import { sendTemplate } from "./whatsapp";
import { sendEmail } from "./email";
import { format, addMonths, startOfMonth, getDate } from "date-fns";

/** Genera el RentalPayment del mes actual para una Rental ACTIVA si no existe. */
export async function ensurePaymentForMonth(
  rentalId: string,
  year: number,
  month: number,
): Promise<{ created: boolean; paymentId: string }> {
  const periodMonth = `${year}-${String(month).padStart(2, "0")}`;
  const existing = await prisma.rentalPayment.findUnique({
    where: { rentalId_periodMonth: { rentalId, periodMonth } },
  });
  if (existing) return { created: false, paymentId: existing.id };

  const rental = await prisma.rental.findUniqueOrThrow({ where: { id: rentalId } });
  const dueDate = new Date(year, month - 1, rental.paymentDueDay);

  const payment = await prisma.rentalPayment.create({
    data: {
      rentalId,
      periodMonth,
      dueDate,
      amountDue: rental.monthlyRent,
    },
  });
  return { created: true, paymentId: payment.id };
}

/** Corre para todas las rentas activas de una org. Llamado desde cron. */
export async function generateCurrentMonthPayments(organizationId: string) {
  const rentals = await prisma.rental.findMany({
    where: { organizationId, status: { in: ["ACTIVA", "POR_VENCER"] } },
  });
  const now = new Date();
  const results = await Promise.allSettled(
    rentals.map((r) =>
      ensurePaymentForMonth(r.id, now.getFullYear(), now.getMonth() + 1),
    ),
  );
  const created = results.filter(
    (r) => r.status === "fulfilled" && r.value.created,
  ).length;
  return { processed: rentals.length, created };
}

/**
 * Detecta pagos próximos a vencer y envía recordatorios.
 * Política:
 *   - 3 días antes: primer recordatorio.
 *   - Día del vencimiento (daysOverdue = 0): segundo.
 *   - +3 días vencido: marca VENCIDO + notifica a agencia y propietario.
 */
export async function processPaymentReminders(organizationId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingPayments = await prisma.rentalPayment.findMany({
    where: {
      status: "PENDIENTE",
      rental: { organizationId, status: "ACTIVA" },
    },
    include: {
      rental: {
        include: {
          tenant: true,
          owner: true,
          agent: true,
          property: { select: { title: true, code: true } },
          organization: { select: { id: true } },
        },
      },
    },
  });

  let reminded = 0;
  let overdue = 0;

  for (const payment of pendingPayments) {
    const due = new Date(payment.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
    );
    const r = payment.rental;
    const tenantPhone = r.tenant.whatsapp ?? r.tenant.phone ?? null;
    const tenantEmail = r.tenant.email ?? null;

    if (diffDays >= 3) {
      // vencido +3 días → marcar VENCIDO y notificar
      await prisma.rentalPayment.update({
        where: { id: payment.id },
        data: { status: "VENCIDO" },
      });
      // notificar agente asignado
      if (r.agent?.phone) {
        await sendTemplate({
          organizationId: r.organization.id,
          toPhone: r.agent.phone,
          templateName: "pago_vencido_agente",
          variables: [
            `${r.tenant.firstName} ${r.tenant.lastName}`,
            r.property.title,
            payment.periodMonth,
          ],
        }).catch(() => {});
      }
      overdue++;
    } else if (
      (diffDays <= -3 && diffDays >= -3) ||
      diffDays === 0
    ) {
      // recordatorio al inquilino
      if (tenantPhone) {
        await sendTemplate({
          organizationId: r.organization.id,
          toPhone: tenantPhone,
          templateName: "recordatorio_pago_renta",
          variables: [
            r.tenant.firstName,
            payment.amountDue.toString(),
            format(due, "dd/MM/yyyy"),
          ],
        }).catch(() => {});
      }
      if (tenantEmail) {
        await sendEmail({
          to: tenantEmail,
          subject: `Recordatorio de pago — ${r.property.title}`,
          text: `Hola ${r.tenant.firstName},\n\nTu renta de $${payment.amountDue} MXN vence el ${format(due, "dd/MM/yyyy")}.\n\nPor favor completa tu pago y confirma con tu agente.`,
        }).catch(() => {});
      }
      await prisma.rentalPayment.update({
        where: { id: payment.id },
        data: { remindersSentCount: { increment: 1 } },
      });
      reminded++;
    }
  }

  return { reminded, overdue };
}

/** Marca un pago como PAGADO (validado por la agencia). */
export async function validatePayment(
  paymentId: string,
  input: {
    amountPaid: number;
    paidAt?: Date;
    paymentReference?: string;
    receivedBy?: "DIRECTO_AL_PROPIETARIO" | "VIA_AGENCIA";
    notes?: string;
  },
) {
  return prisma.rentalPayment.update({
    where: { id: paymentId },
    data: {
      status: "PAGADO",
      amountPaid: input.amountPaid,
      paidAt: input.paidAt ?? new Date(),
      paymentReference: input.paymentReference,
      receivedBy: input.receivedBy ?? "DIRECTO_AL_PROPIETARIO",
      notes: input.notes,
    },
  });
}
