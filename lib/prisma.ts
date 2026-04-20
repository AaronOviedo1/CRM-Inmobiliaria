/// Prisma client — intelligent mock proxy for frontend preview.
/// Returns sensible defaults per Prisma method so pages render without crashes.
/// TODO(backend): restore real PrismaClient when DATABASE_URL points to real DB.

import {
  MOCK_PROPERTIES, MOCK_LEADS, MOCK_RENTALS, MOCK_MAINTENANCE, MOCK_TASKS,
  MOCK_CONTRACTS, MOCK_INTERACTIONS, MOCK_VIEWINGS, MOCK_OWNERS, MOCK_USERS,
  MOCK_CLIENTS, MOCK_MATCHES, MOCK_OFFERS,
} from "@/lib/mock/factories";

const MODEL_DEFAULTS: Record<string, any[]> = {
  property: MOCK_PROPERTIES,
  lead: MOCK_LEADS,
  rental: MOCK_RENTALS,
  rentalPayment: MOCK_RENTALS.flatMap((r: any) => r.payments ?? []),
  maintenanceRequest: MOCK_MAINTENANCE,
  task: MOCK_TASKS,
  propertyContract: MOCK_CONTRACTS,
  interaction: MOCK_INTERACTIONS,
  viewing: MOCK_VIEWINGS,
  owner: MOCK_OWNERS,
  user: MOCK_USERS,
  client: MOCK_CLIENTS,
  lead_match: MOCK_MATCHES,
  propertyOffer: MOCK_OFFERS,
  organization: [{ id: "org_1", name: "Casa Dorada", slug: "casadorada", phone: "+52 662 000 0000", email: "contacto@casadorada.mx", addressLine: "Blvd. Kino 123, Hermosillo", primaryColor: "#C9A84C", subscriptionPlan: "PROFESSIONAL", subscriptionStatus: "ACTIVE" }],
  tag: [],
  portalSession: [],
};

function applyWhere(rows: any[], where?: any): any[] {
  if (!where || typeof where !== "object") return rows;
  return rows.filter((row) => {
    for (const [key, val] of Object.entries(where)) {
      if (key === "deletedAt") {
        // skip deletedAt filters — mock data has no soft deletes
        continue;
      } else if (key === "organizationId") {
        // skip org filter — all mock data belongs to org_1
        continue;
      } else if (key === "OR" || key === "AND" || key === "NOT") {
        // skip logical combinators
        continue;
      } else if (val !== null && typeof val === "object") {
        // handle operator objects: { in, notIn, not, gte, lte, etc. }
        const op = val as any;
        if (op.in !== undefined && Array.isArray(op.in)) {
          if (row[key] !== undefined && !op.in.includes(row[key])) return false;
        } else if (op.notIn !== undefined && Array.isArray(op.notIn)) {
          if (row[key] !== undefined && op.notIn.includes(row[key])) return false;
        } else if (op.not !== undefined && typeof op.not === "string") {
          if (row[key] === op.not) return false;
        }
        // skip gte/lte/lt/gt range filters (date comparisons etc.)
      } else if (val !== undefined && typeof val === "string" && row[key] !== undefined) {
        if (row[key] !== val) return false;
      }
    }
    return true;
  });
}

function makeModelProxy(modelName: string): any {
  const defaults = MODEL_DEFAULTS[modelName] ?? [];
  return {
    findMany: ({ where, take, skip, orderBy, include, select }: any = {}) => {
      const rows = applyWhere(defaults, where);
      const limited = rows.slice(skip ?? 0, take ? (skip ?? 0) + take : undefined);
      return Promise.resolve(limited);
    },
    findFirst: ({ where, include, select }: any = {}) => {
      const rows = applyWhere(defaults, where);
      return Promise.resolve(rows[0] ?? null);
    },
    findUnique: ({ where, include, select }: any = {}) => {
      const rows = applyWhere(defaults, where);
      return Promise.resolve(rows[0] ?? null);
    },
    findUniqueOrThrow: ({ where, include, select }: any = {}) => {
      const rows = applyWhere(defaults, where);
      if (!rows[0]) throw new Error(`Mock: ${modelName} record not found for where: ${JSON.stringify(where)}`);
      return Promise.resolve(rows[0]);
    },
    count: ({ where }: any = {}) => {
      return Promise.resolve(applyWhere(defaults, where).length);
    },
    create: ({ data }: any = {}) => Promise.resolve({ id: "mock_new", ...data }),
    update: ({ data }: any = {}) => Promise.resolve({ id: "mock_updated", ...data }),
    updateMany: () => Promise.resolve({ count: 0 }),
    delete: () => Promise.resolve(null),
    deleteMany: () => Promise.resolve({ count: 0 }),
    upsert: ({ create }: any = {}) => Promise.resolve({ id: "mock_upsert", ...create }),
    groupBy: () => Promise.resolve([]),
    aggregate: () => Promise.resolve({ _sum: {}, _avg: {}, _count: 0, _min: {}, _max: {} }),
  };
}

function createPrismaProxy(): any {
  return new Proxy(
    {},
    {
      get(_t: any, prop: string): any {
        if (prop === "then") return undefined;
        if (prop === "$transaction") {
          return (fn: any) => {
            if (typeof fn === "function") return fn(createPrismaProxy());
            return Promise.all(fn);
          };
        }
        if (prop === "$connect" || prop === "$disconnect") return () => Promise.resolve();
        return makeModelProxy(
          prop.charAt(0).toLowerCase() + prop.slice(1)
        );
      },
    }
  );
}

// No globalThis caching — avoids stale real-Prisma client persisting across hot reloads.
export const prisma: any = createPrismaProxy();

export type TenantContext = {
  organizationId: string;
  userId?: string;
};

export function forTenant(ctx: TenantContext) {
  return { db: prisma, ctx };
}

export type ScopedDb = ReturnType<typeof forTenant>;
