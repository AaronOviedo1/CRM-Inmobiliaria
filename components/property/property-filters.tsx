"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  PROPERTY_CATEGORY_LABEL,
  PROPERTY_STATUS_LABEL,
  TRANSACTION_TYPE_LABEL,
} from "@/lib/labels";
import {
  PropertyCategory,
  PropertyStatus,
  TransactionType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { HERMOSILLO_ZONES } from "@/lib/mock/fixtures";
import { Button } from "@/components/ui/button";
import { Grid3x3, List, Map as MapIcon, Search, X } from "lucide-react";
import Link from "next/link";

export function PropertyFilters({
  view = "grid",
}: {
  view?: "grid" | "list" | "map";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [local, setLocal] = React.useState({
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    transactionType: params.get("transactionType") ?? "",
    status: params.get("status") ?? "",
    neighborhood: params.get("neighborhood") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    minBedrooms: params.get("minBedrooms") ?? "",
  });

  const push = (patch: Partial<typeof local>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    const qs = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    router.push(`${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  const hasFilters = Object.values(local).some((v) => v);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, título o zona…"
            className="pl-9"
            defaultValue={local.q}
            onChange={(e) => push({ q: e.target.value })}
          />
        </div>

        <Select value={local.transactionType || "all"} onValueChange={(v) => push({ transactionType: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Operación" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(TRANSACTION_TYPE_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={local.category || "all"} onValueChange={(v) => push({ category: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(PROPERTY_CATEGORY_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={local.neighborhood || "all"} onValueChange={(v) => push({ neighborhood: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Zona" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier zona</SelectItem>
            {HERMOSILLO_ZONES.map((z) => (
              <SelectItem key={z.name} value={z.name}>{z.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocal({ q: "", category: "", transactionType: "", status: "", neighborhood: "", minPrice: "", maxPrice: "", minBedrooms: "" });
              router.push(pathname);
            }}
          >
            <X className="h-3 w-3" /> Limpiar
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-elevated p-0.5">
          <ViewButton active={view === "grid"} href="/propiedades">
            <Grid3x3 className="h-4 w-4" />
          </ViewButton>
          <ViewButton active={view === "list"} href="/propiedades?view=list">
            <List className="h-4 w-4" />
          </ViewButton>
          <ViewButton active={view === "map"} href="/propiedades/mapa">
            <MapIcon className="h-4 w-4" />
          </ViewButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip
          label="Todos"
          active={!local.status}
          activeClass="border-foreground/40 bg-foreground/10 text-foreground"
          onClick={() => push({ status: "" })}
        />
        {Object.entries(PROPERTY_STATUS_LABEL).map(([key, label]) => (
          <StatusChip
            key={key}
            label={label}
            active={local.status === key}
            activeClass={STATUS_CHIP_CLASSES[key as PropertyStatus]}
            onClick={() => push({ status: local.status === key ? "" : key })}
          />
        ))}
      </div>
    </div>
  );
}

const STATUS_CHIP_CLASSES: Record<PropertyStatus, string> = {
  BORRADOR: "border-zinc-400/40 bg-zinc-400/15 text-zinc-200",
  DISPONIBLE: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  APARTADA: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  EN_NEGOCIACION: "border-orange-500/40 bg-orange-500/15 text-orange-300",
  VENDIDA: "border-gold/40 bg-gold/15 text-gold",
  RENTADA: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  PAUSADA: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  NO_DISPONIBLE: "border-rose-500/40 bg-rose-500/15 text-rose-300",
  ARCHIVADA: "border-stone-500/40 bg-stone-500/15 text-stone-300",
};

function StatusChip({
  label,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? activeClass
          : "border-border bg-elevated text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function ViewButton({
  children,
  href,
  active,
}: {
  children: React.ReactNode;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-7 w-7 items-center justify-center rounded ${
        active ? "bg-gold text-black" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

// Silencia TS para imports no usados de enums cargados para el Select.
void PropertyCategory;
void PropertyStatus;
void TransactionType;
