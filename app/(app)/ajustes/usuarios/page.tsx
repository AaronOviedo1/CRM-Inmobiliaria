import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/common/status-pill";
import { USER_ROLE_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { listUsers } from "@/lib/repos/entities";

export default async function UsuariosPage() {
  const ctx = await requireTenantContext();
  const users = await listUsers(ctx);

  return (
    <div className="space-y-6">
      <PageHeader title="Equipo" description="Miembros con acceso al CRM." actions={<Button><Plus className="h-4 w-4" /> Invitar miembro</Button>} />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Correo</th>
              <th className="px-4 py-3 text-left">Comisión default</th>
              <th className="px-4 py-3 text-left">Último acceso</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-border object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-elevated text-xs font-medium">{u.name?.charAt(0) ?? "?"}</div>}
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{USER_ROLE_LABEL[u.role as keyof typeof USER_ROLE_LABEL]}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{String(u.commissionDefaultPct)}%</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastLoginAt ? formatRelative(u.lastLoginAt) : "—"}</td>
                <td className="px-4 py-3"><StatusPill tone={u.isActive ? "success" : "neutral"}>{u.isActive ? "Activo" : "Inactivo"}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
