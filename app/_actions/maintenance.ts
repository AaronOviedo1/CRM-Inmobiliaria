"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function updateMaintenanceStatusAction(id: string, status: string) {
  const u = await requireSession();
  const item = await prisma.maintenance.findFirst({
    where: { id, organizationId: u.organizationId },
  });
  if (!item) return { ok: false, error: "NOT_FOUND" };

  await prisma.maintenance.update({
    where: { id },
    data: {
      status: status as any,
      resolvedAt: status === "CERRADO" ? new Date() : undefined,
    },
  });

  revalidatePath("/mantenimientos");
  return { ok: true };
}
