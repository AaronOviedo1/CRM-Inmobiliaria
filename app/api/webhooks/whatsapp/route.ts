import { NextRequest, NextResponse } from "next/server";
import {
  verifyMetaSignature,
  parseWhatsappWebhook,
  orgByPhoneNumberId,
} from "@/lib/services/whatsapp";
import { prisma } from "@/lib/prisma";
import { prismaRawUnsafe } from "@/lib/repos/tenant";

/** GET: verificación del webhook en Meta Developer Console */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");

  if (mode === "subscribe" && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/** POST: mensajes entrantes */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, sig)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const messages = parseWhatsappWebhook(payload);

  for (const msg of messages) {
    try {
      const account = await orgByPhoneNumberId(msg.phoneNumberId);
      if (!account) continue;

      const orgId = account.organizationId;
      const db = prismaRawUnsafe();

      const digits = msg.fromPhone.replace(/\D+/g, "");

      const lead = await db.lead.findFirst({
        where: {
          organizationId: orgId,
          deletedAt: null,
          OR: [
            { phone: { contains: digits } },
            { whatsapp: { contains: digits } },
          ],
        },
      });
      const client = !lead
        ? await db.client.findFirst({
            where: {
              organizationId: orgId,
              deletedAt: null,
              OR: [
                { phone: { contains: digits } },
                { whatsapp: { contains: digits } },
              ],
            },
          })
        : null;
      const owner = !lead && !client
        ? await db.owner.findFirst({
            where: {
              organizationId: orgId,
              deletedAt: null,
              OR: [
                { phone: { contains: digits } },
                { whatsapp: { contains: digits } },
              ],
            },
          })
        : null;

      await db.interaction.upsert({
        where: {
          organizationId_channelMessageId: {
            organizationId: orgId,
            channelMessageId: msg.messageId,
          },
        },
        create: {
          organizationId: orgId,
          kind: "WHATSAPP",
          direction: "ENTRANTE",
          summary: msg.body.slice(0, 240) || "[WhatsApp entrante]",
          body: msg.body,
          occurredAt: msg.timestamp,
          channelMessageId: msg.messageId,
          relatedLeadId: lead?.id,
          relatedClientId: client?.id,
          relatedOwnerId: owner?.id,
        },
        update: {},
      });

      if (lead?.assignedAgentId) {
        await db.task.create({
          data: {
            organizationId: orgId,
            title: `Nuevo WhatsApp de ${digits}`,
            assignedToId: lead.assignedAgentId,
            createdById: lead.assignedAgentId,
            relatedLeadId: lead.id,
            priority: "ALTA",
            dueAt: new Date(),
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("[webhook/whatsapp] error processing message:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
