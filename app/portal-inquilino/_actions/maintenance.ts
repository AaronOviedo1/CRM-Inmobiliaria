"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

export async function createPortalMaintenanceAction(data: {
  title: string;
  description: string;
  category: string;
  priority: string;
}) {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-inquilino/login");

  const session = await validatePortalSession(token, "TENANT");
  if (!session) redirect("/portal-inquilino/login");

  const rental = await prisma.rental.findFirst({
    where: {
      tenantClientId: session.subjectId,
      organizationId: session.organizationId,
      status: { not: "TERMINADA" as any },
    },
    select: { id: true, propertyId: true, tenantClientId: true },
  });

  if (!rental) return { ok: false, error: "SIN_RENTA_ACTIVA" };

  await prisma.maintenanceRequest.create({
    data: {
      organizationId: session.organizationId,
      rentalId: rental.id,
      propertyId: rental.propertyId,
      reportedByClientId: rental.tenantClientId,
      title: data.title,
      description: data.description,
      category: data.category as any,
      priority: data.priority as any,
      images: [],
    },
  });

  return { ok: true };
}
