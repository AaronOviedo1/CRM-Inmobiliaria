import { z } from "zod";
import {
  PropertyCategory,
  TransactionType,
  PropertyStatus,
  ConservationState,
  Currency,
  PropertyDocumentType,
} from "../enums";
import { money, moneyOpt, cuid, pagination } from "./common";

const enumValues = <T extends object>(e: T) =>
  Object.values(e) as [string, ...string[]];

export const PropertyCreateSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(10).max(8000),
  transactionType: z.enum(enumValues(TransactionType)),
  category: z.enum(enumValues(PropertyCategory)),
  subcategory: z.string().max(80).optional(),

  priceSale: moneyOpt,
  priceRent: moneyOpt,
  maintenanceFee: moneyOpt,
  currency: z.enum(enumValues(Currency)).default("MXN"),

  areaTotalM2: moneyOpt,
  areaBuiltM2: moneyOpt,
  bedrooms: z.coerce.number().int().min(0).max(30).optional(),
  bathrooms: z.coerce.number().int().min(0).max(30).optional(),
  halfBathrooms: z.coerce.number().int().min(0).max(30).optional(),
  parkingSpaces: z.coerce.number().int().min(0).max(30).optional(),
  floors: z.coerce.number().int().min(0).max(80).optional(),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional(),

  isFurnished: z.boolean().default(false),
  acceptsPets: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasStudy: z.boolean().default(false),
  hasServiceRoom: z.boolean().default(false),
  amenities: z.array(z.string().max(60)).max(50).default([]),
  conservation: z.enum(enumValues(ConservationState)).optional(),

  addressStreet: z.string().max(120).optional(),
  addressNumber: z.string().max(30).optional(),
  addressInterior: z.string().max(30).optional(),
  neighborhood: z.string().max(80).optional(),
  city: z.string().max(80).default("Hermosillo"),
  state: z.string().max(80).default("Sonora"),
  postalCode: z.string().max(10).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  hideExactAddress: z.boolean().default(true),

  videoUrl: z.string().url().optional(),
  virtualTourUrl: z.string().url().optional(),

  ownerId: cuid,
  assignedAgentId: cuid.optional(),
  internalNotes: z.string().max(4000).optional(),
  publicDescription: z.string().max(4000).optional(),
});

export type PropertyCreateInput = z.infer<typeof PropertyCreateSchema>;

export const PropertyUpdateSchema = PropertyCreateSchema.partial();
export type PropertyUpdateInput = z.infer<typeof PropertyUpdateSchema>;

export const PropertyStatusChangeSchema = z.object({
  status: z.enum(enumValues(PropertyStatus)),
  reason: z.string().max(400).optional(),
});
export type PropertyStatusChangeInput = z.infer<typeof PropertyStatusChangeSchema>;

export const PropertyFiltersSchema = pagination.extend({
  q: z.string().max(120).optional(),
  status: z.enum(enumValues(PropertyStatus)).optional(),
  category: z.enum(enumValues(PropertyCategory)).optional(),
  transactionType: z.enum(enumValues(TransactionType)).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minBedrooms: z.coerce.number().int().min(0).optional(),
  city: z.string().max(80).optional(),
  neighborhood: z.string().max(80).optional(),
  assignedAgentId: cuid.optional(),
  ownerId: cuid.optional(),
  includeArchived: z.coerce.boolean().default(false),
});
export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;

export const PropertyImageReorderSchema = z.object({
  propertyId: cuid,
  orderedImageIds: z.array(cuid).min(1).max(50),
});

export const PropertyImageAddSchema = z.object({
  propertyId: cuid,
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  altText: z.string().max(200).optional(),
  isPublic: z.boolean().default(true),
});

export const PropertyDocumentAddSchema = z.object({
  propertyId: cuid,
  label: z.string().min(1).max(120),
  url: z.string().url(),
  type: z.enum(enumValues(PropertyDocumentType)),
  isPublicToOwnerPortal: z.boolean().default(false),
});

export const BBoxSchema = z.object({
  neLat: z.coerce.number().min(-90).max(90),
  neLng: z.coerce.number().min(-180).max(180),
  swLat: z.coerce.number().min(-90).max(90),
  swLng: z.coerce.number().min(-180).max(180),
  status: z.enum(enumValues(PropertyStatus)).optional(),
});
