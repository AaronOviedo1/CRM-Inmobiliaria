"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Loader2, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduleViewingAction } from "@/app/_actions/viewings";

export type LeadOption = { id: string; firstName: string; lastName: string };
export type AgentOption = { id: string; name: string };

const NO_LEAD = "__no_lead__";

const DURATION_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora 30 min" },
  { value: "120", label: "2 horas" },
];

// Redondea al próximo bloque de 15 min y devuelve el string aceptado por
// `<input type="datetime-local">` (YYYY-MM-DDTHH:mm, en hora local).
function defaultDateTimeLocal(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleViewingDialog({
  propertyId,
  leads,
  agents,
  defaultAgentId,
  size = "default",
}: {
  propertyId: string;
  leads: LeadOption[];
  agents: AgentOption[];
  defaultAgentId?: string | null;
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const pickDefaultAgent = () => {
    if (defaultAgentId && agents.some((a) => a.id === defaultAgentId)) {
      return defaultAgentId;
    }
    return agents[0]?.id ?? "";
  };

  const [leadId, setLeadId] = React.useState<string>(NO_LEAD);
  const [agentId, setAgentId] = React.useState<string>(pickDefaultAgent());
  const [scheduledAt, setScheduledAt] = React.useState<string>(
    defaultDateTimeLocal(),
  );
  const [durationMinutes, setDurationMinutes] = React.useState<string>("45");
  const [meetingPoint, setMeetingPoint] = React.useState<string>("");
  const [leadSearch, setLeadSearch] = React.useState("");

  const filteredLeads = React.useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(q),
    );
  }, [leadSearch, leads]);

  const reset = () => {
    setLeadId(NO_LEAD);
    setAgentId(pickDefaultAgent());
    setScheduledAt(defaultDateTimeLocal());
    setDurationMinutes("45");
    setMeetingPoint("");
    setLeadSearch("");
    setSaving(false);
  };

  const submit = async () => {
    if (!agentId) {
      toast.error("Selecciona un agente");
      return;
    }
    if (!scheduledAt) {
      toast.error("Selecciona fecha y hora");
      return;
    }
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime())) {
      toast.error("Fecha inválida");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        propertyId,
        agentId,
        scheduledAt: when,
        durationMinutes: Number(durationMinutes),
      };
      if (leadId && leadId !== NO_LEAD) payload.leadId = leadId;
      if (meetingPoint.trim()) payload.meetingPoint = meetingPoint.trim();

      const res = await scheduleViewingAction(payload);
      if (!res?.ok) {
        if (res?.error === "AGENT_CONFLICT") {
          throw new Error(
            "El agente tiene otra visita en ese horario. Ajusta la fecha o elige otro.",
          );
        }
        throw new Error("No se pudo agendar");
      }
      toast.success("Visita agendada");
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo agendar";
      toast.error(msg);
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="outline" size={size} onClick={() => setOpen(true)}>
        <Calendar className="h-4 w-4" /> Agendar nueva visita
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (saving) return;
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar visita</DialogTitle>
            <DialogDescription>
              Si eliges un lead con WhatsApp, se envía el recordatorio automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            <div className="space-y-2">
              <Label>Agente</Label>
              <Select value={agentId} onValueChange={setAgentId} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha y hora</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Duración</Label>
                <Select
                  value={durationMinutes}
                  onValueChange={setDurationMinutes}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Punto de encuentro (opcional)</Label>
              <Input
                placeholder="Ej. entrada del fraccionamiento, caseta de seguridad…"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                disabled={saving}
                maxLength={200}
              />
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Agendando…
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" /> Agendar visita
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
