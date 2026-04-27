"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { NOTIFICATION_CHANNEL_LABEL, NOTIFICATION_EVENT_LABEL } from "@/lib/labels";
import type { NotificationChannel, NotificationEvent } from "@/lib/types";
import { saveNotificationPrefAction } from "@/app/_actions/notificaciones";

type Pref = { event: string; channel: string; enabled: boolean };

export function NotificacionesClient({ initialPrefs }: { initialPrefs: Pref[] }) {
  const events = Object.keys(NOTIFICATION_EVENT_LABEL) as NotificationEvent[];
  const channels = Object.keys(NOTIFICATION_CHANNEL_LABEL) as NotificationChannel[];

  const defaultEnabled = (event: string, channel: string) => {
    const found = initialPrefs.find((p) => p.event === event && p.channel === channel);
    if (found !== undefined) return found.enabled;
    return channel === "IN_APP" || channel === "EMAIL";
  };

  const handleChange = async (event: string, channel: string, enabled: boolean) => {
    try {
      await saveNotificationPrefAction(event, channel, enabled);
    } catch {
      toast.error("No se pudo guardar la preferencia");
    }
  };

  return (
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
              <td className="px-4 py-3 font-medium">{NOTIFICATION_EVENT_LABEL[e]}</td>
              {channels.map((c) => (
                <td key={c} className="px-4 py-3 text-center">
                  <div className="inline-flex">
                    <Switch
                      defaultChecked={defaultEnabled(e, c)}
                      onCheckedChange={(checked) => handleChange(e, c, checked)}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
