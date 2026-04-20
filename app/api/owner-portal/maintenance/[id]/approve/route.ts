import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const session = await validatePortalSession(token);
  if (!session || session.kind !== "OWNER") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const approved: boolean = body.approved ?? true;

  const req_ = await prisma.maintenanceRequest.findFirst({
    where: {
      id,
      organizationId: session.organizationId,
      rental: { ownerId: session.subjectId },
    },
  });
  if (!req_) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      status: approved ? "APROBADO_PROPIETARIO" : "RECHAZADO",
      ownerApprovedAt: new Date(),
    },
  });

  await prisma.interaction.create({
    data: {
      organizationId: session.organizationId,
      kind: "MENSAJE_PORTAL",
      direction: "ENTRANTE",
      summary: approved
        ? `Propietario aprobó mantenimiento: ${req_.title}`
        : `Propietario rechazó mantenimiento: ${req_.title}`,
      body: body.note ?? null,
      occurredAt: new Date(),
      relatedPropertyId: req_.propertyId,
      relatedOwnerId: session.subjectId,
    },
  });

  return NextResponse.json({ ok: true });
}
