import { z } from "zod";

export const cuid = z.string().min(1);
export const uuid = z.string().uuid();

export const phoneMx = z
  .string()
  .trim()
  .regex(/^[+0-9()\- ]{8,20}$/, "Teléfono inválido")
  .transform((s) => s.replace(/[^\d+]/g, ""));

export const email = z.string().trim().toLowerCase().email();
export const emailOpt = email.optional().or(z.literal("").transform(() => undefined));

export const money = z.coerce
  .number()
  .positive()
  .max(999_999_999.99);

export const moneyOpt = z.coerce.number().nonnegative().max(999_999_999.99).optional();

export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const slug = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9-]+$/, "slug inválido");

export const isoDate = z.coerce.date();

/** UTM params que arrastramos en leads. */
export const utm = z.object({
  utmCampaign: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmContent: z.string().max(120).optional(),
});

export const honeypot = z.object({
  /** Campo oculto en formularios públicos — si viene llenado, es bot. */
  website: z.string().max(0, "bot").optional(),
});
