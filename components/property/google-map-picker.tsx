"use client";

import * as React from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadGoogleMaps, DARK_MAP_STYLE } from "@/lib/google-maps";

type LatLng = { lat: number; lng: number };

export type ResolvedAddress = {
  street?: string;
  number?: string;
  postalCode?: string;
  neighborhood?: string;
  formatted?: string;
};

type Props = {
  value: LatLng | null;
  onChange: (loc: LatLng) => void;
  onAddressResolved?: (addr: ResolvedAddress) => void;
  defaultCenter: LatLng;
  searchAddress?: string;
};

function parseAddressComponents(
  components: any[] | undefined,
  formatted?: string
): ResolvedAddress {
  const out: ResolvedAddress = { formatted };
  if (!components) return out;
  for (const c of components) {
    const types: string[] = c.types ?? [];
    if (types.includes("route")) out.street = c.long_name;
    else if (types.includes("street_number")) out.number = c.long_name;
    else if (types.includes("postal_code")) out.postalCode = c.long_name;
    else if (
      !out.neighborhood &&
      (types.includes("sublocality_level_1") ||
        types.includes("sublocality") ||
        types.includes("neighborhood"))
    ) {
      out.neighborhood = c.long_name;
    }
  }
  return out;
}

export function GoogleMapPicker({
  value,
  onChange,
  onAddressResolved,
  defaultCenter,
  searchAddress,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any>(null);
  const geocoderRef = React.useRef<any>(null);
  const onChangeRef = React.useRef(onChange);
  const onAddressResolvedRef = React.useRef(onAddressResolved);
  const suppressIdleRef = React.useRef(false);
  const reverseReqIdRef = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    apiKey ? "loading" : "error"
  );
  const [errorReason, setErrorReason] = React.useState<string | null>(null);
  const [geocoding, setGeocoding] = React.useState(false);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    onAddressResolvedRef.current = onAddressResolved;
  }, [onAddressResolved]);

  const reverseGeocode = React.useCallback(async (loc: LatLng) => {
    const cb = onAddressResolvedRef.current;
    if (!cb || !geocoderRef.current) return;
    const reqId = ++reverseReqIdRef.current;
    try {
      const res: any = await geocoderRef.current.geocode({ location: loc });
      if (reqId !== reverseReqIdRef.current) return;
      const hit = res?.results?.[0];
      if (!hit) return;
      cb(parseAddressComponents(hit.address_components, hit.formatted_address));
    } catch {
      // silently ignore — red de Google inestable, usuario puede mover el pin otra vez.
    }
  }, []);

  React.useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((google: any) => {
        if (cancelled || !containerRef.current) return;
        const center = value ?? defaultCenter;
        const map = new google.maps.Map(containerRef.current, {
          center,
          zoom: 15,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: DARK_MAP_STYLE,
          backgroundColor: "#0c0f14",
        });
        map.addListener("dragstart", () => setDragging(true));
        map.addListener("dragend", () => setDragging(false));
        map.addListener("idle", () => {
          if (suppressIdleRef.current) {
            suppressIdleRef.current = false;
            return;
          }
          const c = map.getCenter();
          if (!c) return;
          const next = { lat: c.lat(), lng: c.lng() };
          onChangeRef.current(next);
          reverseGeocode(next);
        });
        map.addListener("click", (e: any) => {
          if (!e.latLng) return;
          map.panTo(e.latLng);
        });
        mapRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("[google-maps]", err);
        setErrorReason(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  React.useEffect(() => {
    if (status !== "ready" || !value || !mapRef.current) return;
    const current = mapRef.current.getCenter?.();
    if (
      current &&
      Math.abs(current.lat() - value.lat) < 1e-6 &&
      Math.abs(current.lng() - value.lng) < 1e-6
    ) {
      return;
    }
    suppressIdleRef.current = true;
    mapRef.current.panTo(value);
  }, [status, value?.lat, value?.lng]);

  const handleGeocode = React.useCallback(async () => {
    if (!searchAddress?.trim() || !geocoderRef.current) return;
    setGeocoding(true);
    try {
      const res: any = await geocoderRef.current.geocode({
        address: searchAddress,
      });
      const hit = res?.results?.[0];
      if (!hit) return;
      const loc = hit.geometry.location;
      const next = { lat: loc.lat(), lng: loc.lng() };
      suppressIdleRef.current = true;
      mapRef.current?.panTo(next);
      mapRef.current?.setZoom(17);
      onChangeRef.current(next);
      onAddressResolvedRef.current?.(
        parseAddressComponents(hit.address_components, hit.formatted_address)
      );
    } catch {
      // noop
    } finally {
      setGeocoding(false);
    }
  }, [searchAddress]);

  if (!apiKey) {
    return (
      <div className="rounded-md border border-border bg-bg aspect-[16/7] relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
          <MapPin className="h-5 w-5 text-gold/60" />
          Google Maps no está configurado.
          <span className="text-xs opacity-70">
            Define <code className="text-gold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> en el .env.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md border border-border bg-bg">
        <div ref={containerRef} className="absolute inset-0" />
        {status === "ready" && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full"
            aria-hidden
          >
            <div
              className={cn(
                "flex flex-col items-center transition-transform duration-150",
                dragging ? "-translate-y-2" : "translate-y-0"
              )}
            >
              <MapPin
                className="h-9 w-9 text-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                strokeWidth={2.5}
                fill="rgba(212, 178, 106, 0.25)"
              />
              <span
                className={cn(
                  "mt-[-4px] block h-2 w-2 rounded-full bg-black/60 blur-[1px] transition-all",
                  dragging ? "h-1.5 w-4 opacity-70" : "opacity-90"
                )}
              />
            </div>
          </div>
        )}
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
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
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Mueve el mapa para centrar el pin en la ubicación exacta.</span>
        {searchAddress?.trim() && status === "ready" && (
          <button
            type="button"
            onClick={handleGeocode}
            disabled={geocoding}
            className="inline-flex items-center gap-1 text-gold hover:text-gold-hover disabled:opacity-50"
          >
            <Search className="h-3 w-3" />
            {geocoding ? "Buscando…" : "Buscar esta dirección"}
          </button>
        )}
      </div>
    </div>
  );
}
