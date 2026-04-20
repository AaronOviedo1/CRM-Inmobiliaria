"use client";

import type {
  MatchSuggestion,
  Offer,
  Property,
  PropertyDocument,
  Viewing,
} from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  VIEWING_STATUS_LABEL,
  VIEWING_STATUS_TONE,
  OFFER_STATUS_LABEL,
  OFFER_STATUS_TONE,
  OFFER_KIND_LABEL,
  PROPERTY_DOCUMENT_TYPE_LABEL,
  MATCH_STATUS_LABEL,
} from "@/lib/labels";
import {
  formatDate,
  formatDateTime,
  formatMoneyCompact,
  formatRelative,
} from "@/lib/format";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  History,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Props {
  property: Property;
  viewings: Viewing[];
  offers: Offer[];
  matches: MatchSuggestion[];
  documents?: PropertyDocument[];
}

export function PropertyDetailTabs({
  property,
  viewings,
  offers,
  matches,
  documents = [],
}: Props) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="info">Información</TabsTrigger>
        <TabsTrigger value="viewings">
          Visitas <span className="ml-1 rounded bg-muted px-1 text-[10px]">{viewings.length}</span>
        </TabsTrigger>
        <TabsTrigger value="offers">
          Ofertas <span className="ml-1 rounded bg-muted px-1 text-[10px]">{offers.length}</span>
        </TabsTrigger>
        <TabsTrigger value="matches">
          Matches <span className="ml-1 rounded bg-muted px-1 text-[10px]">{matches.length}</span>
        </TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
        <TabsTrigger value="history">Historial</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h4 className="font-serif text-lg">Detalles técnicos</h4>
            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <DetailRow label="Código" value={property.code} />
              <DetailRow label="Año" value={property.yearBuilt ?? "—"} />
              <DetailRow label="Pisos" value={property.floors ?? "—"} />
              <DetailRow label="Terreno" value={property.areaTotalM2 ? `${property.areaTotalM2} m²` : "—"} />
              <DetailRow label="Construcción" value={property.areaBuiltM2 ? `${property.areaBuiltM2} m²` : "—"} />
              <DetailRow label="½ baños" value={property.halfBathrooms ?? "—"} />
              <DetailRow label="Amueblado" value={property.isFurnished ? "Sí" : "No"} />
              <DetailRow label="Pet-friendly" value={property.acceptsPets ? "Sí" : "No"} />
              <DetailRow label="Alberca" value={property.hasPool ? "Sí" : "No"} />
              <DetailRow label="Jardín" value={property.hasGarden ? "Sí" : "No"} />
              <DetailRow label="Estudio" value={property.hasStudy ? "Sí" : "No"} />
              <DetailRow label="Cuarto servicio" value={property.hasServiceRoom ? "Sí" : "No"} />
            </dl>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <h4 className="font-serif text-lg">Amenidades</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground"
                >
                  {a}
                </span>
              ))}
              {property.amenities.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin amenidades capturadas.</p>
              )}
            </div>
            {property.internalNotes && (
              <div className="mt-5 rounded-md border border-dashed border-warning/30 bg-warning/5 p-3 text-xs">
                <p className="text-warning font-medium uppercase tracking-wider text-[10px]">
                  Nota interna
                </p>
                <p className="mt-1 text-foreground">{property.internalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="viewings">
        {viewings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay visitas agendadas.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {viewings.map((v) => (
              <li key={v.id} className="flex items-center gap-3 p-4">
                <Calendar className="h-4 w-4 text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {v.lead ? `${v.lead.firstName} ${v.lead.lastName}` : "Cliente"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(v.scheduledAt)} · {v.durationMinutes} min ·{" "}
                    {v.agent?.name}
                  </p>
                </div>
                <StatusPill tone={VIEWING_STATUS_TONE[v.status]}>
                  {VIEWING_STATUS_LABEL[v.status]}
                </StatusPill>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" /> Agendar nueva visita
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="offers">
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ofertas registradas.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {offers.map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-faint text-gold">
                  <Send className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {formatMoneyCompact(o.offeredAmount, o.currency)} ·{" "}
                    {OFFER_KIND_LABEL[o.offerKind]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.lead ? `${o.lead.firstName} ${o.lead.lastName}` : "—"} · creado {formatRelative(o.createdAt)}
                  </p>
                </div>
                <StatusPill tone={OFFER_STATUS_TONE[o.status]}>
                  {OFFER_STATUS_LABEL[o.status]}
                </StatusPill>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="matches">
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no se han generado matches con leads.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {matches.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-gold/30 bg-gold-faint text-gold font-serif text-lg">
                  {Math.round(m.score)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {m.lead?.firstName} {m.lead?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.matchReasons.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <Link
                  href={`/leads/${m.leadId}`}
                  className="text-xs text-gold hover:text-gold-hover"
                >
                  Abrir →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="documents">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin documentos cargados.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {PROPERTY_DOCUMENT_TYPE_LABEL[d.type]} · subido {formatDate(d.uploadedAt)}
                    {d.isPublicToOwnerPortal && " · Visible al propietario"}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" /> Descargar
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4" /> Subir documento
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="history">
        <ol className="relative space-y-4 border-l border-border pl-4 text-sm">
          <HistoryItem icon={<History className="h-3 w-3" />} title="Propiedad creada" date={property.createdAt} />
          <HistoryItem icon={<Sparkles className="h-3 w-3" />} title="Publicada" date={property.publishedAt ?? property.createdAt} />
          <HistoryItem icon={<Users className="h-3 w-3" />} title={`${property.viewsCount} vistas acumuladas`} />
          <HistoryItem icon={<MessageSquare className="h-3 w-3" />} title={`${property.inquiriesCount} consultas recibidas`} />
        </ol>
      </TabsContent>
    </Tabs>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </>
  );
}

function HistoryItem({
  icon,
  title,
  date,
}: {
  icon: React.ReactNode;
  title: string;
  date?: Date;
}) {
  return (
    <li className="relative">
      <div className="absolute -left-[21px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-muted-foreground">
        {icon}
        <ChevronRight className="h-3 w-3 hidden" />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-foreground">{title}</p>
        {date && <time className="text-xs text-muted-foreground">{formatDate(date)}</time>}
      </div>
    </li>
  );
}
