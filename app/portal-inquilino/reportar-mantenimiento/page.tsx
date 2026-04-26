"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MAINTENANCE_CATEGORY_LABEL,
  MAINTENANCE_PRIORITY_LABEL,
} from "@/lib/labels";
import { createPortalMaintenanceAction } from "../_actions/maintenance";

export default function ReportMaintenancePage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [category, setCategory] = React.useState("AIRE_ACONDICIONADO");
  const [priority, setPriority] = React.useState("MEDIA");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await createPortalMaintenanceAction({
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        category,
        priority,
      });
      if (result.ok) {
        toast.success("¡Listo! Ya notificamos a la agencia.");
        router.push("/portal-inquilino/mantenimientos");
      } else if (result.error === "SIN_RENTA_ACTIVA") {
        toast.error("No tienes una renta activa vinculada a tu cuenta.");
      } else {
        toast.error("No se pudo enviar el reporte.");
      }
    } catch {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reportar problema"
        title="Mantenimiento"
        description="Captura qué pasa y tu agencia atenderá tu solicitud."
      />
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border border-border bg-surface p-6"
      >
        <Field label="Qué pasa">
          <Input name="title" placeholder="Ej. No prende el aire acondicionado" required />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Categoría">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MAINTENANCE_CATEGORY_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Qué tan urgente">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MAINTENANCE_PRIORITY_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Describe el detalle">
          <Textarea
            name="description"
            rows={4}
            required
            placeholder="Desde cuándo pasa, en qué cuarto, si hay algún riesgo…"
          />
        </Field>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Enviando…" : "Enviar reporte"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
