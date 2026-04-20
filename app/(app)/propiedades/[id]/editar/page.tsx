import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { PropertyWizard } from "@/components/property/property-wizard";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const property = await prisma.property.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    select: { id: true, title: true, code: true },
  });
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/propiedades/${property.id}`}>
          <ArrowLeft className="h-4 w-4" /> Volver al detalle
        </Link>
      </Button>
      <PageHeader
        eyebrow={property.code}
        title={`Editar ${property.title}`}
        description="Los cambios se guardan como borrador hasta que confirmes."
      />
      <PropertyWizard />
    </div>
  );
}
