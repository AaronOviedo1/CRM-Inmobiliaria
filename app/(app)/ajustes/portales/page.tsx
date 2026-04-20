"use client";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

const PORTALS = [
  { id: "INMUEBLES24", name: "Inmuebles24", connected: true, count: 24 },
  { id: "VIVANUNCIOS", name: "Vivanuncios", connected: true, count: 18 },
  { id: "LAMUDI", name: "Lamudi", connected: false, count: 0 },
  { id: "FACEBOOK", name: "Facebook Marketplace", connected: false, count: 0 },
  { id: "WEBSITE", name: "Sitio web propio", connected: true, count: 32 },
];

export default function PortalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Portales externos"
        description="Sincroniza publicaciones con los portales donde ya pagas."
      />
      <div className="grid gap-3">
        {PORTALS.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-faint text-gold font-serif text-lg">
              {p.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.connected ? `${p.count} propiedades publicadas` : "Sin conectar"}
              </p>
            </div>
            {p.connected && <Check className="h-4 w-4 text-success" />}
            <Button variant={p.connected ? "ghost" : "default"} size="sm">
              {p.connected ? "Configurar" : "Conectar"}
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h4 className="font-serif text-lg">Credenciales de API</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Guardamos solo los tokens necesarios para publicar. Nunca tu contraseña.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Inmuebles24 API Key</Label>
            <Input type="password" defaultValue="i24_abc…••••" />
          </div>
          <div className="space-y-2 flex items-end justify-between rounded-md border border-border bg-elevated p-3">
            <span className="text-sm">Auto-sincronizar cada 15 min</span>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
