import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { formatMoneyCompact } from "@/lib/format";
import { USER_ROLE_LABEL } from "@/lib/labels";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AgentsReportPage() {
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;

  const users = await prisma.user.findMany({
    where: { organizationId: orgId, isActive: true },
    select: { id: true, name: true, role: true },
  });

  const rows = await Promise.all(
    users.map(async (u) => {
      const [leadsCount, wonCount, visitsCount] = await Promise.all([
        prisma.lead.count({ where: { organizationId: orgId, deletedAt: null, assignedAgentId: u.id } }),
        prisma.lead.count({ where: { organizationId: orgId, deletedAt: null, assignedAgentId: u.id, status: "GANADO" as any } }),
        prisma.viewing.count({ where: { organizationId: orgId, agentId: u.id } }),
      ]);
      return { user: u, leads: leadsCount, won: wonCount, visits: visitsCount };
    })
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/reportes"><ArrowLeft className="h-4 w-4" /> Reportes</Link>
      </Button>
      <PageHeader
        eyebrow="Reporte"
        title="Desempeño por agente"
        description="Ranking del equipo. Fuente: leads asignados + visitas + cierres."
      />
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Agente</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-right">Leads</th>
              <th className="px-4 py-3 text-right">Visitas</th>
              <th className="px-4 py-3 text-right">Cerrados</th>
              <th className="px-4 py-3 text-right">Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.sort((a, b) => b.won - a.won).map(({ user, leads, won, visits }) => {
              const conv = leads > 0 ? (won / leads) * 100 : 0;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {USER_ROLE_LABEL[user.role as keyof typeof USER_ROLE_LABEL]}
                  </td>
                  <td className="px-4 py-3 text-right">{leads}</td>
                  <td className="px-4 py-3 text-right">{visits}</td>
                  <td className="px-4 py-3 text-right">{won}</td>
                  <td className="px-4 py-3 text-right text-gold">{conv.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
