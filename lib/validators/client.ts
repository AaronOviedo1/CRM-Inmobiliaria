import { z } from "zod";
import { ClientType } from "../enums";
import { cuid, email, phoneMx, pagination } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const ClientCreateSchema = z.object({
  type: z.enum(ev(ClientType)),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: email.optional(),
  phone: phoneMx.optional(),
  whatsapp: phoneMx.optional(),
  birthday: z.coerce.date().optional(),
  notes: z.string().max(4000).optional(),
  leadId: cuid.optional(),
});

export const ClientUpdateSchema = ClientCreateSchema.partial();

export const ClientFiltersSchema = pagination.extend({
  q: z.string().max(120).optional(),
  type: z.enum(ev(ClientType)).optional(),
});
