import { prisma } from "../prisma";
import type { TenantContext } from "../prisma";
import { toPlain } from "../utils";

export async function getPropertyById(ctx: TenantContext, id: string) {
  const row = await prisma.property.findFirst({
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
  return toPlain(row);
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
  if (f.minBedrooms != null) where.bedrooms = { gte: Number(f.minBedrooms) };
  if (f.minPrice != null || f.maxPrice != null) {
    const range: any = {};
    if (f.minPrice != null) range.gte = Number(f.minPrice);
    if (f.maxPrice != null) range.lte = Number(f.maxPrice);
    /// El usuario puede estar viendo venta o renta; aplicamos el rango a
    /// cualquiera de los dos precios que la propiedad tenga definido.
    where.OR = [{ priceSale: range }, { priceRent: range }];
  }
  if (f.q) {
    const qOR = [
      { title: { contains: f.q, mode: "insensitive" } },
      { code: { contains: f.q, mode: "insensitive" } },
      { neighborhood: { contains: f.q, mode: "insensitive" } },
    ];
    /// Si ya hay un OR (por rango de precio), combinamos con AND.
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: qOR }];
      delete where.OR;
    } else {
      where.OR = qOR;
    }
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
  return { rows: toPlain(rows), total };
}
