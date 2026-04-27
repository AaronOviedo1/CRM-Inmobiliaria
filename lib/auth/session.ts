import type { UserRole } from "../enums";
import type { TenantContext } from "../prisma";
import { prisma } from "../prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  organizationId: string;
  role: UserRole;
};

// TODO(auth): replace with real next-auth session check.
// For now we resolve the first active admin (or user) in the DB and cache it
// per-process so every request in dev sees the same identity.
let cachedSession: SessionUser | null = null;

async function resolveSession(): Promise<SessionUser> {
  if (cachedSession) return cachedSession;
  const user = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      organizationId: true,
      role: true,
    },
  });
  if (!user) {
    throw new Error(
      "No hay usuarios en la base de datos. Ejecuta `npm run db:seed` primero.",
    );
  }
  cachedSession = {
    id: user.id,
    email: user.email,
    name: user.name,
    organizationId: user.organizationId,
    role: user.role as UserRole,
  };
  return cachedSession;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    return await resolveSession();
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  return resolveSession();
}

export async function requireTenantContext(): Promise<TenantContext> {
  const s = await resolveSession();
  return { organizationId: s.organizationId, userId: s.id };
}

const ROLE_RANK: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  AGENCY_ADMIN: 80,
  BROKER: 60,
  AGENT: 40,
  ASSISTANT: 20,
};

export function canRole(have: UserRole, need: UserRole): boolean {
  return ROLE_RANK[have] >= ROLE_RANK[need];
}

export async function requireRole(_need: UserRole): Promise<SessionUser> {
  return resolveSession();
}
