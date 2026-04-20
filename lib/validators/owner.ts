import { z } from "zod";
import { ContactChannel } from "../enums";
import { cuid, email, phoneMx, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const OwnerCreateSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  rfc: z.string().trim().toUpperCase().max(13).optional(),
  email: email.optional(),
  phone: phoneMx.optional(),
  whatsapp: phoneMx.optional(),
  preferredContactChannel: z.enum(ev(ContactChannel)).default("WHATSAPP"),
  addressLine: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  postalCode: z.string().max(10).optional(),
  bankName: z.string().max(80).optional(),
  accountLast4: z
    .string()
    .regex(/^\d{4}$/, "Sólo 4 dígitos")
    .optional(),
  notes: z.string().max(4000).optional(),
});

export const OwnerUpdateSchema = OwnerCreateSchema.partial();

export const OwnerFiltersSchema = pagination.extend({
  q: z.string().max(120).optional(),
});
