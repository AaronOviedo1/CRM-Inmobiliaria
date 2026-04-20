import { z } from "zod";
import { InteractionKind, InteractionDirection } from "../enums";
import { cuid, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const InteractionCreateSchema = z
  .object({
    kind: z.enum(ev(InteractionKind)),
    direction: z.enum(ev(InteractionDirection)).default("SALIENTE"),
    summary: z.string().min(1).max(240),
    body: z.string().max(8000).optional(),
    occurredAt: z.coerce.date().default(() => new Date()),
    durationSeconds: z.coerce.number().int().min(0).max(86400).optional(),
    relatedLeadId: cuid.optional(),
    relatedClientId: cuid.optional(),
    relatedOwnerId: cuid.optional(),
    relatedPropertyId: cuid.optional(),
    attachments: z.array(z.string().url()).max(10).default([]),
    channelMessageId: z.string().max(200).optional(),
  })
  .refine(
    (v) =>
      v.relatedLeadId || v.relatedClientId || v.relatedOwnerId || v.relatedPropertyId,
    { message: "Relacioná la interacción a algún contacto o propiedad", path: ["relatedLeadId"] },
  );

export const InteractionFiltersSchema = pagination.extend({
  kind: z.enum(ev(InteractionKind)).optional(),
  leadId: cuid.optional(),
  clientId: cuid.optional(),
  ownerId: cuid.optional(),
  propertyId: cuid.optional(),
});
