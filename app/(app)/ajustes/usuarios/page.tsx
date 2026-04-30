import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  ASESOR: "Asesor",
};

export default async function UsuariosPage() {
  const ctx = await requireTenantContext();
  const users = await prisma.user.findMany({
    where: { organizationId: ctx.organizationId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Equipo" description="Usuarios con acceso al sistema." />
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-faint border border-gold/30 text-xs font-semibold text-gold">
                      {u.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm font-medium text-foreground">{u.name ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-xs text-foreground">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="px-4 py-3">
                  <StatusPill tone={u.isActive ? "success" : "neutral"}>
                    {u.isActive ? "Activo" : "Inactivo"}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
