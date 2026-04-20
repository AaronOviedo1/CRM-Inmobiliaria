"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { generatePortalLink } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";
import { OwnerCreateSchema, OwnerUpdateSchema } from "@/lib/validators/owner";
import { headers } from "next/headers";

export async function createOwnerAction(rawInput: unknown) {
  const u = await requireSession();
  const input = OwnerCreateSchema.parse(rawInput);

  const owner = await withTenant(
    { organizationId: u.organizationId, userId: u.id },
    (db) =>
      db.owner.create({
        data: {
          organizationId: u.organizationId,
          ...(input as any),
        },
      }),
  );

  revalidatePath("/propietarios");
  return { ok: true, id: owner.id };
}

export async function updateOwnerAction(ownerId: string, rawInput: unknown) {
  const u = await requireSession();
  const input = OwnerUpdateSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.owner.update({ where: { id: ownerId }, data: input as any }),
  );

  revalidatePath(`/propietarios/${ownerId}`);
  return { ok: true };
}

export async function softDeleteOwnerAction(ownerId: string) {
  const u = await requireSession();

  const propsCount = await prisma.property.count({
    where: { ownerId, organizationId: u.organizationId, deletedAt: null },
  });
  if (propsCount > 0) {
    return { ok: false, error: "OWNER_HAS_PROPERTIES" };
  }

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.owner.update({
      where: { id: ownerId },
      data: { deletedAt: new Date() },
    }),
  );

  revalidatePath("/propietarios");
  return { ok: true };
}

export async function generateOwnerPortalLinkAction(ownerId: string) {
  const u = await requireSession();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  const owner = await prisma.owner.findFirst({
    where: { id: ownerId, organizationId: u.organizationId, deletedAt: null },
  });
  if (!owner) return { ok: false, error: "NOT_FOUND" };

  const link = await generatePortalLink({
    organizationId: u.organizationId,
    kind: "OWNER",
    subjectId: ownerId,
    displayName: `${owner.firstName} ${owner.lastName}`,
    phone: owner.whatsapp ?? owner.phone ?? undefined,
    email: owner.email ?? undefined,
    baseUrl: `${protocol}://${host}`,
  });

  return { ok: true, link };
}
