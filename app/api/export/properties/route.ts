import { NextRequest, NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/services/audit";
import { AuditAction } from "@/lib/enums";

export async function GET(_req: NextRequest) {
  const ctx = await requireTenantContext();

  const rows = await prisma.property.findMany({
    where: { organizationId: ctx.organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { firstName: true, lastName: true } },
      assignedAgent: { select: { name: true } },
    },
  });

  await audit(ctx, {
    entity: "Property",
    entityId: "bulk",
    action: AuditAction.EXPORT,
    changes: { count: rows.length },
  });

  const header = [
    "code,title,category,transactionType,status,priceSale,priceRent,currency,bedrooms,bathrooms,city,neighborhood,owner,agent,createdAt",
  ].join("");

  const csvRows = rows.map((p) =>
    [
      p.code,
      `"${(p.title ?? "").replace(/"/g, '""')}"`,
      p.category,
      p.transactionType,
      p.status,
      p.priceSale ?? "",
      p.priceRent ?? "",
      p.currency,
      p.bedrooms ?? "",
      p.bathrooms ?? "",
      p.city ?? "",
      p.neighborhood ?? "",
      `"${p.owner.firstName} ${p.owner.lastName}"`,
      `"${p.assignedAgent?.name ?? ""}"`,
      p.createdAt.toISOString(),
    ].join(","),
  );

  const csv = [header, ...csvRows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="propiedades-${Date.now()}.csv"`,
    },
  });
}
