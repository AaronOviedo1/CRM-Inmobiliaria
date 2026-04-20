/// Portal del propietario: estadísticas de una propiedad.
/// Auth: cookie `crm_portal_session` con kind=OWNER.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";
import { subWeeks } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: propertyId } = await params;
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const session = await validatePortalSession(token);
  if (!session || session.kind !== "OWNER") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      organizationId: session.organizationId,
      ownerId: session.subjectId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      viewsCount: true,
      inquiriesCount: true,
    },
  });
  if (!property) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const twelveWeeksAgo = subWeeks(new Date(), 12);
  const viewings = await prisma.viewing.findMany({
    where: {
      propertyId,
      scheduledAt: { gte: twelveWeeksAgo },
    },
    select: { scheduledAt: true, status: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    property,
    viewings: viewings.length,
    viewingsByWeek: groupByWeek(viewings),
    views: property.viewsCount,
    inquiries: property.inquiriesCount,
  });
}

function groupByWeek(
  rows: Array<{ scheduledAt: Date; status: string }>,
): Array<{ week: string; count: number }> {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const d = new Date(r.scheduledAt);
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const key = monday.toISOString().slice(0, 10);
    map[key] = (map[key] ?? 0) + 1;
  }
  return Object.entries(map).map(([week, count]) => ({ week, count }));
}
