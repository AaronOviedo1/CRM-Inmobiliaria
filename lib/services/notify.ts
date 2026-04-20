/// Dispatcher central de notificaciones. Lee NotificationPreference del usuario y dispara
/// por los canales habilitados.

import { prisma } from "../prisma";
import { sendTemplate } from "./whatsapp";
import { sendEmail } from "./email";
import type { NotificationEvent } from "../enums";

type NotifyPayload = {
  userId: string;
  event: NotificationEvent;
  title: string;
  body?: string;
  /** payload para canales que soportan plantillas (WhatsApp) */
  whatsappTemplate?: {
    templateName: string;
    variables: string[];
    headerImageUrl?: string;
  };
  /** URL de deep-link para push/in-app */
  url?: string;
};

export async function notify(p: NotifyPayload): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: p.userId },
    include: { notificationPrefs: { where: { event: p.event } } },
  });
  if (!user || !user.isActive) return;

  const enabled = (channel: string): boolean => {
    const pref = user.notificationPrefs.find((x) => x.channel === channel);
    return pref ? pref.enabled : true;
  };

  const tasks: Promise<unknown>[] = [];

  if (enabled("IN_APP")) {
    tasks.push(
      prisma.interaction.create({
        data: {
          organizationId: user.organizationId,
          kind: "EVENTO_SISTEMA",
          direction: "AUTOMATICA",
          summary: p.title,
          body: p.body ?? null,
          occurredAt: new Date(),
        },
      }).catch((e) => console.error("[notify] in-app fail:", e)),
    );
  }

  if (enabled("EMAIL") && user.email) {
    tasks.push(
      sendEmail({
        to: user.email,
        subject: p.title,
        text: p.body ?? p.title,
      }).catch((e) => console.error("[notify] email fail:", e)),
    );
  }

  if (enabled("WHATSAPP") && user.phone && p.whatsappTemplate) {
    tasks.push(
      sendTemplate({
        organizationId: user.organizationId,
        toPhone: user.phone,
        templateName: p.whatsappTemplate.templateName,
        variables: p.whatsappTemplate.variables,
        headerImageUrl: p.whatsappTemplate.headerImageUrl,
      }).catch((e) => console.error("[notify] wa fail:", e)),
    );
  }

  await Promise.allSettled(tasks);
}
