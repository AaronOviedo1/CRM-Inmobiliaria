"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ImagePlus, X } from "lucide-react";
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
      if (typeof window !== "undefined")
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 1000);
    return () => clearTimeout(t);
  }, [form]);

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const finish = () => {
    setSaving(true);
    // TODO(backend): POST /api/properties; al ok → navigate al detalle.
    setTimeout(() => {
      toast.success("Propiedad guardada como borrador");
      localStorage.removeItem(DRAFT_KEY);
      router.push("/propiedades");
    }, 700);
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
                  <Select value={form.zone} onValueChange={(v) => update("zone", v)}>
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
                    <Input placeholder="83100" />
                  </FormField>
                </div>
                <div className="mt-4 rounded-md border border-border bg-bg aspect-[16/7] relative overflow-hidden">
                  <div className="absolute inset-0 bg-dots opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Arrastra el pin para ajustar ubicación exacta.
                    <br />
                    <span className="text-xs opacity-60">(TODO(backend): integrar react-leaflet)</span>
                  </div>
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

function ImageUploader({
  images,
  onChange,
}: {
  images: { url: string }[];
  onChange: (v: { url: string }[]) => void;
}) {
  const addMock = () => {
    const mockUrls = [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    ];
    const pick = mockUrls[images.length % mockUrls.length]!;
    onChange([...images, { url: pick }]);
    toast.info("Mock: imagen agregada (simulado — TODO(backend) upload real)");
  };

  return (
    <div
      className="rounded-lg border-2 border-dashed border-border bg-bg p-6 transition-colors hover:border-gold/30"
    >
      {images.length === 0 ? (
        <button
          type="button"
          onClick={addMock}
          className="flex w-full flex-col items-center justify-center gap-3 py-10 text-muted-foreground hover:text-gold"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-faint text-gold">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Arrastra tus fotos aquí</p>
            <p className="text-xs">o haz click para agregar</p>
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
          <button
            type="button"
            onClick={addMock}
            className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:text-gold hover:border-gold/40"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
