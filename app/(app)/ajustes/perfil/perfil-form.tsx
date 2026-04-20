"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    commissionDefaultPct?: number | null;
  };
}

export function PerfilForm({ user }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Mi perfil" serif />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Perfil actualizado");
        }}
        className="space-y-4 rounded-lg border border-border bg-surface p-6"
      >
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full border border-gold/30 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold-faint font-serif text-2xl text-gold">
              {user.name[0]}
            </div>
          )}
          <div>
            <p className="font-serif text-xl">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button type="button" variant="outline" className="ml-auto">
            Cambiar foto
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nombre completo">
            <Input defaultValue={user.name} />
          </Field>
          <Field label="Correo">
            <Input defaultValue={user.email} />
          </Field>
          <Field label="Teléfono">
            <Input defaultValue={user.phone ?? ""} />
          </Field>
          <Field label="Comisión default %">
            <Input type="number" defaultValue={user.commissionDefaultPct ?? 0} />
          </Field>
        </div>
        <Field label="Bio (visible en página pública de agencia)">
          <Textarea rows={4} placeholder="Agente especialista en zonas premium..." />
        </Field>
        <div className="flex justify-end">
          <Button type="submit">Guardar cambios</Button>
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
