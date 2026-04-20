/// Tenant DB helper — routes all queries through the prisma mock.
/// TODO(backend): add org-scoping middleware when real DB is connected.
import { prisma } from "../prisma";
import type { TenantContext } from "../prisma";

export function withTenant<T>(
  _ctx: TenantContext,
  fn: (db: typeof prisma) => T,
): T {
  return fn(prisma);
}

export function prismaRawUnsafe(): typeof prisma {
  return prisma;
}
