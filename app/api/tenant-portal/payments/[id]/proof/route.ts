/// Portal del inquilino: sube comprobante de pago.
/// El status pasa a PENDIENTE (pendiente de validar por la agencia).

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/services/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: paymentId } = await params;
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const session = await validatePortalSession(token);
  if (!session || session.kind !== "TENANT") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { fileUrl, paymentReference } = body as { fileUrl?: string; paymentReference?: string };
  if (!fileUrl) return NextResponse.json({ error: "fileUrl required" }, { status: 422 });

  const payment = await prisma.rentalPayment.findUnique({
    where: { id: paymentId },
    include: { rental: { include: { agent: true } } },
  });
  if (!payment || payment.rental.tenantClientId !== session.subjectId) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (payment.status === "PAGADO") {
    return NextResponse.json({ error: "ALREADY_PAID" }, { status: 409 });
  }

  await prisma.rentalPayment.update({
    where: { id: paymentId },
    data: {
      paymentReference,
      notes: `Comprobante subido por inquilino: ${fileUrl}`,
    },
  });

  if (payment.rental.managingAgentId) {
    await notify({
      userId: payment.rental.managingAgentId,
      event: "PAYMENT_DUE",
      title: "Nuevo comprobante de pago a validar",
      url: `/rentas/${payment.rentalId}/pagos`,
    });
  }

  return NextResponse.json({ ok: true });
}
