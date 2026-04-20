/// Cliente para WhatsApp Cloud API (Meta) + lógica de inbound/outbound.
///
/// Flujo inbound:
///   POST /api/webhooks/whatsapp → parseWhatsappWebhook → resolveContact → recordInteraction.
///
/// Flujo outbound:
///   sendTemplate({ orgId, toPhone, templateName, variables, headerImageUrl? })
///
/// Seguridad:
///   - Cada org tiene su propio accessToken cifrado en DB (WhatsappAccount).
///   - Signature del webhook validada con WHATSAPP_APP_SECRET.

import { prisma } from "../prisma";
import { env } from "../env";
import { createHmac, timingSafeEqual } from "node:crypto";
import { decryptSecret, encryptSecret } from "./crypto";
import type { WhatsappAccount, WhatsappTemplate } from "@prisma/client";

const GRAPH = "https://graph.facebook.com/v21.0";

// ---------------------------------------------------------------------------
// Outbound
// ---------------------------------------------------------------------------

export type SendTemplateInput = {
  organizationId: string;
  toPhone: string;
  templateName: string;
  language?: string;
  variables?: string[];
  headerImageUrl?: string;
};

export async function sendTemplate(input: SendTemplateInput): Promise<
  { ok: true; messageId: string } | { ok: false; reason: string }
> {
  const acct = await prisma.whatsappAccount.findUnique({
    where: { organizationId: input.organizationId },
  });
  if (!acct || !acct.isActive) {
    return { ok: false, reason: "WHATSAPP_NOT_CONNECTED" };
  }
  const token = safeDecrypt(acct.accessTokenEncrypted);
  if (!token) return { ok: false, reason: "BAD_TOKEN_ENCRYPTION" };

  const tpl = await prisma.whatsappTemplate.findFirst({
    where: {
      organizationId: input.organizationId,
      name: input.templateName,
      language: input.language ?? "es_MX",
      status: "APPROVED",
    },
  });
  if (!tpl) return { ok: false, reason: "TEMPLATE_NOT_APPROVED" };

  const components = buildTemplateComponents(tpl, input.variables ?? [], input.headerImageUrl);
  const body = {
    messaging_product: "whatsapp",
    to: digitsOnly(input.toPhone),
    type: "template",
    template: {
      name: tpl.name,
      language: { code: tpl.language },
      components,
    },
  };

  const r = await fetch(`${GRAPH}/${acct.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await r.json().catch(() => ({}))) as any;
  if (!r.ok) {
    console.error("[whatsapp] send failed:", data);
    return { ok: false, reason: data.error?.message ?? `HTTP ${r.status}` };
  }
  await prisma.whatsappAccount.update({
    where: { id: acct.id },
    data: { lastMessageAt: new Date() },
  });
  return { ok: true, messageId: data.messages?.[0]?.id ?? "unknown" };
}

/** Mensaje freeform (sólo válido dentro de la ventana de 24h desde último inbound). */
export async function sendFreeformText(p: {
  organizationId: string;
  toPhone: string;
  text: string;
}): Promise<{ ok: true; messageId: string } | { ok: false; reason: string }> {
  const acct = await prisma.whatsappAccount.findUnique({
    where: { organizationId: p.organizationId },
  });
  if (!acct || !acct.isActive) return { ok: false, reason: "WHATSAPP_NOT_CONNECTED" };
  const token = safeDecrypt(acct.accessTokenEncrypted);
  if (!token) return { ok: false, reason: "BAD_TOKEN_ENCRYPTION" };

  const r = await fetch(`${GRAPH}/${acct.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: digitsOnly(p.toPhone),
      type: "text",
      text: { body: p.text },
    }),
  });
  const data = (await r.json().catch(() => ({}))) as any;
  if (!r.ok) return { ok: false, reason: data.error?.message ?? `HTTP ${r.status}` };
  return { ok: true, messageId: data.messages?.[0]?.id ?? "unknown" };
}

