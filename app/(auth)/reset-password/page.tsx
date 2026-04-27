"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import * as React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { resetPasswordAction } from "@/app/_actions/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (!token) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-serif text-3xl text-foreground">Link inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link no es válido. Solicita uno nuevo desde{" "}
          <Link href="/forgot-password" className="text-gold hover:text-gold-hover">olvidé mi contraseña</Link>.
        </p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordAction(token, password);
      if (result.ok) {
        setDone(true);
      } else if (result.error === "TOKEN_EXPIRED") {
        toast.error("El link expiró. Solicita uno nuevo.");
      } else if (result.error === "TOKEN_USED") {
        toast.error("Este link ya fue utilizado.");
      } else {
        toast.error("Link inválido. Solicita uno nuevo.");
      }
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in">
        <div className="rounded-md border border-gold/30 bg-gold-faint p-5">
          <CheckCircle className="h-5 w-5 text-gold" />
          <p className="mt-3 font-serif text-lg">¡Contraseña actualizada!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Ir al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Nueva contraseña</p>
      <h1 className="font-serif text-3xl text-foreground">Restablece tu contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">Elige una contraseña segura de al menos 8 caracteres.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar contraseña</Label>
          <Input id="confirm" name="confirm" type="password" minLength={8} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-gold hover:text-gold-hover">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
