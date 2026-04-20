"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
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
import { PROPERTY_IMAGES } from "@/lib/mock/fixtures";

export default function ReportMaintenancePage() {
  const router = useRouter();
  const [photos, setPhotos] = React.useState<string[]>([]);

  const addPhoto = () => {
    setPhotos((p) => [...p, PROPERTY_IMAGES[p.length % PROPERTY_IMAGES.length]!]);
    toast.info("Foto agregada (mock)");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reportar problema"
        title="Mantenimiento"
        description="Captura qué pasa, sube 1-3 fotos y tu agencia atenderá tu solicitud."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // TODO(backend): POST /api/public/maintenance.
          toast.success("¡Listo! Ya notificamos a la agencia.");
          router.push("/portal-inquilino/mantenimientos");
        }}
        className="space-y-5 rounded-lg border border-border bg-surface p-6"
      >
        <Field label="Qué pasa">
          <Input placeholder="Ej. No prende el aire acondicionado" required />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Categoría">
            <Select defaultValue="AIRE_ACONDICIONADO">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(MAINTENANCE_CATEGORY_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Qué tan urgente">
            <Select defaultValue="MEDIA">
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
            rows={4}
            required
            placeholder="Desde cuándo pasa, en qué cuarto, si hay algún riesgo…"
          />
        </Field>

        <div className="space-y-2">
          <Label>Fotos</Label>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-md border border-border"
              >
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((arr) => arr.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPhoto}
              className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:text-gold hover:border-gold/40"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Enviar reporte</Button>
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
