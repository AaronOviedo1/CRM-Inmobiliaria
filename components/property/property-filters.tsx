"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const params = useSearchParams();
  const [local, setLocal] = React.useState({
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    transaction: params.get("transaction") ?? "",
    status: params.get("status") ?? "",
    zone: params.get("zone") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    bedrooms: params.get("bedrooms") ?? "",
  });

  const push = (patch: Partial<typeof local>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    const qs = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    router.push(`/propiedades${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  const hasFilters = Object.values(local).some((v) => v);

  return (
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

      <Select value={local.transaction || "all"} onValueChange={(v) => push({ transaction: v === "all" ? "" : v })}>
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

      <Select value={local.zone || "all"} onValueChange={(v) => push({ zone: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[170px]"><SelectValue placeholder="Zona" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Cualquier zona</SelectItem>
          {HERMOSILLO_ZONES.map((z) => (
            <SelectItem key={z.name} value={z.name}>{z.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={local.status || "all"} onValueChange={(v) => push({ status: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los status</SelectItem>
          {Object.entries(PROPERTY_STATUS_LABEL).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocal({ q: "", category: "", transaction: "", status: "", zone: "", minPrice: "", maxPrice: "", bedrooms: "" });
            router.push("/propiedades");
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
