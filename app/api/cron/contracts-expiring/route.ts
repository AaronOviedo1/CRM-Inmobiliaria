import { NextRequest, NextResponse } from "next/server";
import { guardCron } from "../_guard";
import { prisma } from "@/lib/prisma";
import { processContractExpiry } from "@/lib/services/contract-expiry";

export async function POST(req: NextRequest) {
  const guard = guardCron(req);
  if (guard) return guard;

  const orgs = await prisma.organization.findMany({
    where: { subscriptionStatus: { in: ["ACTIVE", "TRIAL"] } },
    select: { id: true },
  });

  let total = 0;
  for (const o of orgs) {
    const r = await processContractExpiry(o.id).catch(() => ({ notified: 0 }));
    total += r.notified;
  }

  return NextResponse.json({ orgs: orgs.length, notified: total });
}
