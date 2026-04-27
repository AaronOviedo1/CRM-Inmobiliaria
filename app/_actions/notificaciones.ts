"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function saveNotificationPrefAction(
  event: string,
  channel: string,
  enabled: boolean,
) {
  const user = await requireSession();
  await prisma.notificationPreference.upsert({
    where: {
      userId_channel_event: {
        userId: user.id,
        channel: channel as any,
        event: event as any,
      },
    },
    update: { enabled },
    create: {
      userId: user.id,
      channel: channel as any,
      event: event as any,
      enabled,
    },
  });
  revalidatePath("/ajustes/notificaciones");
  return { ok: true };
}

export async function getNotificationPrefsAction() {
  const user = await requireSession();
  return prisma.notificationPreference.findMany({
    where: { userId: user.id },
    select: { event: true, channel: true, enabled: true },
  });
}
