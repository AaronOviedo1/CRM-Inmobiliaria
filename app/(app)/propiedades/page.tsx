import { PageHeader } from "@/components/common/page-header";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFilters } from "@/components/property/property-filters";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { requireTenantContext } from "@/lib/auth/session";
import { listProperties } from "@/lib/repos/properties";
import { PropertyFiltersSchema } from "@/lib/validators/property";

interface Props { searchParams: Promise<Record<string, string | undefined>>; }

export default async function PropiedadesPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const filters = PropertyFiltersSchema.parse({ q: raw.q, status: raw.status, category: raw.category, transactionType: raw.transactionType, page: raw.page ? Number(raw.page) : 1 });
  const { rows, total } = await listProperties(ctx, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${total} propiedades`}
        title="Propiedades"
        description="Inventario completo de la agencia."
        actions={
          <>
            <Button variant="outline" asChild><Link href="/propiedades/mapa">Ver mapa</Link></Button>
            <Button asChild><Link href="/propiedades/nueva"><Plus className="h-4 w-4" /> Nueva propiedad</Link></Button>
          </>
        }
      />
      <PropertyFilters view="grid" />
      {rows.length === 0 ? (
        <EmptyState icon={<Building2 className="h-5 w-5" />} title="No encontramos propiedades" description="Prueba cambiar los filtros." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rows.map((p, i) => <PropertyCard key={p.id} property={p as any} index={i} />)}
        </div>
      )}
    </div>
  );
}
