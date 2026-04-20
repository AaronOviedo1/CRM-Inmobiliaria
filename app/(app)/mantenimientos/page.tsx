import { requireTenantContext } from "@/lib/auth/session";
import { listMaintenance } from "@/lib/repos/entities";
import { MantenimientosClient } from "./mantenimientos-client";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function MantenimientosPage({ searchParams }: Props) {
  const ctx = await requireTenantContext();
  const raw = await searchParams;
  const { rows, total } = await listMaintenance(ctx, {
    q: raw.q,
    status: raw.status,
    pageSize: 50,
  });
  return <MantenimientosClient requests={rows as any} total={total} />;
}
