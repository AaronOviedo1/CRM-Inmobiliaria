/// Cron de vencimiento de contratos.
///
/// Para cada contrato ACTIVO con endDate dentro del horizonte de `reminderDaysBeforeEnd`:
///   1. Cambia status a POR_VENCER.
///   2. Crea Task al agente asignado.
///   3. Envía WhatsApp/email al propietario con plantilla.
///
/// Idempotente: si la Task ya existe para este contrato, no crea una segunda.

import { prisma } from "../prisma";
import { sendTemplate } from "./whatsapp";
import { sendEmail, contractExpiringEmail } from "./email";
import { addDays, differenceInDays } from "date-fns";

export async function processContractExpiry(organizationId: string) {
  const horizon = addDays(new Date(), 60);
  const contracts = await prisma.propertyContract.findMany({
    where: {
      organizationId,
      status: "ACTIVO",
      endDate: { lte: horizon, gte: new Date() },
    },
    include: {
      property: true,
      owner: true,
      agent: true,
    },
  });

  let notified = 0;

  for (const c of contracts) {
    if (!c.endDate) continue;
    const daysLeft = differenceInDays(c.endDate, new Date());
    if (daysLeft > (c.reminderDaysBeforeEnd ?? 30)) continue;

    await prisma.propertyContract.update({
      where: { id: c.id },
      data: { status: "POR_VENCER" },
    });

    const existingTask = await prisma.task.findFirst({
      where: {
        organizationId,
        relatedPropertyId: c.propertyId,
        title: { contains: `contrato ${c.id}` },
        status: { notIn: ["COMPLETADA", "CANCELADA"] },
      },
    });

    if (!existingTask && c.agentId) {
      await prisma.task.create({
        data: {
          organizationId,
          title: `Contrato por vencer — ${c.property.title} (${daysLeft} días) contrato ${c.id}`,
          description: `El contrato de ${c.contractKind} sobre "${c.property.title}" vence en ${daysLeft} días. Coordinar renovación.`,
          assignedToId: c.agentId,
          createdById: c.agentId,
          relatedPropertyId: c.propertyId,
          dueAt: c.endDate,
          priority: daysLeft <= 7 ? "URGENTE" : daysLeft <= 14 ? "ALTA" : "MEDIA",
        },
      });
    }

    if (c.owner) {
      if (c.owner.whatsapp ?? c.owner.phone) {
        await sendTemplate({
          organizationId,
          toPhone: (c.owner.whatsapp ?? c.owner.phone)!,
          templateName: "vencimiento_contrato",
          variables: [
            `${c.owner.firstName}`,
            c.property.title,
            String(daysLeft),
          ],
        }).catch(() => {});
      }
      if (c.owner.email) {
        const content = contractExpiringEmail({
          ownerName: c.owner.firstName,
          propertyTitle: c.property.title,
          daysLeft,
        });
        await sendEmail({ to: c.owner.email, ...content }).catch(() => {});
      }
    }

    notified++;
  }

  return { processed: contracts.length, notified };
}

export async function renewContract(
  organizationId: string,
  contractId: string,
  newEndDate: Date,
  newPrice?: number,
) {
  const old = await prisma.propertyContract.findFirst({
    where: { id: contractId, organizationId },
  });
  if (!old) throw new Error("CONTRACT_NOT_FOUND");

  const [updated, newContract] = await prisma.$transaction([
    prisma.propertyContract.update({
      where: { id: contractId },
      data: { status: "RENOVADO" },
    }),
    prisma.propertyContract.create({
      data: {
        organizationId,
        propertyId: old.propertyId,
        contractKind: old.contractKind,
        status: "ACTIVO",
        startDate: new Date(),
        endDate: newEndDate,
        ownerId: old.ownerId,
        clientId: old.clientId,
        agentId: old.agentId,
        commissionPct: old.commissionPct,
        agreedPrice: newPrice ? newPrice : old.agreedPrice,
        depositAmount: old.depositAmount,
        reminderDaysBeforeEnd: old.reminderDaysBeforeEnd,
        notes: `Renovación del contrato ${old.id}`,
      },
    }),
  ]);

  return { oldContractId: updated.id, newContractId: newContract.id };
}
