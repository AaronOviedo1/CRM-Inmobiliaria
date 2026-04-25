/// PATCH /api/properties/[id] — edita una propiedad desde el wizard.
/// Acepta el mismo payload que POST /api/properties pero con todos los
/// campos opcionales. Sincroniza imágenes: reemplaza el set completo por
/// el que llega en el body.

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PropertyWizardCreateSchema } from "@/lib/validators/property";
import { slugify } from "@/lib/mock/seed";

const PropertyWizardPatchSchema = PropertyWizardCreateSchema.partial();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = PropertyWizardPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const existing = await prisma.property.findFirst({
    where: { id, organizationId: user.organizationId, deletedAt: null },
    select: { id: true, title: true, slug: true, code: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description || " ";
  if (input.transactionType !== undefined) data.transactionType = input.transactionType;
  if (input.category !== undefined) data.category = input.category;
  if (input.priceSale !== undefined) data.priceSale = input.priceSale ?? null;
  if (input.priceRent !== undefined) data.priceRent = input.priceRent ?? null;
  if (input.maintenanceFee !== undefined) data.maintenanceFee = input.maintenanceFee ?? null;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.areaTotalM2 !== undefined) data.areaTotalM2 = input.areaTotalM2 ?? null;
  if (input.areaBuiltM2 !== undefined) data.areaBuiltM2 = input.areaBuiltM2 ?? null;
  if (input.bedrooms !== undefined) data.bedrooms = input.bedrooms ?? null;
  if (input.bathrooms !== undefined) data.bathrooms = input.bathrooms ?? null;
  if (input.parkingSpaces !== undefined) data.parkingSpaces = input.parkingSpaces ?? null;
  if (input.conservation !== undefined) data.conservation = input.conservation ?? null;
  if (input.isFurnished !== undefined) data.isFurnished = input.isFurnished;
  if (input.acceptsPets !== undefined) data.acceptsPets = input.acceptsPets;
  if (input.amenities !== undefined) data.amenities = input.amenities;
  if (input.zone !== undefined) data.neighborhood = input.zone ?? null;
  if (input.addressStreet !== undefined) data.addressStreet = input.addressStreet ?? null;
  if (input.addressNumber !== undefined) data.addressNumber = input.addressNumber ?? null;
  if (input.postalCode !== undefined) data.postalCode = input.postalCode ?? null;
  if (input.latitude !== undefined) data.latitude = input.latitude ?? null;
  if (input.longitude !== undefined) data.longitude = input.longitude ?? null;
  if (input.hideExactAddress !== undefined) data.hideExactAddress = input.hideExactAddress;
  if (input.virtualTourUrl !== undefined) data.virtualTourUrl = input.virtualTourUrl ?? null;
  if (input.commission != null) {
    data.internalNotes = `Comisión acordada: ${input.commission}%`;
  }

  if (input.title && input.title !== existing.title) {
    data.slug = slugify(`${input.title}-${existing.code}`);
  }

  if (input.images !== undefined) {
    data.coverImageUrl = input.images[0]?.url ?? null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.property.update({ where: { id }, data });

    if (input.images !== undefined) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
      if (input.images.length > 0) {
        await tx.propertyImage.createMany({
          data: input.images.map((img, i) => ({
            propertyId: id,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl ?? null,
            order: i,
            isCover: i === 0,
            isPublic: true,
          })),
        });
      }
    }
  });

  revalidatePath(`/propiedades/${id}`);
  revalidatePath("/propiedades");

  return NextResponse.json({ ok: true, id });
}
