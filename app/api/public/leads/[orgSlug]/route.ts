/// Endpoint público para recibir leads desde formularios externos y páginas /p/[slug].
/// Rate limit + honeypot + reCAPTCHA opcional.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PublicLeadFormSchema } from "@/lib/validators/lead";
import { pickAgentForLead } from "@/lib/services/lead-routing";
import { incrementPropertyInquiries } from "@/lib/repos/properties";
import { notify } from "@/lib/services/notify";
import { rateLimitOr429, clientIp } from "@/lib/services/ratelimit";
import { env, isRecaptchaConfigured } from "@/lib/env";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params;

  const ip = clientIp(req);
  const rateLimitError = await rateLimitOr429("public.leadForm", ip);
  if (rateLimitError) return rateLimitError;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, subscriptionStatus: true },
  });
  if (!org) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (org.subscriptionStatus === "CANCELED") {
    return NextResponse.json({ error: "ORG_INACTIVE" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = PublicLeadFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const input = parsed.data;

  if (input.website) {
    return NextResponse.json({ ok: true });
  }

  if (isRecaptchaConfigured() && input.recaptchaToken) {
    const r = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${env.recaptchaSecret}&response=${input.recaptchaToken}`,
      { method: "POST" },
    );
    const data = (await r.json()) as { success: boolean; score: number };
    if (!data.success || data.score < 0.4) {
      return NextResponse.json({ error: "CAPTCHA_FAILED" }, { status: 422 });
    }
  }

  const agentId = await pickAgentForLead(org.id, {
    desiredZones: input.desiredZones ?? [],
    propertyTypeInterests: [] as any[],
  });

  const lead = await prisma.lead.create({
    data: {
      organizationId: org.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      intent: (input.intent as any) ?? "COMPRA",
      source: (input.source as any) ?? "WEBSITE",
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      desiredZones: input.desiredZones ?? [],
      mustHaves: input.mustHaves ?? [],
      notes: input.notes,
      utmCampaign: input.utmCampaign,
      utmMedium: input.utmMedium,
      utmContent: input.utmContent,
      assignedAgentId: agentId,
      status: "NUEVO",
      firstContactAt: new Date(),
    },
  });

  if (input.propertyId) {
    await incrementPropertyInquiries({ organizationId: org.id }, input.propertyId).catch(() => {});
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        /* link propiedad de interés como nota */
        notes: `${input.notes ?? ""}\n[Interés en propiedad: ${input.propertyId}]`.trim(),
      },
    });
  }

  if (agentId) {
    await notify({
      userId: agentId,
      event: "NEW_LEAD",
      title: `Nuevo lead desde portal: ${input.firstName} ${input.lastName}`,
      url: `/leads/${lead.id}`,
    });
  }

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
