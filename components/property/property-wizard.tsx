"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import {
  PROPERTY_CATEGORY_LABEL,
  TRANSACTION_TYPE_LABEL,
  CONSERVATION_LABEL,
} from "@/lib/labels";
import { HERMOSILLO_ZONES, AMENITIES_POOL } from "@/lib/mock/fixtures";
import { cn } from "@/lib/utils";
import { GoogleMapPicker } from "@/components/property/google-map-picker";

const STEPS = [
  { id: 1, title: "Tipo y operación" },
  { id: 2, title: "Ubicación" },
  { id: 3, title: "Características" },
  { id: 4, title: "Precios" },
  { id: 5, title: "Imágenes + tour" },
  { id: 6, title: "Revisión" },
];

const DRAFT_KEY = "property-wizard-draft";

export function PropertyWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    category: "CASA",
    transactionType: "VENTA",
    title: "",
    description: "",
    zone: "Las Quintas",
    addressStreet: "",
    addressNumber: "",
    postalCode: "",
    latitude: null as number | null,
    longitude: null as number | null,
    bedrooms: "3",
    bathrooms: "2",
    parkingSpaces: "2",
    areaTotalM2: "320",
    areaBuiltM2: "220",
    conservation: "BUENA",
    priceSale: "4500000",
    priceRent: "",
    maintenanceFee: "",
    commission: "5",
    isFurnished: false,
    acceptsPets: true,
    amenities: ["Seguridad 24/7", "Jardín"],
    images: [] as { url: string }[],
    virtualTourUrl: "",
  });

  // Autosave draft local.
  React.useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setForm((f) => ({ ...f, ...JSON.parse(saved) }));
      } catch {}
    }
  }, []);
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        // Excluir imágenes del borrador: los data URLs pueden superar la cuota de localStorage.
        const { images: _omit, ...rest } = form;
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
        } catch {}
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [form]);

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const finish = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim() || "Propiedad sin título",
        description: form.description,
        transactionType: form.transactionType,
        category: form.category,
        priceSale: form.priceSale ? Number(form.priceSale) : undefined,
        priceRent: form.priceRent ? Number(form.priceRent) : undefined,
        maintenanceFee: form.maintenanceFee ? Number(form.maintenanceFee) : undefined,
        commission: form.commission ? Number(form.commission) : undefined,
        areaTotalM2: form.areaTotalM2 ? Number(form.areaTotalM2) : undefined,
        areaBuiltM2: form.areaBuiltM2 ? Number(form.areaBuiltM2) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        parkingSpaces: form.parkingSpaces ? Number(form.parkingSpaces) : undefined,
        conservation: form.conservation,
        isFurnished: form.isFurnished,
        acceptsPets: form.acceptsPets,
        amenities: form.amenities,
        zone: form.zone,
        addressStreet: form.addressStreet,
        addressNumber: form.addressNumber,
        postalCode: form.postalCode,
        latitude: form.latitude,
        longitude: form.longitude,
        virtualTourUrl: form.virtualTourUrl || undefined,
        images: form.images.map((i) => ({ url: i.url })),
      };
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Error ${res.status}`);
      }
      toast.success("Propiedad creada como borrador");
      localStorage.removeItem(DRAFT_KEY);
      router.push("/propiedades");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar";
      toast.error(msg);
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Stepper step={step} />

      <div className="rounded-lg border border-border bg-surface p-6 min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <Step title="Tipo y transacción" description="Define la categoría y tipo de operación.">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Tipo de propiedad">
                    <Select value={form.category} onValueChange={(v) => update("category", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PROPERTY_CATEGORY_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Transacción">
                    <Select value={form.transactionType} onValueChange={(v) => update("transactionType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRANSACTION_TYPE_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <FormField label="Título del anuncio" hint="Aparece en los listados y link público.">
                  <Input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="Casa con alberca en Las Quintas"
                  />
                </FormField>
                <FormField label="Descripción">
                  <Textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe los puntos fuertes, acabados y ubicación…"
                  />
                </FormField>
              </Step>
            )}

            {step === 2 && (
              <Step title="Ubicación" description="La dirección exacta se oculta en portales públicos.">
                <FormField label="Zona / colonia">
                  <Select
                    value={form.zone}
                    onValueChange={(v) => {
                      const z = HERMOSILLO_ZONES.find((x) => x.name === v);
                      setForm((f) => ({
                        ...f,
                        zone: v,
                        latitude: z ? z.lat : f.latitude,
                        longitude: z ? z.lng : f.longitude,
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HERMOSILLO_ZONES.map((z) => (
                        <SelectItem key={z.name} value={z.name}>{z.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <div className="grid gap-3 md:grid-cols-3">
                  <FormField label="Calle">
                    <Input
                      value={form.addressStreet}
                      onChange={(e) => update("addressStreet", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Número">
                    <Input
                      value={form.addressNumber}
                      onChange={(e) => update("addressNumber", e.target.value)}
                    />
                  </FormField>
                  <FormField label="Código postal">
                    <Input
                      placeholder="83100"
                      value={form.postalCode}
                      onChange={(e) => update("postalCode", e.target.value)}
                    />
                  </FormField>
                </div>
                <div className="mt-4">
                  <GoogleMapPicker
                    value={
                      form.latitude != null && form.longitude != null
                        ? { lat: form.latitude, lng: form.longitude }
                        : null
                    }
                    onChange={({ lat, lng }) =>
                      setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
                    }
                    onAddressResolved={(addr) => {
                      setForm((f) => {
                        const zoneMatch = addr.neighborhood
                          ? HERMOSILLO_ZONES.find(
                              (z) =>
                                z.name.toLowerCase() ===
                                addr.neighborhood!.toLowerCase(),
                            )
                          : undefined;
                        return {
                          ...f,
                          addressStreet: addr.street ?? f.addressStreet,
                          addressNumber: addr.number ?? f.addressNumber,
                          postalCode: addr.postalCode ?? f.postalCode,
                          zone: zoneMatch ? zoneMatch.name : f.zone,
                        };
                      });
                    }}
                    defaultCenter={(() => {
                      const z = HERMOSILLO_ZONES.find((x) => x.name === form.zone);
                      return z ? { lat: z.lat, lng: z.lng } : { lat: 29.0729, lng: -110.9559 };
                    })()}
                    searchAddress={[
                      form.addressStreet,
                      form.addressNumber,
                      form.zone,
                      form.postalCode,
                      "Hermosillo, Sonora, México",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step title="Características" description="Solo lo esencial — podrás completar más luego.">
                <div className="grid gap-3 md:grid-cols-4">
                  <FormField label="Recámaras">
                    <Input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} />
                  </FormField>
                  <FormField label="Baños">
                    <Input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
                  </FormField>
                  <FormField label="Cajones">
                    <Input type="number" value={form.parkingSpaces} onChange={(e) => update("parkingSpaces", e.target.value)} />
                  </FormField>
                  <FormField label="Conservación">
                    <Select value={form.conservation} onValueChange={(v) => update("conservation", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONSERVATION_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Terreno (m²)">
                    <Input type="number" value={form.areaTotalM2} onChange={(e) => update("areaTotalM2", e.target.value)} />
                  </FormField>
                  <FormField label="Construcción (m²)">
                    <Input type="number" value={form.areaBuiltM2} onChange={(e) => update("areaBuiltM2", e.target.value)} />
                  </FormField>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <SwitchRow
                    label="Amueblada"
                    checked={form.isFurnished}
                    onChange={(v) => update("isFurnished", v)}
                  />
                  <SwitchRow
                    label="Acepta mascotas"
                    checked={form.acceptsPets}
                    onChange={(v) => update("acceptsPets", v)}
                  />
                </div>
                <FormField label="Amenidades">
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_POOL.map((a) => {
                      const active = form.amenities.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() =>
                            update(
                              "amenities",
                              active
                                ? form.amenities.filter((x) => x !== a)
                                : [...form.amenities, a]
                            )
                          }
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            active
                              ? "border-gold/40 bg-gold-faint text-gold"
                              : "border-border bg-elevated text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </FormField>
              </Step>
            )}

            {step === 4 && (
              <Step title="Precios" description="Puedes dejar uno vacío si la operación es solo venta o solo renta.">
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Precio de venta (MXN)">
                    <Input type="number" value={form.priceSale} onChange={(e) => update("priceSale", e.target.value)} />
                  </FormField>
                  <FormField label="Renta mensual (MXN)">
                    <Input type="number" value={form.priceRent} onChange={(e) => update("priceRent", e.target.value)} />
                  </FormField>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Mantenimiento mensual">
                    <Input type="number" value={form.maintenanceFee} onChange={(e) => update("maintenanceFee", e.target.value)} />
                  </FormField>
                  <FormField label="Comisión %">
                    <Input type="number" value={form.commission} onChange={(e) => update("commission", e.target.value)} />
                  </FormField>
                </div>
              </Step>
            )}

            {step === 5 && (
              <Step title="Imágenes + tour" description="Sube fotos en alta. Marca la portada y elige cuáles son públicas.">
                <ImageUploader
                  images={form.images}
                  onChange={(v) => update("images", v)}
                />
                <FormField label="Link del tour virtual (Matterport, YouTube, Kuula)">
                  <Input
                    placeholder="https://…"
                    value={form.virtualTourUrl}
                    onChange={(e) => update("virtualTourUrl", e.target.value)}
                  />
                </FormField>
              </Step>
            )}

            {step === 6 && (
              <Step title="Revisión" description="Confirma los datos antes de guardar.">
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <ReviewRow label="Tipo" value={PROPERTY_CATEGORY_LABEL[form.category as keyof typeof PROPERTY_CATEGORY_LABEL]} />
                  <ReviewRow label="Transacción" value={TRANSACTION_TYPE_LABEL[form.transactionType as keyof typeof TRANSACTION_TYPE_LABEL]} />
                  <ReviewRow label="Título" value={form.title || "—"} />
                  <ReviewRow label="Zona" value={form.zone} />
                  <ReviewRow label="Precio" value={form.priceSale ? `$${Number(form.priceSale).toLocaleString()}` : "—"} />
                  <ReviewRow label="Renta" value={form.priceRent ? `$${Number(form.priceRent).toLocaleString()}` : "—"} />
                  <ReviewRow label="Imágenes" value={`${form.images.length} cargada(s)`} />
                  <ReviewRow label="Amenidades" value={form.amenities.join(", ") || "—"} />
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  Al guardar se crea como borrador. Publícala desde el detalle cuando estés lista.
                </p>
              </Step>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prev}
          disabled={step === 1}
          className="disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <p className="text-xs text-muted-foreground">
          Guardado automático: <span className="text-gold">on</span>
        </p>
        {step < STEPS.length ? (
          <Button onClick={next}>
            Continuar <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={finish} disabled={saving}>
            {saving ? "Guardando…" : "Guardar propiedad"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
              step > s.id
                ? "border-gold bg-gold text-black"
                : step === s.id
                  ? "border-gold bg-gold-faint text-gold"
                  : "border-border bg-elevated text-muted-foreground"
            )}
          >
            {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
          </div>
          <div className="hidden flex-1 sm:block">
            <p
              className={cn(
                "text-xs font-medium",
                step >= s.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.title}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("h-px flex-1", step > s.id ? "bg-gold" : "bg-border")} />
          )}
        </li>
      ))}
    </ol>
  );
}

function Step({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-border bg-elevated p-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-elevated p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 truncate">{value}</p>
    </div>
  );
}

const MAX_IMAGE_MB = 8;

type SignedUploadParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

async function fetchSignedUpload(): Promise<SignedUploadParams | null> {
  const res = await fetch("/api/upload/cloudinary-sign", { method: "POST" });
  if (!res.ok) return null;
  return (await res.json()) as SignedUploadParams;
}

function uploadToCloudinary(
  file: File,
  params: SignedUploadParams,
  onProgress: (pct: number) => void,
): Promise<{ url: string; thumbnailUrl?: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", params.apiKey);
    form.append("timestamp", String(params.timestamp));
    form.append("signature", params.signature);
    form.append("folder", params.folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve({ url: json.secure_url, thumbnailUrl: json.eager?.[0]?.secure_url });
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`Cloudinary ${xhr.status}: ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir a Cloudinary"));
    xhr.send(form);
  });
}

