"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { sendTemplate } from "@/lib/services/whatsapp";
import { prisma } from "@/lib/prisma";
import {
  MaintenanceCreateSchema,
  MaintenanceUpdateSchema,
} from "@/lib/validators/maintenance";

export async function createMaintenanceAction(rawInput: unknown) {
  const u = await requireSession();
  const input = MaintenanceCreateSchema.parse(rawInput);

  const rental = await prisma.rental.findFirst({
    where: { id: input.rentalId, organizationId: u.organizationId },
  });
  if (!rental) return { ok: false, error: "NOT_FOUND" };

  const req = await withTenant(
    { organizationId: u.organizationId, userId: u.id },
    (db) =>
      db.maintenanceRequest.create({
        data: {
          organizationId: u.organizationId,
          rentalId: input.rentalId,
          propertyId: rental.propertyId,
          reportedByClientId: rental.tenantClientId,
          title: input.title,
          description: input.description,
          category: input.category as any,
          priority: (input.priority ?? "MEDIA") as any,
          images: input.images ?? [],
          estimatedCost: input.estimatedCost,
        },
      }),
  );

  revalidatePath(`/rentas/${input.rentalId}/mantenimientos`);
  revalidatePath("/mantenimientos");
  return { ok: true, id: req.id };
}

export async function updateMaintenanceAction(rawInput: unknown) {
  const u = await requireSession();
  const input = MaintenanceUpdateSchema.parse(rawInput);
  const { requestId, ...rest } = input;

  const req = await prisma.maintenanceRequest.findFirst({
    where: { id: requestId, organizationId: u.organizationId },
  });
  if (!req) return { ok: false, error: "NOT_FOUND" };

  const updated = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      ...(rest as any),
      resolvedAt:
        rest.status === "COMPLETADO" || rest.status === "CERRADO"
          ? new Date()
          : undefined,
    },
  });

  revalidatePath(`/rentas/${req.rentalId}/mantenimientos`);
  return { ok: true };
}

export async function notifyOwnerForApprovalAction(requestId: string) {
  const u = await requireSession();

  const req = await prisma.maintenanceRequest.findFirst({
    where: { id: requestId, organizationId: u.organizationId },
    include: {
      rental: { include: { owner: true } },
      property: { select: { title: true } },
    },
  });
  if (!req) return { ok: false, error: "NOT_FOUND" };

  const ownerPhone =
    req.rental.owner.whatsapp ?? req.rental.owner.phone ?? null;
  if (!ownerPhone) return { ok: false, error: "NO_PHONE" };

  await sendTemplate({
    organizationId: u.organizationId,
    toPhone: ownerPhone,
    templateName: "solicitud_mantenimiento_recibida",
    variables: [
      req.rental.owner.firstName,
      req.property.title,
      req.title,
      req.priority,
      req.estimatedCost ? `$${req.estimatedCost} MXN` : "por determinar",
    ],
  });

  await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { ownerNotifiedAt: new Date(), status: "EN_REVISION" },
  });

  revalidatePath(`/mantenimientos/${requestId}`);
  return { ok: true };
}
