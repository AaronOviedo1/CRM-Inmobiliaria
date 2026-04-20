import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { OwnerCard } from "@/components/owners/owner-card";
import { Input } from "@/components/ui/input";
import { requireTenantContext } from "@/lib/auth/session";
import { listOwners } from "@/lib/repos/entities";

interface Props { searchParams: Promise<Record<string, string | undefined>>; }

export default async function PropietariosPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const { rows, total } = await listOwners(ctx, { q: raw.q, page: raw.page ? Number(raw.page) : 1 });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${total} propietarios`} title="Propietarios" description="Dueños de los inmuebles que gestionas." actions={<Button asChild><Link href="/propietarios/nuevo"><Plus className="h-4 w-4" /> Nuevo propietario</Link></Button>} />
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nombre, correo o teléfono…" defaultValue={raw.q} readOnly />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((o) => <OwnerCard key={o.id} owner={o as any} />)}
      </div>
    </div>
  );
}
