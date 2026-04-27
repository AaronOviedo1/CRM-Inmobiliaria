/// Prisma client — real PrismaClient conectado a la DB configurada por
/// `DATABASE_URL`. Usa el patrón global-singleton recomendado por Prisma para
/// evitar múltiples clientes durante el hot-reload de Next.js en desarrollo.
///
/// Se aplica una extensión global que corre `toPlain()` sobre el resultado de
/// toda query. Así los `Prisma.Decimal` llegan a los Server Components como
/// `number` y Next.js no se queja al pasarlos a Client Components.

import { PrismaClient } from "@prisma/client";
import { toPlain } from "./utils";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const result = await query(args);
        return toPlain(result);
      },
    },
  },
});

export type TenantContext = {
  organizationId: string;
  userId?: string;
};

export function forTenant(ctx: TenantContext) {
  return { db: prisma, ctx };
}

export type ScopedDb = ReturnType<typeof forTenant>;
