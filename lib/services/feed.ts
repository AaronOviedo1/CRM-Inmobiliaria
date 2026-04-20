/// Generador de feeds XML para portales inmobiliarios.
///
/// Compatible con el formato de Inmuebles24 (y similares como Lamudi, Propiedades.com).
/// Las propiedades publicadas de la org se exportan con los campos mapeados.

import { prisma } from "../prisma";
import type { Property, Organization } from "@prisma/client";

type FeedProperty = Property & {
  images: Array<{ url: string; isCover: boolean }>;
};

export async function buildXmlFeed(
  org: Organization,
  properties: FeedProperty[],
): Promise<string> {
  const rows = properties
    .map((p) => propertyToXmlItem(p, org))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.inmuebles24.com/XMLSchema/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="3.0">
  <Header>
    <Provider>${xmlEsc(org.name)}</Provider>
    <ProviderURL>https://crm.${org.slug}.mx</ProviderURL>
    <LastModifiedDateTime>${new Date().toISOString()}</LastModifiedDateTime>
  </Header>
  <Listings>
${rows}
  </Listings>
</ListingDataFeed>`;
}

function propertyToXmlItem(p: FeedProperty, org: Organization): string {
  const price =
    p.transactionType === "RENTA"
      ? Number(p.priceRent ?? 0)
      : Number(p.priceSale ?? 0);
  const listingType =
    p.transactionType === "VENTA" || p.transactionType === "PREVENTA"
      ? "Sale"
      : "Rental";
  const coverImg = p.images.find((i) => i.isCover) ?? p.images[0];

  return `    <Listing>
      <ListingID>${xmlEsc(p.code)}</ListingID>
      <ModifiedDateTime>${p.updatedAt.toISOString()}</ModifiedDateTime>
      <ListingType>${listingType}</ListingType>
      <PropertyType>${mapCategory(p.category)}</PropertyType>
      <Title>${xmlEsc(p.title)}</Title>
      <Description>${xmlEsc(p.publicDescription ?? p.description)}</Description>
      <Price>${price}</Price>
      <Currency>${p.currency}</Currency>
      <Bedrooms>${p.bedrooms ?? 0}</Bedrooms>
      <Bathrooms>${p.bathrooms ?? 0}</Bathrooms>
      <ParkingSpaces>${p.parkingSpaces ?? 0}</ParkingSpaces>
      <TotalArea>${p.areaTotalM2 ?? 0}</TotalArea>
      <BuiltArea>${p.areaBuiltM2 ?? 0}</BuiltArea>
      <Address>
        <Neighborhood>${xmlEsc(p.neighborhood ?? "")}</Neighborhood>
        <City>${xmlEsc(p.city ?? "Hermosillo")}</City>
        <State>${xmlEsc(p.state ?? "Sonora")}</State>
        <Country>MX</Country>
        ${p.latitude ? `<Latitude>${p.latitude}</Latitude>` : ""}
        ${p.longitude ? `<Longitude>${p.longitude}</Longitude>` : ""}
      </Address>
      ${coverImg ? `<MainImage>${xmlEsc(coverImg.url)}</MainImage>` : ""}
      <ContactPhone>${xmlEsc(org.phone ?? "")}</ContactPhone>
      <ContactEmail>${xmlEsc(org.email ?? "")}</ContactEmail>
    </Listing>`;
}

function mapCategory(cat: string): string {
  const map: Record<string, string> = {
    CASA: "house",
    DEPARTAMENTO: "apartment",
    TOWNHOUSE: "townhouse",
    TERRENO: "land",
    LOCAL_COMERCIAL: "commercial",
    OFICINA: "office",
    BODEGA: "warehouse",
    NAVE_INDUSTRIAL: "industrial",
    EDIFICIO: "building",
    RANCHO: "ranch",
    OTRO: "other",
  };
  return map[cat] ?? "other";
}

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function getPublishedPropertiesForFeed(organizationId: string) {
  return prisma.property.findMany({
    where: {
      organizationId,
      status: "DISPONIBLE",
      deletedAt: null,
    },
    include: {
      images: { where: { isPublic: true }, orderBy: { order: "asc" } },
    },
  });
}
