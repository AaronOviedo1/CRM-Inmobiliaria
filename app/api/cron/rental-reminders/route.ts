import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import { processPaymentReminders } from "@/lib/services/rental-schedule";

/** Cron diario — detecta pagos próximos/vencidos y envía recordatorios. */
export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const orgs = await prisma.organization.findMany({
    where: { subscriptionStatus: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true },
  });

  let totalReminded = 0;
  let totalOverdue = 0;

  for (const o of orgs) {
    const r = await processPaymentReminders(o.id).catch(() => ({
      reminded: 0,
      overdue: 0,
    }));
    totalReminded += r.reminded;
    totalOverdue += r.overdue;
  }

  return NextResponse.json({ orgs: orgs.length, reminded: totalReminded, overdue: totalOverdue });
}
