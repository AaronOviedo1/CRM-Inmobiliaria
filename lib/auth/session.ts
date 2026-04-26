import { redirect } from "next/navigation";
import { auth } from "./config";
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

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    organizationId: session.user.organizationId,
    role: session.user.role,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireTenantContext(): Promise<TenantContext> {
  const user = await requireSession();
  return { organizationId: user.organizationId, userId: user.id };
}

const ROLE_RANK: Record<UserRole, number> = {
  ADMINISTRADOR: 100,
  ASESOR: 40,
};

export function canRole(have: UserRole, need: UserRole): boolean {
  return ROLE_RANK[have] >= ROLE_RANK[need];
}

export async function requireRole(need: UserRole): Promise<SessionUser> {
  const user = await requireSession();
  if (!canRole(user.role, need)) redirect("/dashboard");
  return user;
}
