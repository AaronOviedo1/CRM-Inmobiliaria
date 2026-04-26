"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/enums";

export type WhatsAppListingData = {
  title: string;
  slug: string;
  code: string;
  neighborhood: string | null;
  city: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  hideExactAddress: boolean;
  priceSale: number | null;
  priceRent: number | null;
  currency: Currency;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  areaBuiltM2: number | null;
  areaTotalM2: number | null;
};

function buildWhatsAppListing(p: WhatsAppListingData, baseUrl: string): string {
  const lines: string[] = [];
  lines.push(`🏠 *${p.title}*`);

  const locBits: string[] = [];
  if (!p.hideExactAddress && p.addressStreet) {
    const streetLine = [p.addressStreet, p.addressNumber].filter(Boolean).join(" ");
    if (streetLine) locBits.push(streetLine);
  }
  if (p.neighborhood) locBits.push(p.neighborhood);
  if (p.city) locBits.push(p.city);
  if (locBits.length > 0) lines.push(`📍 ${locBits.join(" · ")}`);

  lines.push("");

  const priceBits: string[] = [];
  if (p.priceSale) {
    priceBits.push(`💰 Venta: ${formatMoney(p.priceSale, p.currency)}`);
  }
  if (p.priceRent) {
    priceBits.push(`💰 Renta: ${formatMoney(p.priceRent, p.currency)} /mes`);
  }
  lines.push(...priceBits);

  const featureBits: string[] = [];
  if (p.bedrooms != null) featureBits.push(`🛏️ ${p.bedrooms} rec`);
  if (p.bathrooms != null) featureBits.push(`🚿 ${p.bathrooms} baños`);
  if (p.parkingSpaces != null) featureBits.push(`🚗 ${p.parkingSpaces} cajones`);
  if (featureBits.length > 0) lines.push(featureBits.join(" · "));

  const areaBits: string[] = [];
  if (p.areaBuiltM2) areaBits.push(`Construcción: ${p.areaBuiltM2} m²`);
  if (p.areaTotalM2) areaBits.push(`Terreno: ${p.areaTotalM2} m²`);
  if (areaBits.length > 0) lines.push(`📐 ${areaBits.join(" · ")}`);

  lines.push("");
  lines.push(`👉 ${baseUrl}/p/${p.slug}`);
  lines.push("");
  lines.push(`Ref: ${p.code}`);

  return lines.join("\n");
}

export function CopyWhatsAppButton({ data }: { data: WhatsAppListingData }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    const text = buildWhatsAppListing(data, window.location.origin);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Ficha copiada — pégala en WhatsApp");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Button variant="ghost" onClick={copy} className="text-muted-foreground">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Ficha copiada" : "Copiar ficha WhatsApp"}
    </Button>
  );
}
