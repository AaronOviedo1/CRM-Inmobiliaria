"use client";

import { PageHeader } from "@/components/common/page-header";
import { Switch } from "@/components/ui/switch";
import { NOTIFICATION_CHANNEL_LABEL, NOTIFICATION_EVENT_LABEL } from "@/lib/labels";
import { NotificationChannel, NotificationEvent } from "@/lib/types";

export default function NotificacionesPage() {
  const events = Object.keys(NOTIFICATION_EVENT_LABEL) as NotificationEvent[];
  const channels = Object.keys(NOTIFICATION_CHANNEL_LABEL) as NotificationChannel[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Controla qué te notifica el CRM y por qué canal."
      />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Evento</th>
              {channels.map((c) => (
                <th key={c} className="px-4 py-3 text-center">
                  {NOTIFICATION_CHANNEL_LABEL[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {events.map((e) => (
              <tr key={e}>
                <td className="px-4 py-3 font-medium">
                  {NOTIFICATION_EVENT_LABEL[e]}
                </td>
                {channels.map((c) => (
                  <td key={c} className="px-4 py-3 text-center">
                    <div className="inline-flex">
                      <Switch defaultChecked={c === "IN_APP" || c === "EMAIL"} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        TODO(backend): persistir NotificationPreference por evento y canal.
      </p>
    </div>
  );
}
