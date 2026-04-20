"use client";

import Link from "next/link";
import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO(backend): trigger magic link de recuperación con token efímero.
    setSent(true);
    toast.success("Link enviado. Revisa tu correo.");
  };

  return (
    <div className="animate-fade-in">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Recuperar</p>
      <h1 className="font-serif text-3xl text-foreground">
        Recupera tu contraseña
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Te mandaremos un link mágico por correo para restablecerla.
      </p>

      {sent ? (
        <div className="mt-8 rounded-md border border-gold/30 bg-gold-faint p-5">
          <Mail className="h-5 w-5 text-gold" />
          <p className="mt-3 font-serif text-lg">Revisa tu bandeja</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Si el correo existe en nuestro sistema, vas a recibir el link en los próximos minutos.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" placeholder="tu@inmobiliaria.com" required />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Mandar link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-gold hover:text-gold-hover">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
