"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireSession, requireRole } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { withTenant } from "@/lib/repos/tenant";
import {
  createProperty,
  updateProperty,
  changePropertyStatus,
  archiveProperty,
  reorderImages,
  publishToPortals,
} from "@/lib/services/property";
import { prisma } from "@/lib/prisma";
import {
  PropertyCreateSchema,
  PropertyUpdateSchema,
  PropertyStatusChangeSchema,
  PropertyImageReorderSchema,
  PropertyDocumentAddSchema,
  PropertyImageAddSchema,
} from "@/lib/validators/property";

// ---- Create -----------------------------------------------------------------

export async function createPropertyAction(rawInput: unknown) {
  const u = await requireSession();
  assertCan(u.role, "property.create");

  const input = PropertyCreateSchema.parse(rawInput);
  const id = await createProperty(
    { organizationId: u.organizationId, userId: u.id },
    input,
  );

  revalidatePath("/propiedades");
  revalidateTag(`org:${u.organizationId}:properties`);
  return { ok: true, id };
}

// ---- Update -----------------------------------------------------------------

export async function updatePropertyAction(
  propertyId: string,
  rawInput: unknown,
) {
  const u = await requireSession();
  const input = PropertyUpdateSchema.parse(rawInput);

  if (input.priceSale !== undefined || input.priceRent !== undefined) {
    assertCan(u.role, "property.edit_price");
  }

  await updateProperty(
    { organizationId: u.organizationId, userId: u.id },
    propertyId,
    input,
  );

  revalidatePath(`/propiedades/${propertyId}`);
  revalidatePath("/propiedades");
  return { ok: true };
}

// ---- Status change ----------------------------------------------------------

export async function changeStatusAction(
  propertyId: string,
  rawInput: unknown,
) {
  const u = await requireSession();
  assertCan(u.role, "property.edit_status");

  const { status, reason } = PropertyStatusChangeSchema.parse(rawInput);
  await changePropertyStatus(
    { organizationId: u.organizationId, userId: u.id },
    propertyId,
    status,
    reason,
  );

  revalidatePath(`/propiedades/${propertyId}`);
  revalidatePath("/propiedades");
  return { ok: true };
}

// ---- Archive ----------------------------------------------------------------

export async function archivePropertyAction(propertyId: string) {
  const u = await requireRole("BROKER");
  assertCan(u.role, "property.delete");

  await archiveProperty({ organizationId: u.organizationId, userId: u.id }, propertyId);

  revalidatePath("/propiedades");
  return { ok: true };
}

// ---- Images -----------------------------------------------------------------

export async function reorderImagesAction(rawInput: unknown) {
  const u = await requireSession();
  const { propertyId, orderedImageIds } = PropertyImageReorderSchema.parse(rawInput);

  await reorderImages(
    { organizationId: u.organizationId, userId: u.id },
    propertyId,
    orderedImageIds,
  );

  revalidatePath(`/propiedades/${propertyId}`);
  return { ok: true };
}

export async function addImageAction(rawInput: unknown) {
  const u = await requireSession();
  const input = PropertyImageAddSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.propertyImage.create({
      data: {
        propertyId: input.propertyId,
        url: input.url,
        thumbnailUrl: input.thumbnailUrl,
        altText: input.altText,
        isPublic: input.isPublic ?? true,
        isCover: false,
      },
    }),
  );

  revalidatePath(`/propiedades/${input.propertyId}`);
  return { ok: true };
}

export async function deleteImageAction(imageId: string, propertyId: string) {
  const u = await requireSession();

  const img = await prisma.propertyImage.findUnique({ where: { id: imageId } });
  if (!img) return { ok: false, error: "NOT_FOUND" };

  const prop = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: u.organizationId },
  });
  if (!prop) return { ok: false, error: "FORBIDDEN" };

  await prisma.propertyImage.delete({ where: { id: imageId } });
  revalidatePath(`/propiedades/${propertyId}`);
  return { ok: true };
}

export async function setCoverImageAction(imageId: string, propertyId: string) {
  const u = await requireSession();

  const prop = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: u.organizationId },
  });
  if (!prop) return { ok: false, error: "FORBIDDEN" };

  await prisma.$transaction([
    prisma.propertyImage.updateMany({
      where: { propertyId },
      data: { isCover: false },
    }),
    prisma.propertyImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  revalidatePath(`/propiedades/${propertyId}`);
  return { ok: true };
}

// ---- Documents --------------------------------------------------------------

export async function addDocumentAction(rawInput: unknown) {
  const u = await requireSession();
  const input = PropertyDocumentAddSchema.parse(rawInput);

  const prop = await prisma.property.findFirst({
    where: { id: input.propertyId, organizationId: u.organizationId },
  });
  if (!prop) return { ok: false, error: "FORBIDDEN" };

  await prisma.propertyDocument.create({
    data: {
      propertyId: input.propertyId,
      label: input.label,
      url: input.url,
      type: input.type as any,
      isPublicToOwnerPortal: input.isPublicToOwnerPortal,
    },
  });

  revalidatePath(`/propiedades/${input.propertyId}/documentos`);
  return { ok: true };
}

// ---- Portals ----------------------------------------------------------------

export async function publishToPortalsAction(
  propertyId: string,
  portals: string[],
) {
  const u = await requireRole("BROKER");

  await publishToPortals(
    { organizationId: u.organizationId, userId: u.id },
    propertyId,
    portals,
  );

  revalidatePath(`/propiedades/${propertyId}`);
  return { ok: true };
}

export async function unpublishAction(propertyId: string) {
  const u = await requireRole("BROKER");
  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.property.update({
      where: { id: propertyId },
      data: { publishedToPortals: [], publishedAt: null },
    }),
  );
  revalidatePath(`/propiedades/${propertyId}`);
  return { ok: true };
}
