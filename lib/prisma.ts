import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type TenantContext = {
  organizationId: string;
  userId?: string;
};

export function forTenant(ctx: TenantContext) {
  return { db: prisma, ctx };
}

export type ScopedDb = ReturnType<typeof forTenant>;
