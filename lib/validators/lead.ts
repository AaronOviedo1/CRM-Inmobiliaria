import { z } from "zod";
import {
  LeadIntent,
  LeadSource,
  LeadStatus,
  ContactChannel,
  ContactTime,
  PropertyCategory,
  Currency,
} from "../enums";
import { cuid, email, phoneMx, utm, honeypot, pagination, moneyOpt } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const LeadCreateSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: email.optional(),
    phone: phoneMx.optional(),
    whatsapp: phoneMx.optional(),
    preferredContactChannel: z.enum(ev(ContactChannel)).default("WHATSAPP"),
    preferredContactTime: z.enum(ev(ContactTime)).default("ANYTIME"),
    intent: z.enum(ev(LeadIntent)),
    propertyTypeInterests: z
      .array(z.enum(ev(PropertyCategory)))
      .max(20)
      .default([]),
    budgetMin: moneyOpt,
    budgetMax: moneyOpt,
    currency: z.enum(ev(Currency)).default("MXN"),
    desiredZones: z.array(z.string().max(80)).max(30).default([]),
    minBedrooms: z.coerce.number().int().min(0).max(20).optional(),
    minBathrooms: z.coerce.number().int().min(0).max(20).optional(),
    minParkingSpaces: z.coerce.number().int().min(0).max(20).optional(),
    minAreaM2: z.coerce.number().int().min(0).max(100000).optional(),
    mustHaves: z.array(z.string().max(60)).max(20).default([]),
    niceToHaves: z.array(z.string().max(60)).max(20).default([]),
    source: z.enum(ev(LeadSource)),
    sourceDetail: z.string().max(200).optional(),
    notes: z.string().max(4000).optional(),
    assignedAgentId: cuid.optional(),
  })
  .merge(utm)
  .refine((v) => v.email || v.phone || v.whatsapp, {
    message: "Al menos un canal de contacto es requerido",
    path: ["email"],
  })
  .refine((v) => (v.budgetMin && v.budgetMax ? v.budgetMin <= v.budgetMax : true), {
    message: "budgetMin no puede superar budgetMax",
    path: ["budgetMin"],
  });

export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;

export const LeadUpdateSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  email: email.optional(),
  phone: phoneMx.optional(),
  whatsapp: phoneMx.optional(),
  preferredContactChannel: z.enum(ev(ContactChannel)).optional(),
  preferredContactTime: z.enum(ev(ContactTime)).optional(),
  intent: z.enum(ev(LeadIntent)).optional(),
  propertyTypeInterests: z.array(z.enum(ev(PropertyCategory))).max(20).optional(),
  budgetMin: moneyOpt,
  budgetMax: moneyOpt,
  currency: z.enum(ev(Currency)).optional(),
  desiredZones: z.array(z.string().max(80)).max(30).optional(),
  minBedrooms: z.coerce.number().int().min(0).max(20).optional(),
  minBathrooms: z.coerce.number().int().min(0).max(20).optional(),
  minAreaM2: z.coerce.number().int().min(0).max(100000).optional(),
  mustHaves: z.array(z.string().max(60)).max(20).optional(),
  niceToHaves: z.array(z.string().max(60)).max(20).optional(),
  notes: z.string().max(4000).optional(),
  nextFollowUpAt: z.coerce.date().optional(),
});

export const LeadMoveStatusSchema = z.object({
  status: z.enum(ev(LeadStatus)),
  note: z.string().max(1000).optional(),
  lostReason: z.string().max(120).optional(),
  lostReasonDetail: z.string().max(1000).optional(),
});

export const LeadAssignSchema = z.object({
  agentId: cuid,
});

export const LeadFiltersSchema = pagination.extend({
  q: z.string().max(120).optional(),
  status: z.enum(ev(LeadStatus)).optional(),
  source: z.enum(ev(LeadSource)).optional(),
  intent: z.enum(ev(LeadIntent)).optional(),
  assignedAgentId: cuid.optional(),
  /** lead con followup vencido hasta hoy */
  followupOverdue: z.coerce.boolean().optional(),
});
export type LeadFiltersInput = z.infer<typeof LeadFiltersSchema>;

export const PublicLeadFormSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: email.optional(),
    phone: phoneMx.optional(),
    whatsapp: phoneMx.optional(),
    intent: z.enum(ev(LeadIntent)),
    budgetMin: moneyOpt,
    budgetMax: moneyOpt,
    desiredZones: z.array(z.string().max(80)).max(30).default([]),
    mustHaves: z.array(z.string().max(60)).max(20).default([]),
    notes: z.string().max(4000).optional(),
    source: z.enum(ev(LeadSource)).default("WEBSITE"),
    propertyId: cuid.optional(),
    utmCampaign: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmContent: z.string().max(120).optional(),
    recaptchaToken: z.string().optional(),
  })
  .merge(honeypot)
  .refine((v) => v.email || v.phone || v.whatsapp, {
    message: "Al menos un canal de contacto es requerido",
    path: ["email"],
  });
