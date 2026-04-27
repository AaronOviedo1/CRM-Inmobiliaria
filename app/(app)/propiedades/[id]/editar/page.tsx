import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  PropertyWizard,
  type PropertyWizardInitial,
} from "@/components/property/property-wizard";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  // Prisma Decimal
  if (typeof v === "object" && v !== null && "toNumber" in v) {
    return (v as { toNumber: () => number }).toNumber();
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const extractCommission = (notes: string | null): number | null => {
  if (!notes) return null;
  const m = notes.match(/Comisión acordada:\s*([\d.]+)\s*%/i);
  return m ? Number(m[1]) : null;
};

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const property = await prisma.property.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });
  if (!property) notFound();

  const initial: PropertyWizardInitial = {
    id: property.id,
    title: property.title,
    description: property.description,
    transactionType: property.transactionType,
    category: property.category,
    priceSale: toNum(property.priceSale),
    priceRent: toNum(property.priceRent),
    maintenanceFee: toNum(property.maintenanceFee),
    commissionPct: extractCommission(property.internalNotes),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkingSpaces: property.parkingSpaces,
    areaTotalM2: toNum(property.areaTotalM2),
    areaBuiltM2: toNum(property.areaBuiltM2),
    conservation: property.conservation,
    isFurnished: property.isFurnished,
    acceptsPets: property.acceptsPets,
    amenities: property.amenities ?? [],
    zone: property.neighborhood,
    addressStreet: property.addressStreet,
    addressNumber: property.addressNumber,
    postalCode: property.postalCode,
    latitude: toNum(property.latitude),
    longitude: toNum(property.longitude),
    hideExactAddress: property.hideExactAddress,
    virtualTourUrl: property.virtualTourUrl,
    images: property.images.map((img) => ({ url: img.url })),
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/propiedades/${property.id}`}>
          <ArrowLeft className="h-4 w-4" /> Volver al detalle
        </Link>
      </Button>
      <PageHeader
        eyebrow={property.code}
        title={`Editar ${property.title}`}
        description="Los cambios se aplican al confirmar."
      />
      <PropertyWizard initial={initial} />
    </div>
  );
}
