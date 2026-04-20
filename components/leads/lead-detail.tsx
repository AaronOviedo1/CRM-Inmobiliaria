"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  Flag,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Sparkles,
  Target,
  User,
  Wallet,
} from "lucide-react";
import type { Interaction, Lead, MatchSuggestion, Task } from "@/lib/types";
import {
  LEAD_INTENT_LABEL,
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_TONE,
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_TONE,
} from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatMoney,
  formatRelative,
  formatPhone,
} from "@/lib/format";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { MatchCard } from "@/components/matching/match-card";
import { QuickLogInteractionDialog } from "./quick-log-interaction";

interface Props {
  lead: Lead;
  interactions: Interaction[];
  matches: MatchSuggestion[];
  tasks: Task[];
}

export function LeadDetail({ lead, interactions, matches, tasks }: Props) {
  const [logOpen, setLogOpen] = React.useState(false);

  return (
    <div className="relative grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusPill tone={LEAD_STATUS_TONE[lead.status]}>
                {LEAD_STATUS_LABEL[lead.status]}
              </StatusPill>
              <h1 className="mt-3 font-serif text-3xl font-medium">
                {lead.firstName} {lead.lastName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Creado {formatRelative(lead.createdAt)} · Fuente{" "}
                {LEAD_SOURCE_LABEL[lead.source]}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full border border-gold/40 bg-gold-faint px-3 py-1 text-lg font-semibold text-gold">
                {lead.qualificationScore ?? "—"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Score
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<Target className="h-4 w-4" />} label="Intent">
              {LEAD_INTENT_LABEL[lead.intent]}
            </Stat>
            <Stat icon={<Wallet className="h-4 w-4" />} label="Presupuesto">
              {lead.budgetMin && lead.budgetMax
                ? `${formatMoney(lead.budgetMin, lead.currency)} — ${formatMoney(lead.budgetMax, lead.currency)}`
                : "—"}
            </Stat>
            <Stat icon={<MapPin className="h-4 w-4" />} label="Zonas">
              {lead.desiredZones.slice(0, 2).join(", ") || "—"}
            </Stat>
            <Stat icon={<User className="h-4 w-4" />} label="Agente">
              {lead.assignedAgent?.name ?? "Sin asignar"}
            </Stat>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3 text-xs">
            <Contact label="Teléfono" value={formatPhone(lead.phone)} icon={<Phone className="h-3 w-3" />} />
            <Contact label="WhatsApp" value={formatPhone(lead.whatsapp)} icon={<MessageSquare className="h-3 w-3" />} />
            <Contact label="Correo" value={lead.email ?? "—"} icon={<Copy className="h-3 w-3" />} />
          </div>
        </div>

        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Preferencias</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
            <Pref label="Recámaras mínimas" value={lead.minBedrooms ?? "—"} />
            <Pref label="Baños mínimos" value={lead.minBathrooms ?? "—"} />
            <Pref label="Estacionamiento" value={lead.minParkingSpaces ?? "—"} />
            <Pref label="Área mínima" value={lead.minAreaM2 ? `${lead.minAreaM2} m²` : "—"} />
            <Pref
              label="Must-have"
              value={lead.mustHaves.join(", ") || "—"}
            />
            <Pref
              label="Nice-to-have"
              value={lead.niceToHaves.join(", ") || "—"}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Timeline</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Registrar interacción
            </Button>
          </div>
          <div className="mt-4">
            <ActivityTimeline interactions={interactions} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">
              Matches sugeridos
              <span className="ml-2 text-sm text-muted-foreground">
                ({matches.length})
              </span>
            </h2>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/matching">Ver más →</Link>
            </Button>
          </div>
          {matches.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aún no hay matches propuestos.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {matches.slice(0, 4).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Button
          size="lg"
          className="w-full"
          onClick={() => setLogOpen(true)}
        >
          <MessageSquare className="h-4 w-4" /> Registrar interacción
        </Button>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="font-serif text-lg">Próximas tareas</h3>
          <ul className="mt-3 space-y-2">
            {tasks.length === 0 && (
              <li className="text-xs text-muted-foreground">Sin tareas abiertas.</li>
            )}
            {tasks.slice(0, 4).map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-2 rounded-md border border-border bg-elevated p-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{t.title}</p>
                  {t.dueAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatDate(t.dueAt)}
                    </p>
                  )}
                </div>
                <StatusPill size="sm" tone={TASK_PRIORITY_TONE[t.priority]}>
                  {TASK_PRIORITY_LABEL[t.priority]}
                </StatusPill>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3 w-full">
            <Plus className="h-4 w-4" /> Agregar tarea
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="font-serif text-lg">Cambio rápido</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Button size="sm" variant="outline">
              <Flag className="h-4 w-4" /> Mark ganado
            </Button>
            <Button size="sm" variant="outline">
              Marcar perdido
            </Button>
            <Button size="sm" variant="outline">
              Calificar
            </Button>
            <Button size="sm" variant="outline">
              <Sparkles className="h-4 w-4" /> Convertir
            </Button>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            TODO(backend): acciones mutan Lead.status y disparan Interaction EVENTO_SISTEMA.
          </p>
        </div>
      </aside>

      <QuickLogInteractionDialog open={logOpen} onOpenChange={setLogOpen} />
    </div>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-elevated p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{children}</p>
    </div>
  );
}

function Contact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-elevated p-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate">{value}</p>
      </div>
    </div>
  );
}

function Pref({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}
