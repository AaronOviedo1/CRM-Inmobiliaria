"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { agentHasConflict } from "@/lib/repos/entities";
import { sendTemplate } from "@/lib/services/whatsapp";
import { prisma } from "@/lib/prisma";
import {
  ViewingScheduleSchema,
  ViewingUpdateSchema,
} from "@/lib/validators/viewing";

export async function scheduleViewingAction(rawInput: unknown) {
  const u = await requireSession();
  const input = ViewingScheduleSchema.parse(rawInput);

  const hasConflict = await agentHasConflict(
    { organizationId: u.organizationId, userId: u.id },
    input.agentId,
    input.scheduledAt,
    input.durationMinutes ?? 45,
  );
  if (hasConflict) return { ok: false, error: "AGENT_CONFLICT" };

  const viewing = await withTenant(
    { organizationId: u.organizationId, userId: u.id },
    (db) =>
      db.viewing.create({
        data: {
          organizationId: u.organizationId,
          ...(input as any),
          status: "AGENDADA",
        },
      }),
  );

  const lead = input.leadId
    ? await prisma.lead.findUnique({ where: { id: input.leadId } })
    : null;
  const phone = lead?.whatsapp ?? lead?.phone ?? null;

  if (phone) {
    const property = await prisma.property.findUnique({
      where: { id: input.propertyId },
      select: { title: true, city: true, neighborhood: true },
    });
    await sendTemplate({
      organizationId: u.organizationId,
      toPhone: phone,
      templateName: "recordatorio_visita",
      variables: [
        lead!.firstName,
        property?.title ?? "",
        input.scheduledAt.toLocaleDateString("es-MX"),
        input.scheduledAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      ],
    }).catch(() => {});
  }

  if (input.leadId) {
    await prisma.lead.update({
      where: { id: input.leadId },
      data: { status: "VISITA_AGENDADA" },
    });
  }

  revalidatePath("/visitas");
  revalidatePath(`/propiedades/${input.propertyId}/visitas`);
  return { ok: true, id: viewing.id };
}

export async function updateViewingAction(rawInput: unknown) {
  const u = await requireSession();
  const input = ViewingUpdateSchema.parse(rawInput);
  const { viewingId, ...rest } = input;

  const v = await prisma.viewing.findFirst({
    where: { id: viewingId, organizationId: u.organizationId },
  });
  if (!v) return { ok: false, error: "NOT_FOUND" };

  await prisma.viewing.update({ where: { id: viewingId }, data: rest as any });

  if (
    rest.leadInterestLevel === "MUY_ALTO" ||
    rest.leadInterestLevel === "ALTO"
  ) {
    if (v.leadId) {
      await prisma.task.create({
        data: {
          organizationId: u.organizationId,
          title: `Enviar propuesta formal — ${v.leadId}`,
          assignedToId: v.agentId,
          createdById: u.id,
          relatedLeadId: v.leadId,
          relatedPropertyId: v.propertyId,
          priority: "ALTA",
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }
    if (v.leadId) {
      await prisma.lead.update({
        where: { id: v.leadId },
        data: { status: "VISITA_REALIZADA" },
      });
    }
  }

  revalidatePath("/visitas");
  return { ok: true };
}
