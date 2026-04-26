/// Loader y estilo compartidos para Google Maps JS API.
/// Deduplicamos la carga del script con un `loaderPromise` module-scoped para
/// que múltiples componentes (picker del wizard, mapa de listado, etc.) puedan
/// pedir el SDK en paralelo sin insertar el script varias veces.

let loaderPromise: Promise<any> | null = null;
let authFailed = false;

export function loadGoogleMaps(apiKey: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  const w = window as any;
  if (w.google?.maps?.Map) return Promise.resolve(w.google);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    w.gm_authFailure = () => {
      authFailed = true;
      console.error(
        "[google-maps] gm_authFailure — API key inválida, sin billing, o HTTP referrer no autorizado.",
      );
      reject(new Error("auth-failed"));
    };
    const callbackName = `__gm_cb_${Date.now()}`;
    w[callbackName] = () => {
      if (authFailed) return;
      if (w.google?.maps?.Map) resolve(w.google);
      else reject(new Error("google-maps-load-failed"));
      delete w[callbackName];
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places,marker&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.addEventListener("error", (e) => {
      console.error("[google-maps] script error", e);
      reject(new Error("script-error"));
    });
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export const DARK_MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#111319" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c0f14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a3a3a3" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d4b26a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1b2a1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c1f26" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0c0f14" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2a2d36" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d4b26a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a0f1a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4f6378" }],
  },
];
