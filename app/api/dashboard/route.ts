import { NextRequest, NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, endOfMonth } from "date-fns";
import { unstable_cache } from "next/cache";

export async function GET(_req: NextRequest) {
  const ctx = await requireTenantContext();
  const orgId = ctx.organizationId;

  const getDashboard = unstable_cache(
    async () => {
      const now = new Date();
      const som = startOfMonth(now);
      const eom = endOfMonth(now);
      const thirtyDaysAgo = subDays(now, 30);

      const [
        propertiesActive,
        propertiesTotal,
        leadsThisMonth,
        leadsActive,
        viewingsThisMonth,
        rentalsPending,
        rentalsActive,
        maintenanceOpen,
        tasksOverdue,
        conversionGanado,
      ] = await Promise.all([
        prisma.property.count({
          where: { organizationId: orgId, status: "DISPONIBLE", deletedAt: null },
        }),
        prisma.property.count({
          where: { organizationId: orgId, deletedAt: null },
        }),
        prisma.lead.count({
          where: { organizationId: orgId, createdAt: { gte: som, lte: eom }, deletedAt: null },
        }),
        prisma.lead.count({
          where: {
            organizationId: orgId,
            deletedAt: null,
            status: { notIn: ["GANADO", "PERDIDO"] },
          },
        }),
        prisma.viewing.count({
          where: { organizationId: orgId, scheduledAt: { gte: som, lte: eom } },
        }),
        prisma.rentalPayment.count({
          where: {
            rental: { organizationId: orgId },
            status: "PENDIENTE",
            dueDate: { lte: now },
          },
        }),
        prisma.rental.count({
          where: { organizationId: orgId, status: "ACTIVA" },
        }),
        prisma.maintenanceRequest.count({
          where: {
            organizationId: orgId,
            status: { notIn: ["COMPLETADO", "CERRADO", "RECHAZADO"] },
          },
        }),
        prisma.task.count({
          where: {
            organizationId: orgId,
            status: { in: ["PENDIENTE", "EN_PROCESO"] },
            dueAt: { lt: now },
          },
        }),
        prisma.lead.count({
          where: {
            organizationId: orgId,
            status: "GANADO",
            updatedAt: { gte: thirtyDaysAgo },
          },
        }),
      ]);

      return {
        properties: { active: propertiesActive, total: propertiesTotal },
        leads: { thisMonth: leadsThisMonth, active: leadsActive },
        viewings: { thisMonth: viewingsThisMonth },
        rentals: { active: rentalsActive, paymentsPending: rentalsPending },
        maintenance: { open: maintenanceOpen },
        tasks: { overdue: tasksOverdue },
        conversion: { ganado30d: conversionGanado },
        generatedAt: now.toISOString(),
      };
    },
    [`dashboard:${orgId}`],
    { revalidate: 60 * 5 },
  );

  const data = await getDashboard();
  return NextResponse.json(data);
}
