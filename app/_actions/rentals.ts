"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { validatePayment } from "@/lib/services/rental-schedule";
import { prisma } from "@/lib/prisma";
import {
  RentalCreateSchema,
  RentalUpdateSchema,
  RentalTerminateSchema,
  PaymentRegisterSchema,
} from "@/lib/validators/rental";

export async function createRentalAction(rawInput: unknown) {
  const u = await requireSession();
  const input = RentalCreateSchema.parse(rawInput);

  const rental = await withTenant(
    { organizationId: u.organizationId, userId: u.id },
    (db) =>
      db.rental.create({
        data: {
          organizationId: u.organizationId,
          ...(input as any),
          status: "ACTIVA",
        },
      }),
  );

  await prisma.property.update({
    where: { id: input.propertyId },
    data: { status: "RENTADA" },
  });

  revalidatePath("/rentas");
  return { ok: true, id: rental.id };
}

export async function updateRentalAction(rentalId: string, rawInput: unknown) {
  const u = await requireSession();
  const input = RentalUpdateSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.rental.update({ where: { id: rentalId }, data: input as any }),
  );

  revalidatePath(`/rentas/${rentalId}`);
  return { ok: true };
}

export async function terminateRentalAction(rawInput: unknown) {
  const u = await requireRole("ADMINISTRADOR");
  const input = RentalTerminateSchema.parse(rawInput);

  const rental = await prisma.rental.findFirst({
    where: { id: input.rentalId, organizationId: u.organizationId },
    include: { property: true },
  });
  if (!rental) return { ok: false, error: "NOT_FOUND" };

  await prisma.$transaction([
    prisma.rental.update({
      where: { id: input.rentalId },
      data: { status: "TERMINADA" },
    }),
    prisma.property.update({
      where: { id: rental.propertyId },
      data: { status: "DISPONIBLE" },
    }),
  ]);

  revalidatePath(`/rentas/${input.rentalId}`);
  revalidatePath("/rentas");
  return { ok: true };
}

export async function registerPaymentAction(rawInput: unknown) {
  const u = await requireSession();
  const input = PaymentRegisterSchema.parse(rawInput);

  const payment = await prisma.rentalPayment.findUnique({
    where: { id: input.paymentId },
    include: { rental: true },
  });
  if (!payment || payment.rental.organizationId !== u.organizationId) {
    return { ok: false, error: "NOT_FOUND" };
  }

  await validatePayment(input.paymentId, {
    amountPaid: input.amountPaid,
    paidAt: input.paidAt,
    paymentReference: input.paymentReference,
    receivedBy: input.receivedBy as any,
    notes: input.notes,
  });

  revalidatePath(`/rentas/${payment.rentalId}/pagos`);
  return { ok: true };
}

export async function validatePaymentAction(paymentId: string) {
  const u = await requireSession();

  const payment = await prisma.rentalPayment.findUnique({
    where: { id: paymentId },
    include: { rental: true },
  });
  if (!payment || payment.rental.organizationId !== u.organizationId) {
    return { ok: false, error: "NOT_FOUND" };
  }
  if (payment.status !== "PENDIENTE") {
    return { ok: false, error: "ALREADY_PROCESSED" };
  }

  await prisma.rentalPayment.update({
    where: { id: paymentId },
    data: { status: "PAGADO", paidAt: new Date() },
  });

  revalidatePath(`/rentas/${payment.rentalId}/pagos`);
  return { ok: true };
}
