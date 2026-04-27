import { prisma } from "../prisma";
import type { TenantContext } from "../prisma";
import { toPlain } from "../utils";

export async function getOwnerById(ctx: TenantContext, id: string) {
  const row = await prisma.owner.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    include: {
      properties: { where: { deletedAt: null } },
      rentals: {
        include: {
          property: { select: { id: true, title: true } },
          tenant: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      contracts: {
        include: { property: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      interactions: { orderBy: { occurredAt: "desc" }, take: 30 },
    },
  });
  return toPlain(row);
}

export async function listOwners(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId, deletedAt: null };
  if (f.q) {
    where.OR = [
      { firstName: { contains: f.q, mode: "insensitive" } },
      { lastName: { contains: f.q, mode: "insensitive" } },
      { email: { contains: f.q, mode: "insensitive" } },
    ];
  }
  const pageSize = Number(f.pageSize ?? 40);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      orderBy: { lastName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { properties: { where: { deletedAt: null }, select: { id: true } } },
    }),
    prisma.owner.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function getClientById(ctx: TenantContext, id: string) {
  const row = await prisma.client.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    include: {
      rentalsAsTenant: {
        include: {
          property: { select: { id: true, title: true } },
          payments: { orderBy: { dueDate: "desc" }, take: 6 },
        },
      },
      interactions: { orderBy: { occurredAt: "desc" }, take: 20 },
    },
  });
  return toPlain(row);
}

export async function listClients(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId, deletedAt: null };
  if (f.q) {
    where.OR = [
      { firstName: { contains: f.q, mode: "insensitive" } },
      { lastName: { contains: f.q, mode: "insensitive" } },
      { email: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.type) where.type = f.type;
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { lastName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function getContractById(ctx: TenantContext, id: string) {
  const row = await prisma.propertyContract.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: {
      property: true,
      owner: true,
      client: true,
      agent: true,
    },
  });
  return toPlain(row);
}

export async function listContracts(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId };
  if (f.status) where.status = f.status;
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.propertyContract.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: { select: { id: true, title: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
        agent: { select: { id: true, name: true } },
      },
    }),
    prisma.propertyContract.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function contractsExpiringBefore(ctx: TenantContext, date: Date) {
  const rows = await prisma.propertyContract.findMany({
    where: {
      organizationId: ctx.organizationId,
      status: "ACTIVO" as any,
      endDate: { lte: date, gte: new Date() },
    },
    include: { property: true, owner: true, agent: true },
  });
  return toPlain(rows);
}

export async function getRentalById(ctx: TenantContext, id: string) {
  const row = await prisma.rental.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: {
      property: { include: { images: { where: { isCover: true }, take: 1 } } },
      tenant: true,
      owner: true,
      agent: true,
      contract: true,
      payments: { orderBy: { dueDate: "desc" }, take: 12 },
    },
  });
  return toPlain(row);
}

export async function listActiveRentals(ctx: TenantContext) {
  const rows = await prisma.rental.findMany({
    where: { organizationId: ctx.organizationId, status: "ACTIVA" as any },
    include: { property: true, tenant: true, owner: true },
  });
  return toPlain(rows);
}

export async function listRentals(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId };
  if (f.status) where.status = f.status;
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.rental.findMany({
      where,
      orderBy: { endDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: { select: { id: true, title: true, coverImageUrl: true } },
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.rental.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function getPayment(ctx: TenantContext, id: string) {
  const row = await prisma.rentalPayment.findFirst({
    where: { id, rental: { organizationId: ctx.organizationId } },
    include: { rental: { include: { tenant: true, property: true, owner: true } } },
  });
  return toPlain(row);
}

export async function listViewingsBetween(ctx: TenantContext, from: Date, to: Date) {
  const rows = await prisma.viewing.findMany({
    where: { organizationId: ctx.organizationId, scheduledAt: { gte: from, lte: to } },
    include: { property: true, lead: true, client: true, agent: true },
    orderBy: { scheduledAt: "asc" },
  });
  return toPlain(rows);
}

export async function agentHasConflict(
  ctx: TenantContext,
  agentId: string,
  start: Date,
  durationMin: number,
  excludeViewingId?: string,
): Promise<boolean> {
  const end = new Date(start.getTime() + durationMin * 60_000);
  const bufferMs = 60 * 60_000;
  const overlapping = await prisma.viewing.findFirst({
    where: {
      organizationId: ctx.organizationId,
      agentId,
      id: excludeViewingId ? { not: excludeViewingId } : undefined,
      status: { in: ["AGENDADA", "CONFIRMADA"] as any[] },
      scheduledAt: {
        gte: new Date(start.getTime() - bufferMs),
        lte: new Date(end.getTime() + bufferMs),
      },
    },
  });
  return Boolean(overlapping);
}

export async function listViewings(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId };
  if (f.from || f.to) {
    where.scheduledAt = {};
    if (f.from) where.scheduledAt.gte = f.from;
    if (f.to) where.scheduledAt.lte = f.to;
  }
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.viewing.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: { select: { id: true, title: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
        agent: { select: { id: true, name: true } },
      },
    }),
    prisma.viewing.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function getOfferById(ctx: TenantContext, id: string) {
  const row = await prisma.offer.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: { property: true, lead: true, client: true, agent: true },
  });
  return toPlain(row);
}

export async function getMaintenanceById(ctx: TenantContext, id: string) {
  const row = await prisma.maintenanceRequest.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: {
      rental: { include: { tenant: true, owner: true } },
      property: true,
      reporter: true,
      assignedTo: true,
    },
  });
  return toPlain(row);
}

export async function listMaintenance(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId };
  if (f.status) where.status = f.status;
  if (f.q) where.title = { contains: f.q, mode: "insensitive" };
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: { select: { id: true, title: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function getTaskById(ctx: TenantContext, id: string) {
  const row = await prisma.task.findFirst({
    where: { id, organizationId: ctx.organizationId },
  });
  return toPlain(row);
}

export async function listTasks(ctx: TenantContext, f: any) {
  const where: any = { organizationId: ctx.organizationId };
  if (f.status) where.status = f.status;
  if (f.assigneeId) where.assignedToId = f.assigneeId;
  const pageSize = Number(f.pageSize ?? 25);
  const page = Number(f.page ?? 1);
  const [rows, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        assignedTo: { select: { id: true, name: true } },
        relatedLead: { select: { id: true, firstName: true, lastName: true } },
        relatedProperty: { select: { id: true, title: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);
  return { rows: toPlain(rows), total };
}

export async function listActiveAgents(ctx: TenantContext) {
  const rows = await prisma.user.findMany({
    where: { organizationId: ctx.organizationId, isActive: true },
    orderBy: { name: "asc" },
  });
  return toPlain(rows);
}

export async function getUserById(ctx: TenantContext, id: string) {
  const row = await prisma.user.findFirst({ where: { id, organizationId: ctx.organizationId } });
  return toPlain(row);
}

export async function listUsers(ctx: TenantContext) {
  const rows = await prisma.user.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { name: "asc" },
  });
  return toPlain(rows);
}

export async function listMatchSuggestions(ctx: TenantContext, leadId: string) {
  const rows = await prisma.matchSuggestion.findMany({
    where: { organizationId: ctx.organizationId, leadId, status: "PROPUESTO" as any },
    include: { property: true },
    orderBy: { score: "desc" },
    take: 10,
  });
  return toPlain(rows);
}
