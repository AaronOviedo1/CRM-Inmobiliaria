"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { updatePropertyAction } from "@/app/_actions/properties";
import { cn } from "@/lib/utils";

export function AddressVisibilityToggle({
  propertyId,
  hideExactAddress,
}: {
  propertyId: string;
  hideExactAddress: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [hidden, setHidden] = React.useState(hideExactAddress);

  const toggle = async () => {
    const next = !hidden;
    setPending(true);
    // Optimista: refleja en la UI al instante; si falla, revertimos.
    setHidden(next);
    try {
      const res = await updatePropertyAction(propertyId, {
        hideExactAddress: next,
      });
      if (!res?.ok) throw new Error("No se pudo actualizar");
      toast.success(
        next
          ? "Dirección oculta en publicaciones"
          : "Dirección visible en publicaciones",
      );
      router.refresh();
    } catch (e) {
      setHidden(!next);
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={
        hidden
          ? "La dirección exacta está oculta. Click para mostrarla en anuncios públicos."
          : "La dirección exacta es visible en anuncios públicos. Click para ocultarla."
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
        hidden
          ? "border-border bg-muted text-muted-foreground hover:text-foreground"
          : "border-gold/40 bg-gold-faint text-gold",
        pending && "opacity-60",
      )}
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : hidden ? (
        <EyeOff className="h-3 w-3" />
      ) : (
        <Eye className="h-3 w-3" />
      )}
      {hidden ? "Dirección oculta" : "Dirección pública"}
    </button>
  );
}
