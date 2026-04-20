import { NextRequest, NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/services/audit";
import { AuditAction } from "@/lib/enums";

export async function GET(_req: NextRequest) {
  const ctx = await requireTenantContext();

  const rows = await prisma.lead.findMany({
    where: { organizationId: ctx.organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { assignedAgent: { select: { name: true } } },
  });

  await audit(ctx, {
    entity: "Lead",
    entityId: "bulk",
    action: AuditAction.EXPORT,
    changes: { count: rows.length },
  });

  const header =
    "firstName,lastName,email,phone,status,intent,source,assignedAgent,budgetMin,budgetMax,createdAt";

  const csvRows = rows.map((l) =>
    [
      `"${l.firstName}"`,
      `"${l.lastName}"`,
      l.email ?? "",
      l.phone ?? "",
      l.status,
      l.intent,
      l.source,
      `"${l.assignedAgent?.name ?? ""}"`,
      l.budgetMin ?? "",
      l.budgetMax ?? "",
      l.createdAt.toISOString(),
    ].join(","),
  );

  const csv = [header, ...csvRows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${Date.now()}.csv"`,
    },
  });
}
