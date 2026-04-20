"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bath, BedDouble, Car, Ruler, MapPin, Sparkles } from "lucide-react";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_STATUS_LABEL,
  PROPERTY_STATUS_TONE,
  TRANSACTION_TYPE_LABEL,
} from "@/lib/labels";
import { formatArea, formatMoneyCompact } from "@/lib/format";
import { StatusPill } from "@/components/common/status-pill";
import { Sparkline } from "@/components/common/sparkline";
import { viewsSparkline } from "@/lib/mock/factories";

interface PropertyCardProps {
  property: Property;
  index?: number;
  variant?: "default" | "compact";
}

export function PropertyCard({
  property,
  index = 0,
  variant = "default",
}: PropertyCardProps) {
  const href = `/propiedades/${property.id}`;
  const price =
    property.priceSale ?? property.priceRent ?? 0;
  const priceSuffix = property.priceSale ? "" : "/ mes";
  const sparks = viewsSparkline(property.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.5), ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-surface hover-lift",
        variant === "compact" ? "flex flex-row" : "flex flex-col"
      )}
    >
      <Link
        href={href}
        className={cn(
          "relative block overflow-hidden bg-bg",
          variant === "compact"
            ? "h-full w-40 shrink-0 aspect-auto"
            : "aspect-[4/3]"
        )}
      >
        <img
          src={property.coverImageUrl ?? ""}
          alt={property.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusPill
              size="sm"
              tone={PROPERTY_STATUS_TONE[property.status]}
            >
              {PROPERTY_STATUS_LABEL[property.status]}
            </StatusPill>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white backdrop-blur">
              {TRANSACTION_TYPE_LABEL[property.transactionType]}
            </span>
          </div>
          {property.captureContractId && (
            <span className="rounded-full border border-gold/40 bg-gold-faint px-2 py-0.5 text-[10px] text-gold">
              Exclusiva
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <p className="text-[10px] uppercase tracking-wider opacity-80">
            {property.code}
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={href} className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-lg font-medium leading-tight text-foreground group-hover:text-gold transition-colors">
              {property.title}
            </h3>
          </Link>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {property.neighborhood}, {property.city}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-serif text-2xl font-medium text-gold">
              {formatMoneyCompact(price, property.currency)}
            </p>
            {priceSuffix && (
              <p className="-mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {priceSuffix}
              </p>
            )}
          </div>
          {sparks && (
            <div className="flex flex-col items-end">
              <Sparkline data={sparks} className="h-6 w-20" />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {property.viewsCount} vistas
              </p>
            </div>
          )}
        </div>

        {property.category !== "TERRENO" && (
          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            {property.bedrooms && (
              <Stat icon={<BedDouble className="h-3.5 w-3.5" />} value={property.bedrooms} />
            )}
            {property.bathrooms && (
              <Stat icon={<Bath className="h-3.5 w-3.5" />} value={property.bathrooms} />
            )}
            {property.parkingSpaces && (
              <Stat icon={<Car className="h-3.5 w-3.5" />} value={property.parkingSpaces} />
            )}
            {property.areaBuiltM2 && (
              <Stat icon={<Ruler className="h-3.5 w-3.5" />} value={formatArea(property.areaBuiltM2)} />
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {PROPERTY_CATEGORY_LABEL[property.category]}
          </span>
          {property.isFurnished && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Amueblada
            </span>
          )}
          {property.acceptsPets && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              Pet-friendly
            </span>
          )}
          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            {property.inquiriesCount > 10 && (
              <Sparkles className="h-3 w-3 text-gold" />
            )}
            {property.daysOnMarket}d en mercado
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      {value}
    </span>
  );
}
