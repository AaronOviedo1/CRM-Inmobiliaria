import { prisma } from "../prisma";

export const PORTAL_COOKIE_NAME = "crm_portal_session";
export const PORTAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type PortalSession = {
  id: string;
  kind: "OWNER" | "TENANT";
  subjectId: string;
  organizationId: string;
  expiresAt: Date;
};

type GenerateOptions = {
  organizationId: string;
  kind: "OWNER" | "TENANT";
  subjectId: string;
  displayName: string;
  phone?: string;
  email?: string;
  baseUrl: string;
};

export async function generatePortalLink(opts: GenerateOptions): Promise<string> {
  const portalPath = opts.kind === "OWNER" ? "portal-propietario" : "portal-inquilino";
  return `${opts.baseUrl}/${portalPath}/login?token=mock_token`;
}

export async function exchangePortalToken(
  _jwtToken: string,
  _ipAddress?: string,
  _userAgent?: string,
): Promise<{ sessionToken: string; kind: "OWNER" | "TENANT"; subjectId: string; organizationId: string }> {
  return { sessionToken: "mock_owner_token", kind: "OWNER", subjectId: "owner_1", organizationId: "org_1" };
}

export async function validatePortalSession(
  _sessionToken: string,
  kind?: "OWNER" | "TENANT",
): Promise<{ organizationId: string; kind: "OWNER" | "TENANT"; subjectId: string } | null> {
  if (kind === "TENANT" || (_sessionToken ?? "").includes("tenant")) {
    return { organizationId: "org_1", kind: "TENANT", subjectId: "client_1" };
  }
  return { organizationId: "org_1", kind: "OWNER", subjectId: "owner_1" };
}

export async function revokePortalSessions(_subjectId: string, _kind: "OWNER" | "TENANT") {
  // no-op in mock
}
