"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Org = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  primaryColor: string | null;
};

export function OrganizacionClient({ org }: { org: Org }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organización"
        description="Datos de marca. Se usan en portales públicos y plantillas."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Organización actualizada");
        }}
        className="space-y-4 rounded-lg border border-border bg-surface p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-gold/30 bg-gold-faint font-serif text-2xl text-gold">
            {org.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-serif text-xl">{org.name}</p>
            <p className="text-xs text-muted-foreground">{org.slug}.crm.mx</p>
          </div>
          <Button type="button" variant="outline">Cambiar logo</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nombre comercial"><Input name="name" defaultValue={org.name} /></Field>
          <Field label="Slug público"><Input name="slug" defaultValue={org.slug} /></Field>
          <Field label="Teléfono"><Input name="phone" defaultValue={org.phone ?? ""} /></Field>
          <Field label="Correo"><Input name="email" defaultValue={org.email ?? ""} /></Field>
          <Field label="Dirección"><Input name="addressLine" defaultValue={org.addressLine ?? ""} /></Field>
          <Field label="Color primario">
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="primaryColor"
                defaultValue={org.primaryColor ?? "#C9A961"}
                className="h-10 w-20 rounded-md border border-border bg-transparent"
              />
              <Input defaultValue={org.primaryColor ?? "#C9A961"} readOnly />
            </div>
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>

      <div className="rounded-lg border border-dashed border-gold/30 bg-gold/5 p-4 text-xs text-muted-foreground">
        <p>
          <strong className="text-gold">Tip:</strong> personaliza el color primario para
          que los portales públicos hagan match con tu branding.
        </p>
      </div>
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
