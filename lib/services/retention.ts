/// Retención y reactivación de clientes.
///
/// Crons:
///   - Cumpleaños: diario — clients con birthday = hoy.
///   - Aniversarios: diario — ventas cerradas hace exactamente 1 año.
///   - NPS: 15 días post-cierre de operación.
///   - Leads fríos: semanal — leads PERDIDO/EN_PAUSA sin actividad >60d con nuevas propiedades.

import { prisma } from "../prisma";
import { sendTemplate } from "./whatsapp";
import { format, subDays, subYears } from "date-fns";

export async function processBirthdayReminders(organizationId: string) {
  const today = new Date();
  const mm = today.getMonth() + 1;
  const dd = today.getDate();

  const clients = await prisma.client.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
  });

  const birthdays = clients.filter((c) => {
    if (!c.birthday) return false;
    const b = new Date(c.birthday);
    return b.getMonth() + 1 === mm && b.getDate() === dd;
  });

  for (const c of birthdays) {
    const phone = c.whatsapp ?? c.phone ?? null;
    if (!phone) continue;
    await sendTemplate({
      organizationId,
      toPhone: phone,
      templateName: "cumpleanos_cliente",
      variables: [c.firstName],
    }).catch(() => {});

    if (c.whatsapp ?? c.phone) {
      await prisma.task.create({
        data: {
          organizationId,
          title: `Felicitar cumpleaños — ${c.firstName} ${c.lastName}`,
          assignedToId: await getAdminOrFirstAgent(organizationId),
          createdById: await getAdminOrFirstAgent(organizationId),
          relatedClientId: c.id,
          dueAt: today,
          priority: "MEDIA",
        },
      }).catch(() => {});
    }
  }

  return { sent: birthdays.length };
}

export async function processOperationAnniversaries(organizationId: string) {
  const oneYearAgo = subYears(new Date(), 1);
  const window_start = subDays(oneYearAgo, 1);
  const window_end = new Date(oneYearAgo.getTime() + 24 * 60 * 60 * 1000);

  const deals = await prisma.propertyContract.findMany({
    where: {
      organizationId,
      status: { in: ["RENOVADO", "TERMINADO"] },
      contractKind: { in: ["COMPRAVENTA", "ARRENDAMIENTO"] },
      startDate: { gte: window_start, lte: window_end },
    },
    include: { client: true, property: { select: { title: true } } },
  });

  for (const d of deals) {
    if (!d.client) continue;
    const phone = d.client.whatsapp ?? d.client.phone ?? null;
    if (!phone) continue;
    await sendTemplate({
      organizationId,
      toPhone: phone,
      templateName: "aniversario_operacion",
      variables: [
        d.client.firstName,
        d.property.title,
        format(new Date(d.startDate), "MMMM yyyy"),
      ],
    }).catch(() => {});
  }

  return { processed: deals.length };
}

export async function processNpsSurveys(organizationId: string) {
  const targetDate = subDays(new Date(), 15);
  const window_start = subDays(targetDate, 1);
  const window_end = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  const closedLeads = await prisma.lead.findMany({
    where: {
      organizationId,
      status: "GANADO",
      updatedAt: { gte: window_start, lte: window_end },
    },
  });

  for (const l of closedLeads) {
    const phone = l.whatsapp ?? l.phone ?? null;
    if (!phone) continue;
    await sendTemplate({
      organizationId,
      toPhone: phone,
      templateName: "nps_post_operacion",
      variables: [l.firstName],
    }).catch(() => {});
  }

  return { sent: closedLeads.length };
}

export async function processColdLeads(organizationId: string) {
  const cutoff = subDays(new Date(), 60);

  const coldLeads = await prisma.lead.findMany({
    where: {
      organizationId,
      deletedAt: null,
      status: { in: ["PERDIDO", "EN_PAUSA"] },
      updatedAt: { lte: cutoff },
    },
  });

  const agentId = await getAdminOrFirstAgent(organizationId);
  let taskCount = 0;

  for (const lead of coldLeads) {
    const newProps = await prisma.property.count({
      where: {
        organizationId,
        deletedAt: null,
        status: "DISPONIBLE",
        neighborhood: lead.desiredZones.length ? { in: lead.desiredZones } : undefined,
        createdAt: { gte: new Date(lead.updatedAt) },
      },
    });
    if (newProps === 0) continue;

    const alreadyHasTask = await prisma.task.findFirst({
      where: {
        organizationId,
        relatedLeadId: lead.id,
        title: { contains: "reactivación" },
        status: { notIn: ["COMPLETADA", "CANCELADA"] },
      },
    });
    if (alreadyHasTask) continue;

    await prisma.task.create({
      data: {
        organizationId,
        title: `Reactivación sugerida — ${lead.firstName} ${lead.lastName}`,
        description: `${newProps} nueva(s) propiedad(es) coinciden con el perfil de este lead frío.`,
        assignedToId: lead.assignedAgentId ?? agentId,
        createdById: agentId,
        relatedLeadId: lead.id,
        dueAt: new Date(),
        priority: "MEDIA",
      },
    });
    taskCount++;
  }

  return { coldLeads: coldLeads.length, tasksCreated: taskCount };
}

async function getAdminOrFirstAgent(organizationId: string): Promise<string> {
  const u = await prisma.user.findFirst({
    where: { organizationId, role: { in: ["AGENCY_ADMIN", "BROKER"] }, isActive: true },
    select: { id: true },
  });
  if (u) return u.id;
  const a = await prisma.user.findFirst({
    where: { organizationId, isActive: true },
    select: { id: true },
  });
  return a!.id;
}
