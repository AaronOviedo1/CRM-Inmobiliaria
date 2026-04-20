import type { UserRole } from "../enums";
import type { TenantContext } from "../prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  organizationId: string;
  role: UserRole;
};

// TODO(backend): replace with real next-auth session check.
// For mock preview, returns a fixed mock session so all pages render without redirecting.
const MOCK_SESSION: SessionUser = {
  id: "user_1",
  email: "sofia@casadorada.mx",
  name: "Sofía Encinas",
  organizationId: "org_1",
  role: "AGENT" as UserRole,
};

export async function getSession(): Promise<SessionUser | null> {
  return MOCK_SESSION;
}

export async function requireSession(): Promise<SessionUser> {
  return MOCK_SESSION;
}

export async function requireTenantContext(): Promise<TenantContext> {
  return { organizationId: MOCK_SESSION.organizationId, userId: MOCK_SESSION.id };
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

export async function requireRole(need: UserRole): Promise<SessionUser> {
  return MOCK_SESSION;
}
