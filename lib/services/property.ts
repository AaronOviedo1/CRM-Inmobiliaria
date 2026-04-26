/// Lógica de negocio para propiedades: generación de código, slugs, geocoding, status.

import { prisma } from "../prisma";
import { geocode } from "./geocode";
import { audit } from "./audit";
import type { TenantContext } from "../prisma";
import type { PropertyCreateInput, PropertyUpdateInput } from "../validators/property";
import { AuditAction } from "../enums";
import type { PropertyStatus as PropertyStatusType } from "../enums";
import {
  canTransitionPropertyStatus,
  PropertyStatusTransitionError,
} from "../workflows/property-status";

function buildSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function resolveSlug(organizationId: string, base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const existing = await prisma.property.findFirst({
      where: {
        organizationId,
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        deletedAt: null,
      },
    });
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

async function nextCode(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INM-${year}-`;
  const last = await prisma.property.findFirst({
    where: { organizationId, code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });
  const next = last ? parseInt(last.code.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function createProperty(
  ctx: TenantContext,
  input: PropertyCreateInput,
): Promise<string> {
  const code = await nextCode(ctx.organizationId);
  const slug = await resolveSlug(ctx.organizationId, buildSlug(input.title));

  let lat = input.latitude;
  let lng = input.longitude;

  if (!lat || !lng) {
    const addrParts = [
      input.addressStreet,
      input.addressNumber,
      input.neighborhood,
      input.city,
      input.state,
      "México",
    ]
      .filter(Boolean)
      .join(", ");
    const geo = await geocode(addrParts).catch(() => null);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  const property = await prisma.property.create({
    data: {
      organizationId: ctx.organizationId,
      code,
      slug,
      title: input.title,
      description: input.description,
      transactionType: input.transactionType as any,
      category: input.category as any,
      subcategory: input.subcategory,
      status: "BORRADOR",
      priceSale: input.priceSale,
      priceRent: input.priceRent,
      maintenanceFee: input.maintenanceFee,
      currency: (input.currency as any) ?? "MXN",
      areaTotalM2: input.areaTotalM2,
      areaBuiltM2: input.areaBuiltM2,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      halfBathrooms: input.halfBathrooms,
      parkingSpaces: input.parkingSpaces,
      floors: input.floors,
      yearBuilt: input.yearBuilt,
      isFurnished: input.isFurnished ?? false,
      acceptsPets: input.acceptsPets ?? false,
      hasPool: input.hasPool ?? false,
      hasGarden: input.hasGarden ?? false,
      hasStudy: input.hasStudy ?? false,
      hasServiceRoom: input.hasServiceRoom ?? false,
      amenities: input.amenities ?? [],
      conservation: input.conservation as any,
      addressStreet: input.addressStreet,
      addressNumber: input.addressNumber,
      addressInterior: input.addressInterior,
      neighborhood: input.neighborhood,
      city: input.city ?? "Hermosillo",
      state: input.state ?? "Sonora",
      postalCode: input.postalCode,
      latitude: lat,
      longitude: lng,
      hideExactAddress: input.hideExactAddress ?? true,
      videoUrl: input.videoUrl,
      virtualTourUrl: input.virtualTourUrl,
      ownerId: input.ownerId,
      assignedAgentId: input.assignedAgentId,
      internalNotes: input.internalNotes,
      publicDescription: input.publicDescription,
    },
  });

  await audit(ctx, {
    entity: "Property",
    entityId: property.id,
    action: AuditAction.CREATE,
  });

  return property.id;
}

export async function updateProperty(
  ctx: TenantContext,
  propertyId: string,
  input: PropertyUpdateInput,
): Promise<void> {
  const before = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: ctx.organizationId },
  });
  if (!before) throw new Error("PROPERTY_NOT_FOUND");

  let slug = before.slug;
  if (input.title && input.title !== before.title) {
    slug = await resolveSlug(ctx.organizationId, buildSlug(input.title), propertyId);
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { ...input, slug } as any,
  });

  await audit(ctx, {
    entity: "Property",
    entityId: propertyId,
    action: AuditAction.UPDATE,
    changes: buildChanges(before, input),
  });
}

export async function changePropertyStatus(
  ctx: TenantContext,
  propertyId: string,
  status: string,
  reason?: string,
): Promise<void> {
  const before = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: ctx.organizationId },
  });
  if (!before) throw new Error("PROPERTY_NOT_FOUND");

  const from = before.status as PropertyStatusType;
  const to = status as PropertyStatusType;
  if (!canTransitionPropertyStatus(from, to)) {
    throw new PropertyStatusTransitionError(from, to);
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { status: status as any },
  });

  await audit(ctx, {
    entity: "Property",
    entityId: propertyId,
    action: AuditAction.STATUS_CHANGE,
    changes: { status: { from: before.status, to: status }, reason },
  });
}

export async function archiveProperty(ctx: TenantContext, propertyId: string) {
  await changePropertyStatus(ctx, propertyId, "ARCHIVADA");
  await prisma.property.update({
    where: { id: propertyId },
    data: { deletedAt: new Date() },
  });
}

export async function reorderImages(
  ctx: TenantContext,
  propertyId: string,
  orderedImageIds: string[],
) {
  const prop = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: ctx.organizationId },
  });
  if (!prop) throw new Error("PROPERTY_NOT_FOUND");

  await prisma.$transaction(
    orderedImageIds.map((imgId, idx) =>
      prisma.propertyImage.update({
        where: { id: imgId, propertyId },
        data: { order: idx, isCover: idx === 0 },
      }),
    ),
  );
  await prisma.property.update({
    where: { id: propertyId },
    data: { coverImageUrl: undefined },
  });
}

export async function publishToPortals(
  ctx: TenantContext,
  propertyId: string,
  portals: string[],
) {
  await prisma.property.update({
    where: { id: propertyId, organizationId: ctx.organizationId },
    data: {
      publishedToPortals: portals,
      publishedAt: new Date(),
      status: "DISPONIBLE",
    },
  });
  await audit(ctx, {
    entity: "Property",
    entityId: propertyId,
    action: AuditAction.UPDATE,
    changes: { publishedToPortals: portals },
  });
}

function buildChanges(before: any, after: any) {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of Object.keys(after)) {
    if (JSON.stringify(before[k]) !== JSON.stringify((after as any)[k])) {
      out[k] = { from: before[k], to: (after as any)[k] };
    }
  }
  return out;
}
