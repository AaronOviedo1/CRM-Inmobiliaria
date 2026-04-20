/// Audit log para acciones sensibles (cambios de precio, status, asignaciones, borrados, exports).
/// No bloqueante: nunca rompemos el flujo del usuario si falla el log.

import { prisma } from "../prisma";
import { AuditAction } from "../enums";
import type { TenantContext } from "../prisma";

export async function audit(
  ctx: TenantContext,
  input: {
    entity: string;
    entityId: string;
    action: AuditAction;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  },
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        entity: input.entity,
        entityId: input.entityId,
        action: input.action,
        changes: input.changes ? (input.changes as any) : undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write:", err);
  }
}

/** Computes a minimal diff between two versions, for the `changes` blob. */
export function diff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
): Record<string, { from: unknown; to: unknown }> {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    const b = (before as any)[key];
    const a = (after as any)[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      out[key] = { from: b, to: a };
    }
  }
  return out;
}
