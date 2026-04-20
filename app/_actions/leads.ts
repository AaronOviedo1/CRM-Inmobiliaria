"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { withTenant } from "@/lib/repos/tenant";
import { matchLeadToProperties } from "@/lib/services/matching";
import { pickAgentForLead } from "@/lib/services/lead-routing";
import { notify } from "@/lib/services/notify";
import { sendTemplate } from "@/lib/services/whatsapp";
import { prisma } from "@/lib/prisma";
import {
  LeadCreateSchema,
  LeadUpdateSchema,
  LeadMoveStatusSchema,
  LeadAssignSchema,
} from "@/lib/validators/lead";

export async function createLeadAction(rawInput: unknown) {
  const u = await requireSession();
  const ctx = { organizationId: u.organizationId, userId: u.id };
  const input = LeadCreateSchema.parse(rawInput);

  const agentId =
    input.assignedAgentId ??
    (await pickAgentForLead(u.organizationId, {
      desiredZones: input.desiredZones ?? [],
      propertyTypeInterests: (input.propertyTypeInterests ?? []) as any[],
    }));

  const lead = await withTenant(ctx, (db) =>
    db.lead.create({
      data: {
        ...(input as any),
        organizationId: u.organizationId,
        assignedAgentId: agentId,
        status: "NUEVO",
        firstContactAt: new Date(),
      },
    }),
  );

  if (agentId) {
    await notify({
      userId: agentId,
      event: "NEW_LEAD",
      title: `Nuevo lead: ${input.firstName} ${input.lastName}`,
      body: input.notes,
      whatsappTemplate: {
        templateName: "nuevo_lead_agente",
        variables: [`${input.firstName} ${input.lastName}`, input.source],
      },
      url: `/leads/${lead.id}`,
    });
  }

  revalidatePath("/leads");
  return { ok: true, id: lead.id };
}

export async function updateLeadAction(leadId: string, rawInput: unknown) {
  const u = await requireSession();
  const input = LeadUpdateSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.lead.update({ where: { id: leadId }, data: input as any }),
  );

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { ok: true };
}

export async function moveLeadStatusAction(leadId: string, rawInput: unknown) {
  const u = await requireSession();
  const input = LeadMoveStatusSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.lead.update({
      where: { id: leadId },
      data: {
        status: input.status as any,
        lostReason: input.lostReason,
        lostReasonDetail: input.lostReasonDetail,
        lastContactAt: new Date(),
      },
    }),
  );

  if (input.note) {
    await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
      db.interaction.create({
        data: {
          organizationId: u.organizationId,
          kind: "NOTA_INTERNA",
          direction: "INTERNA",
          summary: `Estado → ${input.status}`,
          body: input.note,
          occurredAt: new Date(),
          relatedLeadId: leadId,
          createdById: u.id,
        },
      }),
    );
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { ok: true };
}

export async function assignLeadAction(leadId: string, rawInput: unknown) {
  const u = await requireSession();
  assertCan(u.role, "lead.assign");
  const { agentId } = LeadAssignSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.lead.update({
      where: { id: leadId },
      data: { assignedAgentId: agentId },
    }),
  );

  await notify({
    userId: agentId,
    event: "NEW_LEAD",
    title: "Se te asignó un lead",
    url: `/leads/${leadId}`,
  });

  revalidatePath(`/leads/${leadId}`);
  return { ok: true };
}

export async function convertLeadToClientAction(
  leadId: string,
  clientType: string,
) {
  const u = await requireSession();
  const ctx = { organizationId: u.organizationId, userId: u.id };

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: u.organizationId, deletedAt: null },
  });
  if (!lead) return { ok: false, error: "NOT_FOUND" };
  if (lead.convertedToClientId) return { ok: false, error: "ALREADY_CONVERTED" };

  const client = await withTenant(ctx, (db) =>
    db.client.create({
      data: {
        organizationId: u.organizationId,
        leadId,
        type: clientType as any,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
      },
    }),
  );

  await withTenant(ctx, (db) =>
    db.lead.update({
      where: { id: leadId },
      data: { convertedToClientId: client.id, status: "GANADO" },
    }),
  );

  revalidatePath("/leads");
  revalidatePath("/clientes");
  return { ok: true, clientId: client.id };
}

export async function runMatchingAction(leadId: string) {
  const u = await requireSession();
  const ctx = { organizationId: u.organizationId, userId: u.id };

  const matches = await matchLeadToProperties(ctx, leadId, { topN: 10 });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/matching");
  return { ok: true, count: matches.length };
}

export async function sendMatchToLeadAction(
  matchId: string,
  leadId: string,
  propertyId: string,
) {
  const u = await requireSession();

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: u.organizationId, deletedAt: null },
  });
  if (!lead || !(lead.whatsapp ?? lead.phone)) {
    return { ok: false, error: "NO_PHONE" };
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: u.organizationId },
    include: { images: { where: { isCover: true }, take: 1 } },
  });
  if (!property) return { ok: false, error: "NOT_FOUND" };

  const result = await sendTemplate({
    organizationId: u.organizationId,
    toPhone: (lead.whatsapp ?? lead.phone)!,
    templateName: "match_propiedad",
    variables: [
      lead.firstName,
      property.title,
      property.code,
      property.priceRent
        ? `$${property.priceRent} MXN/mes`
        : `$${property.priceSale} MXN`,
    ],
    headerImageUrl: property.images[0]?.url,
  });

  if (result.ok) {
    await prisma.matchSuggestion.update({
      where: { id: matchId },
      data: { status: "ENVIADO_AL_LEAD", sentToLeadAt: new Date() },
    });
    await prisma.interaction.create({
      data: {
        organizationId: u.organizationId,
        kind: "WHATSAPP",
        direction: "SALIENTE",
        summary: `Match enviado: ${property.title}`,
        occurredAt: new Date(),
        relatedLeadId: leadId,
        relatedPropertyId: propertyId,
        createdById: u.id,
      },
    });
  }

  revalidatePath(`/leads/${leadId}`);
  return result;
}
