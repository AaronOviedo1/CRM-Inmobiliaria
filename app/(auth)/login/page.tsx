"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as React from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Credenciales incorrectas. Verificá tu correo y contraseña.");
      } else {
        router.push(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Acceso</p>
        <h1 className="font-serif text-3xl text-foreground">Entrar a tu CRM</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Usa tu correo de agencia para continuar.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            placeholder="agente@casadorada.mx"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-gold"
            >
              Olvidé mi contraseña
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Nueva inmobiliaria?{" "}
        <Link href="/register-org" className="font-medium text-gold hover:text-gold-hover">
          Crear cuenta
        </Link>
      </p>

      <div className="mt-10 border-t border-border pt-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Portales privados
        </p>
        <div className="mt-3 flex gap-3">
          <Link
            href="/portal-propietario/login"
            className="flex-1 rounded-md border border-border bg-elevated p-3 text-xs hover:border-gold/40"
          >
            <p className="font-medium">Portal propietario</p>
            <p className="mt-0.5 text-muted-foreground">Magic link con token</p>
          </Link>
          <Link
            href="/portal-inquilino/login"
            className="flex-1 rounded-md border border-border bg-elevated p-3 text-xs hover:border-gold/40"
          >
            <p className="font-medium">Portal inquilino</p>
            <p className="mt-0.5 text-muted-foreground">Magic link con token</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
