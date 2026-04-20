import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import { matchLeadToProperties } from "@/lib/services/matching";
import { notify } from "@/lib/services/notify";
import { subDays } from "date-fns";

/** Cron diario 8am — re-corre matching para leads activos de los últimos 30 días. */
export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const cutoff = subDays(new Date(), 30);

  const leads = await prisma.lead.findMany({
    where: {
      deletedAt: null,
      status: {
        notIn: ["GANADO", "PERDIDO"],
      },
      createdAt: { gte: cutoff },
    },
    select: { id: true, organizationId: true, assignedAgentId: true },
  });

  let highScoreCount = 0;

  for (const lead of leads) {
    const matches = await matchLeadToProperties(
      { organizationId: lead.organizationId },
      lead.id,
      { topN: 10, minScore: 40 },
    ).catch(() => []);

    const newHighScores = matches.filter((m) => m.score >= 80);
    if (newHighScores.length > 0 && lead.assignedAgentId) {
      await notify({
        userId: lead.assignedAgentId,
        event: "NEW_LEAD",
        title: `${newHighScores.length} nuevo(s) match(es) de alta coincidencia`,
        url: `/leads/${lead.id}`,
      });
      highScoreCount += newHighScores.length;
    }
  }

  return NextResponse.json({ leads: leads.length, highScoreNotifications: highScoreCount });
}
