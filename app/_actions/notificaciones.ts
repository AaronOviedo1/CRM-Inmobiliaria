"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function saveNotificationPrefAction(channel: string, enabled: boolean) {
  const user = await requireSession();
  await prisma.notificationPreference.upsert({
    where: {
      organizationId_userId_channel: {
        organizationId: user.organizationId,
        userId: user.id,
        channel,
      },
    },
    update: { enabled },
    create: {
      organizationId: user.organizationId,
      userId: user.id,
      channel,
      enabled,
    },
  });
  revalidatePath("/ajustes/notificaciones");
  return { ok: true };
}
