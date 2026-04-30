import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { NotificacionesClient } from "./notificaciones-client";

export default async function NotificacionesPage() {
  const user = await requireSession();

  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: user.id },
    select: { channel: true, enabled: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Controla qué alertas recibes del sistema."
      />
      <NotificacionesClient initialPrefs={prefs as any} />
    </div>
  );
}
