"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquare, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INTERACTION_DIRECTION_LABEL,
  INTERACTION_KIND_LABEL,
} from "@/lib/labels";
import { createInteractionAction } from "@/app/_actions/interactions";
import { cn } from "@/lib/utils";
import type { LeadOption } from "./schedule-viewing-dialog";

const NO_LEAD = "__no_lead__";

// EVENTO_SISTEMA y TAREA_COMPLETADA los pone el backend; no deben ser
// elegibles al registrar manualmente.
const SELECTABLE_KINDS: Array<keyof typeof INTERACTION_KIND_LABEL> = [
  "WHATSAPP",
  "LLAMADA",
  "EMAIL",
  "REUNION",
  "VISITA_OFICINA",
  "VISITA_PROPIEDAD",
  "MENSAJE_PORTAL",
  "NOTA_INTERNA",
];

const SELECTABLE_DIRECTIONS: Array<keyof typeof INTERACTION_DIRECTION_LABEL> = [
  "ENTRANTE",
  "SALIENTE",
  "INTERNA",
];

function defaultDateTimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LogInteractionDialog({
  propertyId,
  leads,
}: {
  propertyId: string;
  leads: LeadOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [kind, setKind] = React.useState<string>("WHATSAPP");
  const [direction, setDirection] = React.useState<string>("SALIENTE");
  const [summary, setSummary] = React.useState("");
  const [body, setBody] = React.useState("");
  const [occurredAt, setOccurredAt] = React.useState(defaultDateTimeLocal());
  const [durationMinutes, setDurationMinutes] = React.useState("");
  const [leadId, setLeadId] = React.useState<string>(NO_LEAD);
  const [leadSearch, setLeadSearch] = React.useState("");

  const showDuration = kind === "LLAMADA" || kind === "REUNION";

  const filteredLeads = React.useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(q),
    );
  }, [leadSearch, leads]);

  const reset = () => {
    setKind("WHATSAPP");
    setDirection("SALIENTE");
    setSummary("");
    setBody("");
    setOccurredAt(defaultDateTimeLocal());
    setDurationMinutes("");
    setLeadId(NO_LEAD);
    setLeadSearch("");
    setSaving(false);
  };

  const submit = async () => {
    if (!summary.trim()) {
      toast.error("El resumen es obligatorio");
      return;
    }
    const when = new Date(occurredAt);
    if (isNaN(when.getTime())) {
      toast.error("Fecha inválida");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        kind,
        direction,
        summary: summary.trim(),
        occurredAt: when,
        relatedPropertyId: propertyId,
      };
      if (body.trim()) payload.body = body.trim();
      if (showDuration && durationMinutes) {
        payload.durationSeconds = Number(durationMinutes) * 60;
      }
      if (leadId && leadId !== NO_LEAD) payload.relatedLeadId = leadId;

      const res = await createInteractionAction(payload);
      if (!res?.ok) throw new Error("No se pudo registrar la interacción");
      toast.success("Interacción registrada");
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo registrar";
      toast.error(msg);
      setSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4" /> Registrar interacción
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (saving) return;
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar interacción</DialogTitle>
            <DialogDescription>
              Queda asociada a esta propiedad. Asocia un lead para actualizar su último contacto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={kind} onValueChange={setKind} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELECTABLE_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {INTERACTION_KIND_LABEL[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SELECTABLE_DIRECTIONS.map((d) => {
                    const active = direction === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDirection(d)}
                        disabled={saving}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          active
                            ? "border-gold/40 bg-gold-faint text-gold"
                            : "border-border bg-elevated text-muted-foreground hover:text-foreground",
                          saving && "opacity-60",
                        )}
                      >
                        {INTERACTION_DIRECTION_LABEL[d]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumen</Label>
              <Input
                placeholder="Ej. Envié ficha por WhatsApp"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={saving}
                maxLength={240}
              />
            </div>

            <div className="space-y-2">
              <Label>Detalle (opcional)</Label>
              <Textarea
                rows={3}
                placeholder="Notas, siguiente paso, etc."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={saving}
                maxLength={8000}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cuándo</Label>
                <Input
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  disabled={saving}
                />
              </div>
              {showDuration && (
                <div className="space-y-2">
                  <Label>Duración (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1440"
                    placeholder="Ej. 15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    disabled={saving}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lead (opcional)</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre…"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  disabled={saving}
                  className="pl-9"
                />
              </div>
              <Select value={leadId} onValueChange={setLeadId} disabled={saving}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_LEAD}>Sin lead asociado</SelectItem>
                  {filteredLeads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.firstName} {l.lastName}
                    </SelectItem>
                  ))}
                  {filteredLeads.length === 0 && leadSearch && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Ningún lead coincide con "{leadSearch}"
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" /> Registrar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
