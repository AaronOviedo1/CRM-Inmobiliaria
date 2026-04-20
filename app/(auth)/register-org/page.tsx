"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { registerOrgAction } from "@/app/_actions/organization";

const STEPS = [
  { id: 1, title: "Inmobiliaria", description: "Datos de la agencia" },
  { id: 2, title: "Dueño", description: "Tu cuenta admin" },
  { id: 3, title: "Preferencias", description: "Zona y plan" },
];

export default function RegisterOrgPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const [orgName, setOrgName] = React.useState("");
  const [orgSlug, setOrgSlug] = React.useState("");
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleSlugChange = (value: string) => {
    setOrgSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"));
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const result = await registerOrgAction({
        orgName,
        orgSlug,
        adminEmail,
        adminName,
        adminPassword,
      });
      if (result && !result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      toast.success("Tu inmobiliaria fue creada. ¡Bienvenida!");
      router.push("/dashboard");
    } catch {
      toast.error("Ocurrió un error al crear la organización");
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Onboarding</p>
        <h1 className="font-serif text-3xl text-foreground">Crear inmobiliaria</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          En 3 pasos quedas lista para importar propiedades y leads.
        </p>
      </div>

      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                step > s.id
                  ? "border-gold bg-gold text-black"
                  : step === s.id
                    ? "border-gold bg-gold-faint text-gold"
                    : "border-border bg-elevated text-muted-foreground"
              )}
            >
              {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
            </div>
            <div className="flex-1 hidden sm:block">
              <p
                className={cn(
                  "text-xs font-medium",
                  step >= s.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.title}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1",
                  step > s.id ? "bg-gold" : "bg-border"
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre comercial</Label>
            <Input
              id="orgName"
              placeholder="Casa Dorada Bienes Raíces"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (identificador único)</Label>
            <div className="flex items-center rounded-md border border-border bg-elevated">
              <Input
                id="slug"
                className="border-0"
                placeholder="casa-dorada"
                value={orgSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
              <span className="pr-3 text-sm text-muted-foreground">.crm.mx</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Tu nombre</Label>
            <Input
              id="ownerName"
              placeholder="Mariana Bringas"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Correo</Label>
            <Input
              id="ownerEmail"
              type="email"
              placeholder="tu@casadorada.mx"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPwd">Contraseña</Label>
            <Input
              id="ownerPwd"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plan inicial</Label>
            <Select defaultValue="TRIAL">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIAL">Trial 14 días — gratis</SelectItem>
                <SelectItem value="STARTER">Starter · $990/mes</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional · $2,490/mes</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise · a convenir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-dashed border-border bg-elevated/50 p-4 text-sm text-muted-foreground">
            <p>Se creará tu organización <strong className="text-foreground">{orgName || "—"}</strong> con el usuario admin <strong className="text-foreground">{adminEmail || "—"}</strong>.</p>
            <p className="mt-1">El trial de 14 días incluye todas las funciones Professional.</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={prev}>
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
        ) : (
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ya tengo cuenta
          </Link>
        )}
        {step < 3 ? (
          <Button onClick={next} disabled={
            (step === 1 && (!orgName.trim() || !orgSlug.trim())) ||
            (step === 2 && (!adminName.trim() || !adminEmail.trim() || adminPassword.length < 8))
          }>
            Continuar <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onFinish} disabled={loading}>
            {loading ? "Creando…" : "Crear inmobiliaria"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
