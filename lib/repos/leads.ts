import { prisma } from "../prisma";
import type { TenantContext } from "../prisma";
import { toPlain } from "../utils";

export async function getLeadById(ctx: TenantContext, id: string) {
  const row = await prisma.lead.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    include: {
      interactions: { orderBy: { occurredAt: "desc" }, take: 30 },
      viewings: {
        include: { property: true, agent: true },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
      matches: {
        where: { status: "PROPUESTO" as any },
        include: { property: true },
        orderBy: { score: "desc" },
        take: 10,
      },
      assignedAgent: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
  return toPlain(row);
}

export async function listLeads(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId, deletedAt: null };
  if (f.status) where.status = f.status;
  if (f.source) where.source = f.source;
  if (f.q) {
    where.OR = [
      { firstName: { contains: f.q, mode: "insensitive" } },
      { lastName: { contains: f.q, mode: "insensitive" } },
      { email: { contains: f.q, mode: "insensitive" } },
      { phone: { contains: f.q, mode: "insensitive" } },
    ];
  }
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        assignedAgent: { select: { id: true, name: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}
