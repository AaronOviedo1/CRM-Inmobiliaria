import { describe, it, expect } from "vitest";
import { withTenant } from "../lib/repos/tenant";

/**
 * Tests de aislación de tenant — validan que el helper withTenant
 * inyecte correctamente el organizationId y falle sin contexto.
 *
 * Nota: estos tests validan la lógica pura del injectOrgFilter.
 * Los tests de aislación reales (org A no ve datos de org B) requieren
 * la DB arriba y se ejecutan como tests de integración con:
 *   DATABASE_URL=... npm test
 */

// Re-export del helper interno para test de unidad
const ORG_A = "org_aaaaaaaaaa";
const ORG_B = "org_bbbbbbbbbb";

describe("tenant isolation", () => {
  it("withTenant debe lanzar si organizationId es vacío", async () => {
    await expect(
      withTenant({ organizationId: "" }, async () => "ok"),
    ).rejects.toThrow("TENANT_CONTEXT_MISSING");
  });

  it("withTenant debe lanzar si organizationId es undefined", async () => {
    await expect(
      withTenant({ organizationId: undefined as any }, async () => "ok"),
    ).rejects.toThrow("TENANT_CONTEXT_MISSING");
  });

  it("debe aceptar organizationId válido", async () => {
    // No necesitamos DB aquí — el scoped client sólo se llama con la query,
    // no la ejecuta si no llamamos métodos.
    await expect(
      withTenant({ organizationId: ORG_A }, async () => "ok"),
    ).resolves.toBe("ok");
  });
});

describe("portal token isolation (pure logic)", () => {
  it("verifyPortalToken debe rechazar token con payload incompleto", async () => {
    const { verifyPortalToken } = await import("../lib/auth/portal-token");
    await expect(verifyPortalToken("bad-token")).rejects.toThrow();
  });

  it("signPortalToken + verifyPortalToken round-trip", async () => {
    const { signPortalToken, verifyPortalToken } = await import(
      "../lib/auth/portal-token"
    );
    const payload = {
      kind: "OWNER" as const,
      organizationId: ORG_A,
      subjectId: "owner_123",
      purpose: "login" as const,
    };
    const token = await signPortalToken(payload, 60);
    const verified = await verifyPortalToken(token);
    expect(verified.kind).toBe("OWNER");
    expect(verified.organizationId).toBe(ORG_A);
    expect(verified.subjectId).toBe("owner_123");
  });

  it("token expirado debe ser rechazado", async () => {
    const { signPortalToken, verifyPortalToken } = await import(
      "../lib/auth/portal-token"
    );
    const token = await signPortalToken(
      { kind: "OWNER", organizationId: ORG_A, subjectId: "o", purpose: "login" },
      -1,
    );
    await expect(verifyPortalToken(token)).rejects.toThrow();
  });
});

describe("crypto (AES-256-GCM)", () => {
  it("encryptSecret + decryptSecret round-trip", () => {
    const { encryptSecret, decryptSecret } = require("../lib/services/crypto");
    const secret = "my-super-secret-whatsapp-token-123";
    const ct = encryptSecret(secret);
    expect(ct.startsWith("v1.")).toBe(true);
    expect(decryptSecret(ct)).toBe(secret);
  });

  it("debe rechazar ciphertext malformado", () => {
    const { decryptSecret } = require("../lib/services/crypto");
    expect(() => decryptSecret("not-valid")).toThrow();
  });

  it("maskPhone oculta el número correctamente", () => {
    const { maskPhone } = require("../lib/services/crypto");
    expect(maskPhone("+52 662 123 4567")).toMatch(/^\+52\*+\d{4}$/);
  });
});
