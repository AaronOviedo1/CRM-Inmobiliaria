import { z } from "zod";
import { OfferKind, OfferPaymentMethod, OfferStatus, Currency } from "../enums";
import { cuid, money, moneyOpt, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const OfferCreateSchema = z
  .object({
    propertyId: cuid,
    leadId: cuid.optional(),
    clientId: cuid.optional(),
    offerKind: z.enum(ev(OfferKind)),
    offeredAmount: money,
    currency: z.enum(ev(Currency)).default("MXN"),
    offeredPaymentMethod: z.enum(ev(OfferPaymentMethod)),
    conditions: z.string().max(4000).optional(),
    apartadoAmount: moneyOpt,
    expiresAt: z.coerce.date().optional(),
    agentId: cuid,
  })
  .refine((v) => v.leadId || v.clientId, {
    message: "Asigná leadId o clientId",
    path: ["leadId"],
  });

export const OfferUpdateSchema = z.object({
  offerId: cuid,
  status: z.enum(ev(OfferStatus)).optional(),
  counterofferFromOwner: moneyOpt,
  conditions: z.string().max(4000).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const OfferFiltersSchema = pagination.extend({
  status: z.enum(ev(OfferStatus)).optional(),
  propertyId: cuid.optional(),
});