function ImageUploader({
  images,
  onChange,
}: {
  images: { url: string }[];
  onChange: (v: { url: string }[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState<{ name: string; pct: number }[]>([]);

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.error("Solo se aceptan imágenes");
      return;
    }
    const valid: File[] = [];
    for (const f of files) {
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`${f.name} supera ${MAX_IMAGE_MB} MB`);
      } else {
        valid.push(f);
      }
    }
    if (valid.length === 0) return;

    const signed = await fetchSignedUpload();

    if (!signed) {
      toast.error(
        "Cloudinary no está configurado. Agrega CLOUDINARY_* a tu .env para subir imágenes.",
      );
      return;
    }

    setUploading((s) => [...s, ...valid.map((f) => ({ name: f.name, pct: 0 }))]);
    const uploaded: { url: string }[] = [];
    for (const f of valid) {
      try {
        const r = await uploadToCloudinary(f, signed, (pct) => {
          setUploading((s) =>
            s.map((u) => (u.name === f.name ? { ...u, pct } : u)),
          );
        });
        uploaded.push({ url: r.url });
      } catch (err) {
        toast.error(`Falló ${f.name}: ${err instanceof Error ? err.message : "error"}`);
      } finally {
        setUploading((s) => s.filter((u) => u.name !== f.name));
      }
    }
    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
      toast.success(
        uploaded.length === 1 ? "Imagen subida" : `${uploaded.length} imágenes subidas`,
      );
    }
  };

  const openPicker = () => inputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const isBusy = uploading.length > 0;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "rounded-lg border-2 border-dashed border-border bg-bg p-6 transition-colors",
        isDragging ? "border-gold/60 bg-gold-faint/20" : "hover:border-gold/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onInputChange}
      />
      {images.length === 0 && !isBusy ? (
        <button
          type="button"
          onClick={openPicker}
          className="flex w-full flex-col items-center justify-center gap-3 py-10 text-muted-foreground hover:text-gold"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-faint text-gold">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Arrastra tus fotos aquí</p>
            <p className="text-xs">o haz click para seleccionar desde tu equipo</p>
            <p className="mt-1 text-[10px]">JPG, PNG o WebP · hasta {MAX_IMAGE_MB} MB c/u</p>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-[10px] text-white">
                {i === 0 ? <span className="text-gold">Portada</span> : <span>Foto {i + 1}</span>}
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                  aria-label="Eliminar"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {uploading.map((u) => (
            <div
              key={u.name}
              className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-border bg-elevated px-2 text-center text-[10px] text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin text-gold" />
              <span className="w-full truncate">{u.name}</span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-border">
                <div className="h-full bg-gold transition-all" style={{ width: `${u.pct}%` }} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={openPicker}
            disabled={isBusy}
            className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:text-gold hover:border-gold/40 disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
