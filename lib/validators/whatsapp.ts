import { z } from "zod";
import {
  WhatsappTemplateCategory,
  WhatsappTemplateStatus,
  WhatsappHeaderMediaType,
} from "@prisma/client";
import { cuid } from "./common";

const ev = <T extends object>(e: T) => Object.values(e) as [string, ...string[]];

export const WhatsappAccountUpsertSchema = z.object({
  phoneNumberId: z.string().min(5).max(60),
  wabaId: z.string().max(60).optional(),
  displayPhoneNumber: z.string().max(30).optional(),
  accessToken: z.string().min(20),
});

export const WhatsappTemplateCreateSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Sólo minúsculas, números y guión bajo"),
  category: z.enum(ev(WhatsappTemplateCategory)),
  language: z.string().default("es_MX"),
  headerMediaType: z.enum(ev(WhatsappHeaderMediaType)).default("NONE"),
  headerText: z.string().max(60).optional(),
  bodyText: z.string().min(1).max(1024),
  footerText: z.string().max(60).optional(),
  variables: z.array(z.string().min(1).max(40)).max(10).default([]),
});

export const WhatsappTemplateUpdateSchema = z.object({
  templateId: cuid,
  status: z.enum(ev(WhatsappTemplateStatus)).optional(),
  bodyText: z.string().min(1).max(1024).optional(),
  footerText: z.string().max(60).optional(),
});

export const WhatsappSendSchema = z.object({
  /** 'lead', 'client', 'owner' — el servicio resolverá el target */
  contactType: z.enum(["lead", "client", "owner"]),
  contactId: cuid,
  templateName: z.string().min(1),
  variables: z.record(z.string(), z.string()).default({}),
  headerImageUrl: z.string().url().optional(),
});

export const WhatsappFreeformSendSchema = z.object({
  contactType: z.enum(["lead", "client", "owner"]),
  contactId: cuid,
  text: z.string().min(1).max(4096),
});
