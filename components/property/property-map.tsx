"use client";

import * as React from "react";
import Link from "next/link";
import type { Property } from "@/lib/types";
import { HERMOSILLO_ZONES } from "@/lib/mock/fixtures";
import { formatMoneyCompact } from "@/lib/format";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { cn } from "@/lib/utils";

/**
 * Mapa estilizado. TODO(backend): conectar a react-leaflet / mapbox reales.
 * Esta implementación es dark + dorada, liviana, sin dependencias externas de runtime,
 * para que el build funcione incluso antes de instalar leaflet.
 */
export function PropertyMap({
  properties,
}: {
  properties: Property[];
}) {
  const [selected, setSelected] = React.useState<Property | null>(null);

  // bounding box de Hermosillo
  const lats = HERMOSILLO_ZONES.map((z) => z.lat);
  const lngs = HERMOSILLO_ZONES.map((z) => z.lng);
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-lg border border-border bg-surface">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0f14] via-[#111319] to-[#0a0a0b]" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      {HERMOSILLO_ZONES.map((z) => {
        const { x, y } = project(z.lat, z.lng);
        return (
          <div
            key={z.name}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <span className="rounded-full border border-gold/20 bg-bg/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {z.name}
            </span>
          </div>
        );
      })}

      {properties.map((p) => {
        if (!p.latitude || !p.longitude) return null;
        const { x, y } = project(p.latitude, p.longitude);
        const featured = p.viewsCount > 400;
        return (
          <button
            type="button"
            key={p.id}
            onClick={() => setSelected(p)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
          >
            <span className="relative flex">
              {featured && (
                <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-gold opacity-60" />
              )}
              <span
                className={cn(
                  "relative inline-flex items-center justify-center rounded-full border transition-all group-hover:scale-125",
                  featured
                    ? "h-4 w-4 bg-gold border-gold"
                    : "h-3 w-3 bg-gold/70 border-gold/40"
                )}
              />
            </span>
          </button>
        );
      })}

      {selected && (
        <div className="absolute bottom-5 right-5 w-80 overflow-hidden rounded-lg border border-border bg-elevated shadow-soft">
          <div className="relative aspect-[16/9] bg-bg">
            <img
              src={selected.coverImageUrl ?? ""}
              className="h-full w-full object-cover"
              alt={selected.title}
            />
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
            >
              Cerrar
            </button>
          </div>
          <div className="p-4">
            <StatusPill tone={PROPERTY_STATUS_TONE[selected.status]} size="sm">
              {PROPERTY_STATUS_LABEL[selected.status]}
            </StatusPill>
            <p className="mt-2 font-serif text-lg leading-tight">{selected.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selected.neighborhood} · {selected.code}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="font-serif text-xl text-gold">
                {formatMoneyCompact(
                  selected.priceSale ?? selected.priceRent ?? 0,
                  selected.currency
                )}
              </p>
              <Link
                href={`/propiedades/${selected.id}`}
                className="text-xs text-gold hover:text-gold-hover"
              >
                Ver detalle →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="absolute left-5 top-5 rounded-md border border-border bg-bg/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
        <p>
          <span className="text-foreground font-medium">{properties.length}</span>{" "}
          propiedades
        </p>
        <p className="mt-0.5">Hermosillo · Sonora</p>
      </div>
    </div>
  );
}
