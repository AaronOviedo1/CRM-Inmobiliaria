import type { Property } from "@/lib/types";
import {
  Bath,
  BedDouble,
  Car,
  Copy,
  Eye,
  MapPin,
  MessageSquare,
  Ruler,
  Share2,
} from "lucide-react";
import {
  CONSERVATION_LABEL,
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_STATUS_TONE,
  TRANSACTION_TYPE_LABEL,
} from "@/lib/labels";
import { formatArea, formatMoney, formatMoneyCompact } from "@/lib/format";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { PropertyGallery } from "./property-gallery";
import { PropertyStatusMenu } from "./property-status-menu";

interface Props {
  property: Property;
}

export function PropertyHero({ property }: Props) {
  return (
    <div className="space-y-6">
      <PropertyGallery images={property.images} title={property.title} />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PropertyStatusMenu propertyId={property.id} status={property.status} />
            <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold-faint px-2 py-0.5 text-xs text-gold">
              {TRANSACTION_TYPE_LABEL[property.transactionType]}
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {PROPERTY_CATEGORY_LABEL[property.category]}
            </span>
            <span className="text-xs text-muted-foreground">· {property.code}</span>
          </div>

          <h1 className="mt-3 font-serif text-4xl font-medium leading-tight">
            {property.title}
          </h1>

          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.hideExactAddress
              ? `${property.neighborhood} · ${property.city}`
              : `${property.addressStreet} ${property.addressNumber}, ${property.neighborhood}, ${property.city}`}
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {property.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border pt-6">
            {property.bedrooms !== null && (
              <Feature
                icon={<BedDouble className="h-4 w-4" />}
                label="Recámaras"
                value={property.bedrooms ?? "—"}
              />
            )}
            {property.bathrooms !== null && (
              <Feature
                icon={<Bath className="h-4 w-4" />}
                label="Baños"
                value={property.bathrooms ?? "—"}
              />
            )}
            {property.parkingSpaces && (
              <Feature
                icon={<Car className="h-4 w-4" />}
                label="Estacionamiento"
                value={property.parkingSpaces}
              />
            )}
            <Feature
              icon={<Ruler className="h-4 w-4" />}
              label={property.category === "TERRENO" ? "Terreno" : "Construcción"}
              value={
                formatArea(
                  property.category === "TERRENO"
                    ? property.areaTotalM2
                    : property.areaBuiltM2
                )
              }
            />
          </div>
        </div>

        <div className="h-fit rounded-lg border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Precio listado
          </p>
          {property.priceSale && (
            <p className="font-serif text-3xl font-medium text-gold">
              {formatMoney(property.priceSale, property.currency)}
            </p>
          )}
          {property.priceRent && (
            <p className="mt-1 text-sm text-muted-foreground">
              Renta: {formatMoney(property.priceRent, property.currency)} /mes
            </p>
          )}
          {property.maintenanceFee && (
            <p className="mt-1 text-xs text-muted-foreground">
              Mantenimiento: {formatMoney(property.maintenanceFee)} /mes
            </p>
          )}

          <div className="mt-5 grid gap-2">
            <Button>
              <MessageSquare className="h-4 w-4" /> Registrar interacción
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4" /> Compartir link público
            </Button>
            <Button variant="ghost" className="text-muted-foreground">
              <Copy className="h-4 w-4" /> Copiar ficha WhatsApp
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <Stat label="Vistas" value={property.viewsCount} icon={<Eye className="h-3 w-3" />} />
            <Stat label="Consultas" value={property.inquiriesCount} />
            <Stat label="Días" value={property.daysOnMarket ?? 0} />
          </div>

          {property.conservation && (
            <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              Estado: <span className="text-foreground">{CONSERVATION_LABEL[property.conservation]}</span>
            </div>
          )}

          <div className="mt-4 text-[11px] text-muted-foreground">
            Comisión estimada:{" "}
            <span className="text-foreground">
              {formatMoneyCompact((property.priceSale ?? 0) * 0.05)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-faint text-gold">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-serif text-lg">{value}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-serif text-xl">{value}</p>
    </div>
  );
}
