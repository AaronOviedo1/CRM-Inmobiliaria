"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { InteractionCreateSchema } from "@/lib/validators/interaction";

export async function createInteractionAction(rawInput: unknown) {
  const u = await requireSession();
  const input = InteractionCreateSchema.parse(rawInput);

  await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
    db.interaction.create({
      data: {
        organizationId: u.organizationId,
        kind: input.kind as any,
        direction: input.direction as any,
        summary: input.summary,
        body: input.body,
        occurredAt: input.occurredAt,
        durationSeconds: input.durationSeconds,
        relatedLeadId: input.relatedLeadId,
        relatedClientId: input.relatedClientId,
        relatedOwnerId: input.relatedOwnerId,
        relatedPropertyId: input.relatedPropertyId,
        attachments: input.attachments ?? [],
        channelMessageId: input.channelMessageId,
        createdById: u.id,
      },
    }),
  );

  if (input.relatedLeadId) {
    await withTenant({ organizationId: u.organizationId, userId: u.id }, (db) =>
      db.lead.update({
        where: { id: input.relatedLeadId },
        data: { lastContactAt: new Date() },
      }),
    );
    revalidatePath(`/leads/${input.relatedLeadId}`);
  }
  if (input.relatedClientId) revalidatePath(`/clientes/${input.relatedClientId}`);
  if (input.relatedOwnerId) revalidatePath(`/propietarios/${input.relatedOwnerId}`);
  if (input.relatedPropertyId) revalidatePath(`/propiedades/${input.relatedPropertyId}`);

  return { ok: true };
}
