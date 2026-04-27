"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatRelative, formatTime } from "@/lib/format";
import { toast } from "sonner";

const TEMPLATES = [
  {
    label: "Confirmar visita",
    body: "Hola {{nombre}} 👋 te confirmo tu visita a {{propiedad}} para {{fecha_visita}}. ¿Te parece bien?",
  },
  {
    label: "Ficha técnica",
    body: "Hola {{nombre}}, te paso la ficha de {{propiedad}}: {{link_publico}}. Precio: {{precio}}.",
  },
  {
    label: "Después de visita",
    body: "Gracias {{nombre}}, ¿qué te pareció {{propiedad}}? Si te nace alguna duda, estoy para apoyarte.",
  },
];

type Interaction = {
  id: string;
  kind: string;
  summary: string;
  occurredAt: Date | string;
  direction: string;
};

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  whatsapp: string | null;
  updatedAt: Date | string;
  interactions: Interaction[];
};

export function ComunicacionClient({ leads, initialContactId }: { leads: Lead[]; initialContactId?: string }) {
  const [selectedId, setSelectedId] = React.useState(initialContactId ?? leads[0]?.id);
  const [draft, setDraft] = React.useState("");
  const [search, setSearch] = React.useState("");

  const conv = leads.find((l) => l.id === selectedId);
  const messages = conv?.interactions ?? [];

  const send = () => {
    if (!draft.trim()) return;
    toast.success("Mensaje enviado (bridge con WhatsApp Cloud API pendiente)");
    setDraft("");
  };

  const filtered = leads.filter((l) =>
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox unificado"
        title="Comunicación"
        description="WhatsApp primero, pero canalizaremos email y SMS aquí también."
      />
      <div className="grid gap-3 rounded-lg border border-border bg-surface lg:grid-cols-[320px_1fr_300px] overflow-hidden">
        <div className="flex flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos"
              className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border">
            {filtered.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground text-center">Sin leads con WhatsApp.</li>
            )}
            {filtered.map((l) => {
              const last = l.interactions[0];
              return (
                <li
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={cn(
                    "cursor-pointer p-3 transition-colors",
                    selectedId === l.id
                      ? "bg-gold/5 border-l-2 border-gold"
                      : "hover:bg-elevated"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-xs font-semibold text-gold">
                      {l.firstName[0]}{l.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {l.firstName} {l.lastName}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatRelative(l.updatedAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {last?.summary ?? last?.kind ?? l.whatsapp ?? "—"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {conv ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border p-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-xs font-semibold text-gold">
                {conv.firstName[0]}{conv.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{conv.firstName} {conv.lastName}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  WhatsApp · {conv.whatsapp}
                </p>
              </div>
              <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/leads/${conv.id}`}>
                  <ArrowRight className="h-4 w-4" /> Ficha
                </Link>
              </Button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4 max-h-[55vh]">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Sin interacciones registradas.</p>
              )}
              {[...messages].reverse().map((m) => {
                const outgoing = m.direction === "SALIENTE" || m.direction === "OUTBOUND";
                return (
                  <div key={m.id} className={cn("flex", outgoing ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[72%] rounded-lg px-3 py-2 text-sm",
                        outgoing
                          ? "bg-gold text-black"
                          : "bg-elevated text-foreground border border-border"
                      )}
                    >
                      <p>{m.summary ?? m.kind}</p>
                      <p className={cn("mt-1 text-[10px] text-right", outgoing ? "text-black/60" : "text-muted-foreground")}>
                        {formatTime(new Date(m.occurredAt))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                <Input
                  placeholder="Escribe un mensaje…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <Button onClick={send}>
                  <Send className="h-4 w-4" /> Enviar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Elige una conversación.</p>
          </div>
        )}

        <aside className="border-l border-border p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {conv && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Contacto</p>
              <h3 className="mt-1 font-serif text-lg">{conv.firstName} {conv.lastName}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Lead activo</p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href={`/leads/${conv.id}`}>
                  <Sparkles className="h-4 w-4" /> Abrir ficha 360°
                </Link>
              </Button>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Plantillas</p>
            <div className="mt-2 space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setDraft(t.body)}
                  className="w-full rounded-md border border-border bg-elevated p-3 text-left transition-colors hover:border-gold/40"
                >
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">{t.body}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Quick actions</p>
            <div className="mt-2 space-y-1 text-xs">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <MessageSquare className="h-3 w-3" /> Convertir en lead
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">Agregar tarea</Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">Agendar visita</Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
