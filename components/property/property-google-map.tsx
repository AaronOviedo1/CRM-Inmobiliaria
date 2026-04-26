"use client";

import * as React from "react";
import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatMoneyCompact } from "@/lib/format";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_TONE } from "@/lib/labels";
import { StatusPill } from "@/components/common/status-pill";
import { loadGoogleMaps, DARK_MAP_STYLE } from "@/lib/google-maps";

/// Centro de Hermosillo — fallback si no hay propiedades con coordenadas.
const HERMOSILLO_CENTER = { lat: 29.0729, lng: -110.9559 };

export function PropertyGoogleMap({
  properties,
}: {
  properties: Property[];
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const [selected, setSelected] = React.useState<Property | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    apiKey ? "loading" : "error",
  );
  const [errorReason, setErrorReason] = React.useState<string | null>(null);

  const geolocated = React.useMemo(
    () => properties.filter((p) => p.latitude != null && p.longitude != null),
    [properties],
  );

  /// Inicializa el mapa una sola vez (no re-crea por cambio de props).
  React.useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((google: any) => {
        if (cancelled || !containerRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: HERMOSILLO_CENTER,
          zoom: 12,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: DARK_MAP_STYLE,
          backgroundColor: "#0c0f14",
          clickableIcons: false,
        });
        mapRef.current = map;
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[property-map]", err);
        setErrorReason(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  /// Re-renderiza marcadores cuando cambia la lista (p. ej. al aplicar filtros).
  React.useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    const w = window as any;
    const google = w.google;
    if (!google) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (geolocated.length === 0) {
      mapRef.current.setCenter(HERMOSILLO_CENTER);
      mapRef.current.setZoom(12);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const p of geolocated) {
      const pos = { lat: Number(p.latitude), lng: Number(p.longitude) };
      const featured = (p.viewsCount ?? 0) > 400;
      const marker = new google.maps.Marker({
        position: pos,
        map: mapRef.current,
        title: p.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: featured ? 9 : 7,
          fillColor: "#d4b26a",
          fillOpacity: featured ? 1 : 0.85,
          strokeColor: "#0c0f14",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => setSelected(p));
      markersRef.current.push(marker);
      bounds.extend(pos);
    }

    if (geolocated.length === 1) {
      mapRef.current.setCenter(bounds.getCenter());
      mapRef.current.setZoom(15);
    } else {
      mapRef.current.fitBounds(bounds, 64);
    }
  }, [status, geolocated]);

  if (!apiKey) {
    return (
      <div className="relative h-[70vh] overflow-hidden rounded-lg border border-border bg-surface">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <span>Google Maps no está configurado.</span>
          <span className="text-xs opacity-70">
            Define <code className="text-gold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en el .env.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-lg border border-border bg-surface">
      <div ref={containerRef} className="absolute inset-0" />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/40 text-xs text-muted-foreground backdrop-blur-sm">
          Cargando mapa…
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center text-xs text-muted-foreground">
          <span>No se pudo cargar Google Maps.</span>
          {errorReason === "auth-failed" ? (
            <span className="opacity-70">
              API key rechazada: revisa billing, APIs habilitadas y HTTP referrers.
            </span>
          ) : (
            <span className="opacity-70">
              Revisa la consola del navegador para ver el error exacto.
            </span>
          )}
        </div>
      )}

      {selected && (
        <div className="absolute bottom-5 right-5 z-20 w-80 overflow-hidden rounded-lg border border-border bg-elevated shadow-soft">
          <div className="relative aspect-[16/9] bg-bg">
            {selected.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.coverImageUrl}
                className="h-full w-full object-cover"
                alt={selected.title}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Sin imagen
              </div>
            )}
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
                  selected.currency,
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

      <div className="absolute left-5 top-5 z-10 rounded-md border border-border bg-bg/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
        <p>
          <span className="text-foreground font-medium">{geolocated.length}</span>{" "}
          de {properties.length} con ubicación
        </p>
        <p className="mt-0.5">Hermosillo · Sonora</p>
      </div>
    </div>
  );
}
