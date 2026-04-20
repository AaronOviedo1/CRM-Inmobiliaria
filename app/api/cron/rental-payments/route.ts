import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import { generateCurrentMonthPayments } from "@/lib/services/rental-schedule";

/** Cron diario 9am — genera RentalPayment del mes para todas las orgs. */
export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const orgs = await prisma.organization.findMany({
    where: { subscriptionStatus: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    orgs.map((o) => generateCurrentMonthPayments(o.id)),
  );

  const ok = results.filter((r) => r.status === "fulfilled");
  return NextResponse.json({ orgs: orgs.length, succeeded: ok.length });
}
