/// POST /api/properties — crea una propiedad desde el wizard.
/// El body ya incluye las URLs de Cloudinary (las imágenes se subieron antes
/// vía /api/upload/cloudinary-sign desde el cliente).

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PropertyWizardCreateSchema } from "@/lib/validators/property";
import { slugify } from "@/lib/mock/seed";
import { PropertyStatus, Currency } from "@/lib/enums";

function generateCode(organizationId: string) {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  const orgHint = organizationId.slice(-3).toUpperCase();
  return `INM-${orgHint}-${year}-${rand}`;
}

async function getOrCreateDefaultOwner(organizationId: string) {
  const existing = await prisma.owner.findFirst({
    where: { organizationId, firstName: "Sin", lastName: "asignar", deletedAt: null },
  });
  if (existing) return existing;
  return prisma.owner.create({
    data: {
      organizationId,
      firstName: "Sin",
      lastName: "asignar",
      email: null,
      phone: null,
      preferredContactChannel: "WHATSAPP",
      portalAccessEnabled: false,
    },
  });
}

export async function POST(req: Request) {
  const user = await requireSession();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = PropertyWizardCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validación fallida", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const owner = await getOrCreateDefaultOwner(user.organizationId);
  const code = generateCode(user.organizationId);
  const slug = slugify(`${input.title}-${code}`);

  const firstImageUrl = input.images[0]?.url ?? null;

  const property = await prisma.property.create({
    data: {
      organizationId: user.organizationId,
      code,
      title: input.title,
      slug,
      description: input.description || " ",
      transactionType: input.transactionType,
      category: input.category,
      status: PropertyStatus.BORRADOR,

      priceSale: input.priceSale ?? null,
      priceRent: input.priceRent ?? null,
      maintenanceFee: input.maintenanceFee ?? null,
      currency: input.currency ?? Currency.MXN,

      areaTotalM2: input.areaTotalM2 ?? null,
      areaBuiltM2: input.areaBuiltM2 ?? null,
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      parkingSpaces: input.parkingSpaces ?? null,
      conservation: input.conservation ?? null,

      isFurnished: input.isFurnished,
      acceptsPets: input.acceptsPets,
      amenities: input.amenities,

      addressStreet: input.addressStreet ?? null,
      addressNumber: input.addressNumber ?? null,
      neighborhood: input.zone ?? null,
      city: "Hermosillo",
      state: "Sonora",
      postalCode: input.postalCode ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      hideExactAddress: true,

      virtualTourUrl: input.virtualTourUrl ?? null,
      coverImageUrl: firstImageUrl,

      ownerId: owner.id,
      assignedAgentId: user.id,
      internalNotes:
        input.commission != null ? `Comisión acordada: ${input.commission}%` : null,

      publishedToPortals: [],
      viewsCount: 0,
      inquiriesCount: 0,

      images: {
        create: input.images.map((img, i) => ({
          url: img.url,
          thumbnailUrl: img.thumbnailUrl ?? null,
          order: i,
          isCover: i === 0,
          isPublic: true,
        })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(
    { id: property.id, slug: property.slug, code: property.code },
    { status: 201 },
  );
}
