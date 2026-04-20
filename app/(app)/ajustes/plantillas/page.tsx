"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEMPLATES = [
  {
    name: "Confirmar visita",
    body: "Hola {{nombre}} 👋 te confirmo tu visita a {{propiedad}} para {{fecha_visita}}. Te veo ahí. Cualquier cosa, aquí estoy.",
  },
  {
    name: "Enviar ficha",
    body: "Hola {{nombre}}, te comparto la ficha de {{propiedad}}: {{link_publico}}\n\nPrecio: {{precio}}\n\nAvísame si te hace sentido y te agendo visita.",
  },
  {
    name: "Post-visita",
    body: "Gracias por visitar {{propiedad}} {{nombre}}. ¿Qué te pareció? Te leo.",
  },
  {
    name: "Recordatorio pago",
    body: "Hola {{nombre}}, te recuerdo que el pago de renta de {{propiedad}} vence el {{fecha_visita}}. Cualquier duda, aquí estoy.",
  },
];

export default function PlantillasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantillas"
        description={`Usa variables: {{nombre}}, {{propiedad}}, {{precio}}, {{link_publico}}, {{fecha_visita}}.`}
        actions={<Button><Plus className="h-4 w-4" /> Nueva plantilla</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="rounded-lg border border-border bg-surface p-5 space-y-3">
            <Label>{t.name}</Label>
            <Input defaultValue={t.name} />
            <Textarea defaultValue={t.body} rows={5} />
            <div className="flex justify-between">
              <Button variant="ghost" size="sm">Eliminar</Button>
              <Button size="sm">Guardar</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
