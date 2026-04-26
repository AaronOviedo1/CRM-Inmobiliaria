/// Auto-asignación round-robin entre ASESORs activos.
///
/// Política:
///   1) Filtra ASESORs activos de la org.
///   2) Si el lead trae `desiredZones`, prefiere agentes cuyo `workingZones` se intersecte.
///   3) Si el lead trae `propertyTypeInterests`, prefiere agentes con esas especialidades.
///   4) Entre candidatos, round-robin: elige el agente con menos leads activos (status ≠ GANADO/PERDIDO).
///
/// Fallback: si nadie matchea, elige el ASESOR con menos leads globales.

import { prisma } from "../prisma";
import type { Lead, User } from "@prisma/client";

export async function pickAgentForLead(
  organizationId: string,
  lead: Pick<Lead, "desiredZones" | "propertyTypeInterests">,
): Promise<string | null> {
  const agents = await prisma.user.findMany({
    where: { organizationId, role: "ASESOR", isActive: true },
    select: {
      id: true,
      workingZones: true,
      specialties: true,
      _count: {
        select: {
          leadsAssigned: {
            where: {
              status: { notIn: ["GANADO", "PERDIDO"] },
              deletedAt: null,
            },
          },
        },
      },
    },
  });
  if (agents.length === 0) return null;

  const zoneMatches = (a: (typeof agents)[number]) =>
    lead.desiredZones.some((z) =>
      a.workingZones.some((wz) => wz.toLowerCase() === z.toLowerCase()),
    );
  const typeMatches = (a: (typeof agents)[number]) =>
    lead.propertyTypeInterests.some((t) =>
      a.specialties.some((s) => s === t),
    );

  const scored = agents
    .map((a) => ({
      id: a.id,
      activeLeads: a._count.leadsAssigned,
      score:
        (zoneMatches(a) ? 2 : 0) + (typeMatches(a) ? 1 : 0),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.activeLeads - b.activeLeads;
    });

  return scored[0]?.id ?? null;
}
