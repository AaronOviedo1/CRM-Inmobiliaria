import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import {
  processBirthdayReminders,
  processOperationAnniversaries,
  processNpsSurveys,
  processColdLeads,
} from "@/lib/services/retention";

/** Cron diario — birthday + anniversaries + NPS + cold leads. */
export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const orgs = await prisma.organization.findMany({
    where: { subscriptionStatus: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true },
  });

  const stats = { birthdays: 0, anniversaries: 0, nps: 0, coldLeads: 0 };

  for (const o of orgs) {
    const [b, a, n, c] = await Promise.allSettled([
      processBirthdayReminders(o.id),
      processOperationAnniversaries(o.id),
      processNpsSurveys(o.id),
      processColdLeads(o.id),
    ]);
    if (b.status === "fulfilled") stats.birthdays += b.value.sent;
    if (a.status === "fulfilled") stats.anniversaries += a.value.processed;
    if (n.status === "fulfilled") stats.nps += n.value.sent;
    if (c.status === "fulfilled") stats.coldLeads += c.value.tasksCreated;
  }

  return NextResponse.json(stats);
}
