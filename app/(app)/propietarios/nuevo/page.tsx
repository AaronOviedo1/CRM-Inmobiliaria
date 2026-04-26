"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOwnerAction } from "@/app/_actions/owners";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTACT_CHANNEL_LABEL } from "@/lib/labels";

export default function NuevoPropietarioPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [channel, setChannel] = React.useState("WHATSAPP");
  const [portalEnabled, setPortalEnabled] = React.useState(true);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await createOwnerAction({
        firstName: fd.get("firstName") as string,
        lastName: fd.get("lastName") as string,
        rfc: (fd.get("rfc") as string) || undefined,
        email: (fd.get("email") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        whatsapp: (fd.get("whatsapp") as string) || undefined,
        preferredContactChannel: channel as any,
        addressLine: (fd.get("addressLine") as string) || undefined,
        bankName: (fd.get("bankName") as string) || undefined,
        accountLast4: (fd.get("accountLast4") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      if (result.ok) {
        toast.success("Propietario creado");
        router.push(`/propietarios/${result.id}`);
      } else {
        toast.error("No se pudo crear el propietario");
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alta"
        title="Nuevo propietario"
        description="Datos básicos + contacto. Los datos bancarios son opcionales; solo últimos 4."
      />
      <form onSubmit={save} className="mx-auto max-w-2xl space-y-5 rounded-lg border border-border bg-surface p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nombre"><Input name="firstName" placeholder="Mariana" required /></Field>
          <Field label="Apellido"><Input name="lastName" placeholder="Bringas" required /></Field>
        </div>
        <Field label="RFC (opcional)">
          <Input name="rfc" placeholder="BRIM850101XY1" />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Correo"><Input name="email" type="email" placeholder="mariana@mail.com" /></Field>
          <Field label="Canal preferido">
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CONTACT_CHANNEL_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Teléfono"><Input name="phone" placeholder="662 123 4567" /></Field>
          <Field label="WhatsApp"><Input name="whatsapp" placeholder="52 662 123 4567" /></Field>
        </div>
        <Field label="Dirección"><Input name="addressLine" placeholder="Calle, número y colonia" /></Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Banco"><Input name="bankName" placeholder="BBVA" /></Field>
          <Field label="Últimos 4 dígitos de cuenta">
            <Input name="accountLast4" placeholder="1234" maxLength={4} />
          </Field>
        </div>
        <Field label="Notas internas">
          <Textarea name="notes" rows={3} placeholder="Contexto útil: prefiere comunicación AM, otro inmueble potencial, etc." />
        </Field>

        <label className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-elevated p-3">
          <div>
            <p className="text-sm font-medium">Habilitar portal del propietario</p>
            <p className="text-xs text-muted-foreground">Generará un link mágico para enviar vía WhatsApp.</p>
          </div>
          <Switch checked={portalEnabled} onCheckedChange={setPortalEnabled} />
        </label>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Crear propietario"}
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
