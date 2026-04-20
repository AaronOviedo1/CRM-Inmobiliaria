/// JWT firmado (HS256) para magic-link de portales Owner/Tenant.
/// NO es una sesión — se canjea por una sesión real (PortalSession en DB) al primer uso.

import { SignJWT, jwtVerify } from "jose";
import { env } from "../env";

const ISSUER = "inmobiliaria-crm";
const AUDIENCE = "portal";

function secret(): Uint8Array {
  return new TextEncoder().encode(env.portalJwtSecret);
}

export type PortalTokenPayload = {
  kind: "OWNER" | "TENANT";
  organizationId: string;
  /// ownerId o clientId según `kind`
  subjectId: string;
  /// propósito: login magic-link, o cambio de email, etc.
  purpose: "login" | "email-change";
};

/**
 * Genera un magic-link JWT.
 * TTL default 24 horas. Este token se envía al usuario vía WhatsApp/email.
 */
export async function signPortalToken(
  payload: PortalTokenPayload,
  ttlSeconds = 60 * 60 * 24,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(secret());
}

export async function verifyPortalToken(
  token: string,
): Promise<PortalTokenPayload> {
  const { payload } = await jwtVerify(token, secret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  const p = payload as unknown as PortalTokenPayload;
  if (
    (p.kind !== "OWNER" && p.kind !== "TENANT") ||
    !p.organizationId ||
    !p.subjectId
  ) {
    throw new Error("Invalid portal token payload");
  }
  return p;
}
