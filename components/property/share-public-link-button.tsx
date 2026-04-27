"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SharePublicLinkButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const share = async () => {
    const url = `${window.location.origin}/p/${slug}`;

    // Intenta el share nativo (móvil). Si no está disponible o el usuario
    // cancela, cae a copiar al clipboard.
    const canShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";

    if (canShare) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // Si el usuario canceló (AbortError), no hacemos nada.
        if (err instanceof Error && err.name === "AbortError") return;
        // Cualquier otro error → copiamos como fallback.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  };

  return (
    <Button variant="outline" onClick={share}>
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {copied ? "Link copiado" : "Compartir link público"}
    </Button>
  );
}
