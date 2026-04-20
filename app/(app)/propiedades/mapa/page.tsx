import { PageHeader } from "@/components/common/page-header";
import { PropertyMap } from "@/components/property/property-map";
import { PropertyFilters } from "@/components/property/property-filters";
import { requireTenantContext } from "@/lib/auth/session";
import { listProperties } from "@/lib/repos/properties";
import { PropertyFiltersSchema } from "@/lib/validators/property";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function PropiedadesMapaPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const filters = PropertyFiltersSchema.parse({ q: raw.q, status: raw.status, category: raw.category, pageSize: 100 });
  const { rows: properties } = await listProperties(ctx, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mapa"
        title="Cartera en mapa"
        description="Click en cualquier pin para ver el preview. Zonas con halo = propiedades destacadas."
      />
      <PropertyFilters view="map" />
      <PropertyMap properties={properties as any} />
    </div>
  );
}
