"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Upload } from "lucide-react";
import { changeStatusAction } from "@/app/_actions/properties";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/status-pill";
import {
  PROPERTY_STATUS_LABEL,
  PROPERTY_STATUS_TONE,
} from "@/lib/labels";
import { PropertyStatus } from "@/lib/enums";
import { ALLOWED_PROPERTY_STATUS_TRANSITIONS } from "@/lib/workflows/property-status";

const STATUS_OPTIONS: { value: keyof typeof PropertyStatus; label: string }[] =
  (Object.keys(PROPERTY_STATUS_LABEL) as (keyof typeof PropertyStatus)[]).map(
    (k) => ({ value: k, label: PROPERTY_STATUS_LABEL[k] }),
  );

interface Props {
  propertyId: string;
  status: keyof typeof PropertyStatus;
}

export function PropertyStatusMenu({ propertyId, status }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const allowedTargets = React.useMemo(
    () => new Set(ALLOWED_PROPERTY_STATUS_TRANSITIONS[status] ?? []),
    [status],
  );

  const change = async (next: keyof typeof PropertyStatus) => {
    if (next === status) return;
    setPending(true);
    try {
      const res = await changeStatusAction(propertyId, { status: next });
      if (!res?.ok) {
        if (res?.error === "INVALID_TRANSITION") {
          throw new Error(
            `No se puede pasar de ${PROPERTY_STATUS_LABEL[status]} a ${PROPERTY_STATUS_LABEL[next]}`,
          );
        }
        throw new Error("No se pudo cambiar el status");
      }
      toast.success(`Status actualizado a ${PROPERTY_STATUS_LABEL[next]}`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      {status === "BORRADOR" && (
        <Button
          size="sm"
          onClick={() => change("DISPONIBLE")}
          disabled={pending}
        >
          <Upload className="h-3.5 w-3.5" />
          Publicar
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={pending}>
          <button
            type="button"
            className="inline-flex items-center gap-1 focus-visible:outline-none"
          >
            <StatusPill tone={PROPERTY_STATUS_TONE[status]}>
              {PROPERTY_STATUS_LABEL[status]}
            </StatusPill>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Cambiar status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = opt.value === status;
            const isAllowed = isCurrent || allowedTargets.has(opt.value);
            if (!isAllowed) return null;
            return (
              <DropdownMenuItem
                key={opt.value}
                disabled={isCurrent || pending}
                onSelect={() => change(opt.value)}
              >
                {opt.label}
                {isCurrent && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    actual
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
          {allowedTargets.size === 0 && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Este estado es terminal.
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
