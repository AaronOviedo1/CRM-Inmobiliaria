"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { saveNotificationPrefAction } from "@/app/_actions/notificaciones";

const CHANNELS = [
  { key: "EMAIL",  label: "Correo" },
  { key: "IN_APP", label: "En app" },
];

const EVENTS = [
  { key: "PAGO_VENCIDO",       label: "Pago vencido" },
  { key: "MANTENIMIENTO_NUEVO", label: "Mantenimiento nuevo" },
  { key: "CONTRATO_POR_VENCER", label: "Contrato próximo a vencer" },
];

type Pref = { channel: string; enabled: boolean };

export function NotificacionesClient({ initialPrefs }: { initialPrefs: Pref[] }) {
  const defaultEnabled = (channel: string) => {
    const found = initialPrefs.find((p) => p.channel === channel);
    return found?.enabled ?? (channel === "IN_APP");
  };

  const handleChange = async (channel: string, enabled: boolean) => {
    try {
      await saveNotificationPrefAction(channel, enabled);
    } catch {
      toast.error("No se pudo guardar la preferencia");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Canal</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Activado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {CHANNELS.map((c) => (
            <tr key={c.key} className="hover:bg-muted/30">
              <td className="px-4 py-3 text-sm text-foreground">{c.label}</td>
              <td className="px-4 py-3 text-center">
                <Switch
                  defaultChecked={defaultEnabled(c.key)}
                  onCheckedChange={(checked) => handleChange(c.key, checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
