import { SignJWT, jwtVerify } from "jose";
import { prisma } from "../prisma";
import { env } from "../env";

export const PORTAL_COOKIE_NAME = "crm_portal_session";
export const PORTAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const LINK_TOKEN_TTL_SECS = 60 * 60 * 24;
const SESSION_TTL_SECS = 60 * 60 * 24 * 30;

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

const jwtSecret = () => new TextEncoder().encode(env.portalJwtSecret);

export async function generatePortalLink(opts: GenerateOptions): Promise<string> {
  const portalPath = opts.kind === "OWNER" ? "portal-propietario" : "portal-inquilino";
  const token = await new SignJWT({
    org: opts.organizationId,
    kind: opts.kind,
    sub: opts.subjectId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${LINK_TOKEN_TTL_SECS}s`)
    .sign(jwtSecret());

  return `${opts.baseUrl}/${portalPath}/login?token=${token}`;
}

export async function exchangePortalToken(
  jwtToken: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ sessionToken: string; kind: "OWNER" | "TENANT"; subjectId: string; organizationId: string }> {
  const { payload } = await jwtVerify(jwtToken, jwtSecret());
  const { org, kind, sub } = payload as { org: string; kind: "OWNER" | "TENANT"; sub: string };

  const expiresAt = new Date(Date.now() + SESSION_TTL_SECS * 1000);
  const sessionToken = crypto.randomUUID();

  await prisma.portalSession.create({
    data: {
      organizationId: org,
      kind: kind as any,
      subjectId: sub,
      token: sessionToken,
      expiresAt,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });

  return { sessionToken, kind, subjectId: sub, organizationId: org };
}

export async function validatePortalSession(
  sessionToken: string,
  kind?: "OWNER" | "TENANT",
): Promise<{ organizationId: string; kind: "OWNER" | "TENANT"; subjectId: string } | null> {
  const session = await prisma.portalSession.findUnique({
    where: { token: sessionToken },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;
  if (kind && session.kind !== kind) return null;

  prisma.portalSession
    .update({ where: { token: sessionToken }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return {
    organizationId: session.organizationId,
    kind: session.kind as "OWNER" | "TENANT",
    subjectId: session.subjectId,
  };
}

export async function revokePortalSessions(subjectId: string, kind: "OWNER" | "TENANT") {
  await prisma.portalSession.deleteMany({ where: { subjectId, kind: kind as any } });
}
