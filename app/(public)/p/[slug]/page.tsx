import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Building,
  Calendar,
  Car,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatArea, formatMoney } from "@/lib/format";
import { PROPERTY_CATEGORY_LABEL, TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PublicContactForm } from "@/components/public/public-contact-form";
import { WhatsAppFab } from "@/components/public/whatsapp-fab";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ slug: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function PublicPropertyPage({ params }: Props) {
  const { slug } = await params;
  const p = await prisma.property.findFirst({
    where: { slug, status: "DISPONIBLE" as any, deletedAt: null },
    include: {
      images: { where: { isPublic: true }, orderBy: { order: "asc" } },
      organization: { select: { name: true, slug: true } },
    },
  });
  if (!p) notFound();

  return (
    <div>
      <section className="bg-surface border-b border-border">
        <div className="container max-w-6xl px-4 py-6">
          <PropertyGallery images={p.images as any} title={p.title} />
        </div>
      </section>

      <section className="container max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/30 bg-gold-faint px-3 py-0.5 text-xs text-gold">
                {TRANSACTION_TYPE_LABEL[p.transactionType as keyof typeof TRANSACTION_TYPE_LABEL]}
              </span>
              <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                {PROPERTY_CATEGORY_LABEL[p.category as keyof typeof PROPERTY_CATEGORY_LABEL]}
              </span>
              <span className="text-xs text-muted-foreground">· {p.code}</span>
            </div>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-tight">{p.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {p.neighborhood}, {p.city}, {p.state}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {p.bedrooms && <Feature icon={<BedDouble />} label="Recámaras" value={p.bedrooms} />}
              {p.bathrooms && <Feature icon={<Bath />} label="Baños" value={p.bathrooms} />}
              {p.parkingSpaces && <Feature icon={<Car />} label="Cajones" value={p.parkingSpaces} />}
              <Feature
                icon={<Ruler />}
                label={p.category === "TERRENO" ? "Terreno" : "Construcción"}
                value={formatArea(toN(p.category === "TERRENO" ? p.areaTotalM2 : p.areaBuiltM2))}
              />
            </div>

            <div className="mt-10 prose prose-invert max-w-none">
              <h2 className="font-serif text-2xl">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">
                {p.publicDescription ?? p.description}
              </p>
            </div>

            {p.amenities.length > 0 && (
              <div className="mt-10">
                <h2 className="font-serif text-2xl">Amenidades</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <span key={a} className="rounded-full border border-border bg-muted px-3 py-1 text-xs">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {p.virtualTourUrl && (
              <div className="mt-10 rounded-lg border border-gold/30 bg-gold/5 p-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold text-black">
                  <Building className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tour virtual 360°</p>
                  <p className="text-xs text-muted-foreground">Recorre la propiedad desde donde estés.</p>
                </div>
                <Button variant="outline" asChild>
                  <a href={p.virtualTourUrl} target="_blank" rel="noopener noreferrer">Abrir tour</a>
                </Button>
              </div>
            )}

            <div className="mt-10">
              <h2 className="font-serif text-2xl">Ubicación</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Por privacidad mostramos solo la zona. Compartiremos la ubicación exacta en la primera comunicación.
              </p>
              <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-bg">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c0f14] via-[#111319] to-[#0a0a0b]" />
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <MapPin className="mx-auto h-6 w-6 text-gold" />
                  <p className="mt-2 font-serif text-lg">{p.neighborhood}</p>
                  <p className="text-xs text-muted-foreground">{p.city}, {p.state}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="rounded-lg border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Precio</p>
              {p.priceSale && (
                <p className="font-serif text-4xl font-medium text-gold">
                  {formatMoney(toN(p.priceSale), p.currency as any)}
                </p>
              )}
              {p.priceRent && (
                <p className="mt-1 text-sm text-muted-foreground">
                  O renta por {formatMoney(toN(p.priceRent), p.currency as any)} /mes
                </p>
              )}
              {p.maintenanceFee && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Mantenimiento: {formatMoney(toN(p.maintenanceFee))} /mes
                </p>
              )}

              <div className="mt-5 grid gap-2">
                <Button size="lg" className="w-full">
                  <Calendar className="h-4 w-4" /> Agendar visita
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <MessageSquare className="h-4 w-4" /> WhatsApp al agente
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Phone className="h-4 w-4" /> Llamar
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="font-serif text-lg">Déjanos tus datos</h3>
              <p className="mt-1 text-xs text-muted-foreground">Te contactamos en menos de 15 minutos.</p>
              <PublicContactForm propertyCode={p.code} />
            </div>

            <div className="rounded-lg border border-dashed border-gold/30 bg-gold/5 p-4 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
              <div className="text-xs text-muted-foreground">
                Publicado por <strong className="text-foreground">{p.organization?.name}</strong>.
                Broker responsable registrado en AMPI.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <WhatsAppFab />
    </div>
  );
}

function Feature({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-faint text-gold">
        <div className="[&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-serif text-xl">{value}</p>
      </div>
      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground hidden" />
    </div>
  );
}
