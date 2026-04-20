"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PublicContactForm({
  propertyCode,
}: {
  propertyCode?: string;
}) {
  const [sent, setSent] = React.useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO(backend): POST /api/public/leads + reCAPTCHA token, crear Lead con source=WEBSITE.
    setSent(true);
    toast.success("¡Gracias! El agente te contactará muy pronto.");
  };

  if (sent) {
    return (
      <div className="mt-3 rounded-md border border-gold/30 bg-gold-faint p-4 text-xs">
        <p className="font-medium text-gold">Mensaje enviado</p>
        <p className="mt-1 text-muted-foreground">
          Revisa tu WhatsApp. Te contactamos en minutos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="pc-name">Nombre</Label>
        <Input id="pc-name" required placeholder="María López" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="pc-phone">Teléfono</Label>
          <Input id="pc-phone" required placeholder="662 123 4567" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-email">Correo</Label>
          <Input id="pc-email" type="email" placeholder="tu@mail.com" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pc-msg">Mensaje</Label>
        <Textarea
          id="pc-msg"
          rows={3}
          defaultValue={
            propertyCode
              ? `Hola, me interesa la propiedad ${propertyCode}. ¿Sigue disponible?`
              : ""
          }
        />
      </div>
      <Button type="submit" className="w-full">
        Solicitar información
      </Button>
      <p className="text-[10px] text-muted-foreground">
        Protegido por reCAPTCHA. TODO(backend): verificar token.
      </p>
    </form>
  );
}
