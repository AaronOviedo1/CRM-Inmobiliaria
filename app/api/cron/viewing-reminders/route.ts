import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import { sendTemplate } from "@/lib/services/whatsapp";
import { addHours, subHours } from "date-fns";

/** Cron cada hora — envía WhatsApp de confirmación 2h antes de cada visita. */
export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const now = new Date();
  const in2h = addHours(now, 2);

  const viewings = await prisma.viewing.findMany({
    where: {
      status: { in: ["AGENDADA", "CONFIRMADA"] },
      scheduledAt: {
        gte: subHours(in2h, 10 / 60),
        lte: addHours(in2h, 10 / 60),
      },
    },
    include: {
      property: { select: { title: true, code: true } },
      lead: true,
      agent: { select: { name: true, phone: true } },
    },
  });

  let sent = 0;

  for (const v of viewings) {
    const phone =
      v.lead?.whatsapp ?? v.lead?.phone ?? null;
    if (!phone) continue;

    const result = await sendTemplate({
      organizationId: v.organizationId,
      toPhone: phone,
      templateName: "recordatorio_visita",
      variables: [
        v.lead!.firstName,
        v.property.title,
        v.scheduledAt.toLocaleDateString("es-MX"),
        v.scheduledAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      ],
    }).catch(() => ({ ok: false }));

    if (result.ok) sent++;
  }

  return NextResponse.json({ viewings: viewings.length, sent });
}