function buildTemplateComponents(
  tpl: WhatsappTemplate,
  variables: string[],
  headerImageUrl?: string,
) {
  const components: any[] = [];
  if (tpl.headerMediaType === "IMAGE" && headerImageUrl) {
    components.push({
      type: "header",
      parameters: [{ type: "image", image: { link: headerImageUrl } }],
    });
  }
  if (variables.length > 0) {
    components.push({
      type: "body",
      parameters: variables.map((v) => ({ type: "text", text: v })),
    });
  }
  return components;
}

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

function safeDecrypt(ct: string): string | null {
  try {
    return decryptSecret(ct);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Credentials management
// ---------------------------------------------------------------------------

export async function upsertWhatsappAccount(input: {
  organizationId: string;
  phoneNumberId: string;
  wabaId?: string;
  displayPhoneNumber?: string;
  accessToken: string;
}): Promise<WhatsappAccount> {
  const encrypted = encryptSecret(input.accessToken);
  const webhookVerifyToken = generateVerifyToken();
  return prisma.whatsappAccount.upsert({
    where: { organizationId: input.organizationId },
    create: {
      organizationId: input.organizationId,
      phoneNumberId: input.phoneNumberId,
      wabaId: input.wabaId,
      displayPhoneNumber: input.displayPhoneNumber,
      accessTokenEncrypted: encrypted,
      webhookVerifyToken,
    },
    update: {
      phoneNumberId: input.phoneNumberId,
      wabaId: input.wabaId,
      displayPhoneNumber: input.displayPhoneNumber,
      accessTokenEncrypted: encrypted,
      isActive: true,
    },
  });
}

function generateVerifyToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ---------------------------------------------------------------------------
// Inbound (webhook)
// ---------------------------------------------------------------------------

/**
 * Valida la firma HMAC-SHA256 del payload con WHATSAPP_APP_SECRET.
 * Meta envía `X-Hub-Signature-256: sha256=<hex>`.
 */
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!env.whatsappAppSecret || !signatureHeader) return false;
  const expected = "sha256=" + createHmac("sha256", env.whatsappAppSecret).update(rawBody).digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type ParsedInboundMessage = {
  fromPhone: string;
  messageId: string;
  timestamp: Date;
  body: string;
  phoneNumberId: string;
  wabaId?: string;
  mediaIds?: string[];
};

/** Parsea el payload de Meta. Meta envía lotes; este devuelve un array plano. */
export function parseWhatsappWebhook(payload: any): ParsedInboundMessage[] {
  const out: ParsedInboundMessage[] = [];
  for (const entry of payload?.entry ?? []) {
    const wabaId = entry.id;
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      for (const m of value?.messages ?? []) {
        let body = "";
        const mediaIds: string[] = [];
        if (m.type === "text") body = m.text?.body ?? "";
        else if (m.type === "image") {
          body = m.image?.caption ?? "[imagen]";
          if (m.image?.id) mediaIds.push(m.image.id);
        } else if (m.type === "document") {
          body = m.document?.caption ?? "[documento]";
          if (m.document?.id) mediaIds.push(m.document.id);
        } else if (m.type === "button") {
          body = m.button?.text ?? "";
        } else if (m.type === "interactive") {
          body =
            m.interactive?.button_reply?.title ??
            m.interactive?.list_reply?.title ??
            "";
        } else {
          body = `[${m.type}]`;
        }
        out.push({
          fromPhone: m.from,
          messageId: m.id,
          timestamp: new Date(Number(m.timestamp) * 1000),
          body,
          phoneNumberId,
          wabaId,
          mediaIds: mediaIds.length ? mediaIds : undefined,
        });
      }
    }
  }
  return out;
}

/** Busca la org dueña del `phoneNumberId` (el pnid es único por WhatsApp Business). */
export async function orgByPhoneNumberId(pnid: string) {
  return prisma.whatsappAccount.findFirst({ where: { phoneNumberId: pnid } });
}
