import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";
import { subDays, startOfDay, endOfDay } from "date-fns";

/** Cron 7am — resumen del día anterior para AGENCY_ADMIN y BROKER. */
export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const yesterday = subDays(new Date(), 1);
  const from = startOfDay(yesterday);
  const to = endOfDay(yesterday);

  const orgs = await prisma.organization.findMany({
    where: { subscriptionStatus: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true, name: true },
  });

  let emails = 0;

  for (const org of orgs) {
    const [newLeads, viewings, payments, openMaintenance] = await Promise.all([
      prisma.lead.count({ where: { organizationId: org.id, createdAt: { gte: from, lte: to } } }),
      prisma.viewing.count({ where: { organizationId: org.id, scheduledAt: { gte: from, lte: to } } }),
      prisma.rentalPayment.count({ where: { rental: { organizationId: org.id }, status: "PAGADO", paidAt: { gte: from, lte: to } } }),
      prisma.maintenanceRequest.count({ where: { organizationId: org.id, status: { notIn: ["COMPLETADO", "CERRADO", "RECHAZADO"] } } }),
    ]);

    const admins = await prisma.user.findMany({
      where: { organizationId: org.id, role: { in: ["AGENCY_ADMIN", "BROKER"] }, isActive: true },
      select: { email: true, name: true },
    });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Resumen diario — ${org.name}`,
        text: `Hola ${admin.name},\n\nResumen de ayer:\n- Leads nuevos: ${newLeads}\n- Visitas agendadas: ${viewings}\n- Pagos recibidos: ${payments}\n- Mantenimientos abiertos: ${openMaintenance}\n\nSaludos,\nCasa Dorada CRM`,
      }).catch(() => {});
      emails++;
    }
  }

  return NextResponse.json({ orgs: orgs.length, emailsSent: emails });
}
