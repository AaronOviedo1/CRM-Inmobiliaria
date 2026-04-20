import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { PaymentCard } from "@/components/rentals/payment-card";
import { UploadCloud } from "lucide-react";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

export default async function TenantPaymentsPage() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-inquilino/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "TENANT") redirect("/portal-inquilino/login");

  const rental = await prisma.rental.findFirst({
    where: { tenantClientId: session.subjectId, organizationId: session.organizationId },
    include: { payments: { orderBy: { dueDate: "desc" }, take: 12 } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis pagos"
        description="Historial completo. Sube tu comprobante cuando pagues."
        actions={
          <Button>
            <UploadCloud className="h-4 w-4" /> Subir comprobante
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(rental?.payments ?? []).map((p) => (
          <PaymentCard key={p.id} payment={p as any} />
        ))}
      </div>
      {!rental && (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay pagos registrados.</p>
      )}
    </div>
  );
}
