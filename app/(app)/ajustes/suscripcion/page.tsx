"use client";

import { Check, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: "$990",
    perks: ["Hasta 3 agentes", "100 propiedades", "Portales públicos"],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: "$2,490",
    perks: [
      "Hasta 10 agentes",
      "Propiedades ilimitadas",
      "Portal propietario e inquilino",
      "WhatsApp Business API",
      "Reportes avanzados",
    ],
    featured: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    perks: [
      "Agentes ilimitados",
      "White-label",
      "Onboarding dedicado",
      "SLA 99.9%",
    ],
  },
];

export default function SuscripcionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Suscripción"
        description="Gestión del plan y método de pago. Placeholder para Stripe/Conekta."
      />

      <div className="rounded-lg border border-gold/30 bg-gold-faint p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gold text-black">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-gold">Plan actual</p>
          <p className="font-serif text-2xl">Professional</p>
          <p className="text-xs text-muted-foreground">Renueva el 15 de cada mes · MXN 2,490</p>
        </div>
        <Button variant="outline">Gestionar pago</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={cn(
              "rounded-lg border bg-surface p-6 relative",
              p.featured ? "border-gold/40 shadow-gold-glow" : "border-border"
            )}
          >
            {p.featured && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Más popular</Badge>
            )}
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {p.name}
            </p>
            <p className="mt-1 font-serif text-3xl text-foreground">{p.price}</p>
            <p className="text-xs text-muted-foreground">/mes MXN</p>
            <ul className="mt-4 space-y-2 text-sm">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={p.featured ? "default" : "outline"}
              className="mt-5 w-full"
            >
              {p.id === "PROFESSIONAL" ? "Plan actual" : "Cambiar a este plan"}
            </Button>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        TODO(backend): integrar con Stripe / Conekta; usar SubscriptionPlan + SubscriptionStatus.
      </p>
    </div>
  );
}
