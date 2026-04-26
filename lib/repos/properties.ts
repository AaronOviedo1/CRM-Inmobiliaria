import { prisma } from "../prisma";
import type { TenantContext } from "../prisma";

export async function getPropertyById(ctx: TenantContext, id: string) {
  return prisma.property.findFirst({
    where: {
      organizationId: ctx.organizationId,
      deletedAt: null,
      OR: [{ id }, { slug: id }],
    },
    include: {
      images: { orderBy: { order: "asc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      owner: { select: { id: true, firstName: true, lastName: true } },
      assignedAgent: { select: { id: true, name: true } },
      viewings: {
        include: {
          lead: { select: { id: true, firstName: true, lastName: true } },
          agent: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: "desc" },
        take: 20,
      },
      offers: {
        include: {
          lead: { select: { id: true, firstName: true, lastName: true } },
          agent: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function incrementPropertyInquiries(_ctx: TenantContext, propertyId: string) {
  await prisma.property.update({
    where: { id: propertyId },
    data: { inquiriesCount: { increment: 1 } },
  });
}

export async function listProperties(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId, deletedAt: null };
  if (f.status) where.status = f.status;
  if (f.category) where.category = f.category;
  if (f.transactionType) where.transactionType = f.transactionType;
  if (f.neighborhood) where.neighborhood = { contains: f.neighborhood, mode: "insensitive" };
  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: "insensitive" } },
      { code: { contains: f.q, mode: "insensitive" } },
      { neighborhood: { contains: f.q, mode: "insensitive" } },
    ];
  }
  const pageSize = Number(f.pageSize ?? 40);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: f.orderBy === "viewsCount" ? { viewsCount: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { where: { isCover: true }, take: 1 },
        owner: { select: { id: true, firstName: true, lastName: true } },
        assignedAgent: { select: { id: true, name: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);
  return { rows, total };
}
