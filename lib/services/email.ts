/// Email vía Resend. Si no hay API key, loguea y no envía (dev-friendly).

import { env, isResendConfigured } from "../env";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  /** HTML opcional; si sólo mandás texto, se envía como plain. */
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>;
};

export async function sendEmail(p: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isResendConfigured()) {
    console.log("[email] (not configured) would send:", {
      to: p.to,
      subject: p.subject,
      textPreview: p.text?.slice(0, 120),
    });
    return { ok: true, id: "noop" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.resendApiKey!);
    const result = await resend.emails.send({
      from: env.resendFrom,
      to: Array.isArray(p.to) ? p.to : [p.to],
      subject: p.subject,
      html: p.html ?? p.text ?? " ",
      ...(p.text ? { text: p.text } : {}),
      ...(p.replyTo ? { replyTo: p.replyTo } : {}),
      ...(p.attachments
        ? {
            attachments: p.attachments.map((a) => ({
              filename: a.filename,
              content: a.content,
            })),
          }
        : {}),
    } as any);
    if (result.error) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: (err as Error).message };
  }
}

/// Plantillas simples inline. Para templates más elaborados, usar react-email.

export function magicLinkEmail(params: { name: string; url: string }) {
  const { name, url } = params;
  return {
    subject: "Tu acceso al portal",
    text: `Hola ${name},\n\nEste es tu acceso directo al portal (24h de validez):\n${url}\n\nSi no lo solicitaste, ignorá este correo.`,
    html: `<p>Hola <b>${escape(name)}</b>,</p><p>Este es tu acceso directo al portal (24h de validez):</p><p><a href="${url}">Abrir portal</a></p><p><small>Si no lo solicitaste, ignorá este correo.</small></p>`,
  };
}

export function contractExpiringEmail(params: {
  ownerName: string;
  propertyTitle: string;
  daysLeft: number;
}) {
  const { ownerName, propertyTitle, daysLeft } = params;
  return {
    subject: `Tu contrato de "${propertyTitle}" vence en ${daysLeft} días`,
    text: `Hola ${ownerName},\n\nTu contrato sobre "${propertyTitle}" vence en ${daysLeft} días. ¿Querés renovarlo?\n\nContactá a tu agente para coordinar.`,
    html: `<p>Hola <b>${escape(ownerName)}</b>,</p><p>Tu contrato sobre <b>${escape(
      propertyTitle,
    )}</b> vence en <b>${daysLeft} días</b>. ¿Querés renovarlo?</p><p>Contactá a tu agente para coordinar.</p>`,
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
