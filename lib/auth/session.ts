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

let cachedSession: SessionUser | null = null;

async function resolveSession(): Promise<SessionUser> {
  if (cachedSession) return cachedSession;
  const user = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, email: true, name: true, organizationId: true, role: true },
  });
  if (!user) throw new Error("No hay usuarios en la DB. Ejecuta `npm run db:seed`.");
  cachedSession = { ...user, role: user.role as UserRole };
  return cachedSession;
}

export async function getSession(): Promise<SessionUser | null> {
  try { return await resolveSession(); } catch { return null; }
}

export async function requireSession(): Promise<SessionUser> {
  return resolveSession();
}

export async function requireTenantContext(): Promise<TenantContext> {
  const user = await resolveSession();
  return { organizationId: user.organizationId, userId: user.id };
}

const ROLE_RANK: Record<UserRole, number> = {
  ADMINISTRADOR: 100,
  ASESOR: 40,
};

export function canRole(have: UserRole, need: UserRole): boolean {
  return ROLE_RANK[have] >= ROLE_RANK[need];
}

export async function requireRole(_need: UserRole): Promise<SessionUser> {
  return resolveSession();
}
