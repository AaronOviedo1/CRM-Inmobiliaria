/// Geocoding: dirección → (lat, lng). Usa Mapbox si está configurado, si no Google, si no no-op.

import { env, isMapboxConfigured, isGoogleMapsConfigured } from "../env";

export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress?: string;
  precision: "exact" | "approx" | "city";
};

export async function geocode(
  query: string,
): Promise<GeocodeResult | null> {
  if (!query || query.trim().length < 3) return null;

  try {
    if (isMapboxConfigured()) {
      return geocodeMapbox(query);
    }
    if (isGoogleMapsConfigured()) {
      return geocodeGoogle(query);
    }
  } catch (err) {
    console.error("[geocode] error:", err);
  }
  return null;
}

async function geocodeMapbox(q: string): Promise<GeocodeResult | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    q,
  )}.json?country=mx&limit=1&access_token=${env.mapboxToken}`;
  const r = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!r.ok) return null;
  const data = (await r.json()) as {
    features?: Array<{
      center: [number, number];
      place_name: string;
      relevance: number;
      place_type: string[];
    }>;
  };
  const f = data.features?.[0];
  if (!f) return null;
  return {
    lat: f.center[1],
    lng: f.center[0],
    formattedAddress: f.place_name,
    precision:
      f.relevance >= 0.9 ? "exact" : f.relevance >= 0.6 ? "approx" : "city",
  };
}

async function geocodeGoogle(q: string): Promise<GeocodeResult | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    q,
  )}&region=mx&key=${env.googleMapsKey}`;
  const r = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!r.ok) return null;
  const data = (await r.json()) as {
    results?: Array<{
      geometry: { location: { lat: number; lng: number }; location_type: string };
      formatted_address: string;
    }>;
    status: string;
  };
  const res = data.results?.[0];
  if (!res) return null;
  return {
    lat: res.geometry.location.lat,
    lng: res.geometry.location.lng,
    formattedAddress: res.formatted_address,
    precision:
      res.geometry.location_type === "ROOFTOP"
        ? "exact"
        : res.geometry.location_type === "RANGE_INTERPOLATED"
        ? "approx"
        : "city",
  };
}
