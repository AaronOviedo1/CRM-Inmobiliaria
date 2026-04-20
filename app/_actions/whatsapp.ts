"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { upsertWhatsappAccount, sendTemplate, sendFreeformText } from "@/lib/services/whatsapp";
import { prisma } from "@/lib/prisma";
import {
  WhatsappAccountUpsertSchema,
  WhatsappSendSchema,
  WhatsappFreeformSendSchema,
} from "@/lib/validators/whatsapp";

export async function connectWhatsappAction(rawInput: unknown) {
  const u = await requireRole("AGENCY_ADMIN");
  const input = WhatsappAccountUpsertSchema.parse(rawInput);

  await upsertWhatsappAccount({
    organizationId: u.organizationId,
    ...input,
  });

  revalidatePath("/ajustes");
  return { ok: true };
}

export async function sendWhatsappTemplateAction(rawInput: unknown) {
  const u = await requireRole("AGENT");
  const input = WhatsappSendSchema.parse(rawInput);

  const phone = await resolveContactPhone(
    u.organizationId,
    input.contactType,
    input.contactId,
  );
  if (!phone) return { ok: false, error: "NO_PHONE" };

  return sendTemplate({
    organizationId: u.organizationId,
    toPhone: phone,
    templateName: input.templateName,
    variables: Object.values(input.variables),
    headerImageUrl: input.headerImageUrl,
  });
}

export async function sendWhatsappFreeformAction(rawInput: unknown) {
  const u = await requireRole("AGENT");
  const input = WhatsappFreeformSendSchema.parse(rawInput);

  const phone = await resolveContactPhone(
    u.organizationId,
    input.contactType,
    input.contactId,
  );
  if (!phone) return { ok: false, error: "NO_PHONE" };

  return sendFreeformText({
    organizationId: u.organizationId,
    toPhone: phone,
    text: input.text,
  });
}

async function resolveContactPhone(
  orgId: string,
  kind: "lead" | "client" | "owner",
  id: string,
): Promise<string | null> {
  if (kind === "lead") {
    const r = await prisma.lead.findFirst({ where: { id, organizationId: orgId } });
    return r?.whatsapp ?? r?.phone ?? null;
  }
  if (kind === "client") {
    const r = await prisma.client.findFirst({ where: { id, organizationId: orgId } });
    return r?.whatsapp ?? r?.phone ?? null;
  }
  const r = await prisma.owner.findFirst({ where: { id, organizationId: orgId } });
  return r?.whatsapp ?? r?.phone ?? null;
}
