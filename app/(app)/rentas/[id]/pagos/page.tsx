import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { PaymentCard } from "@/components/rentals/payment-card";
import { requireTenantContext } from "@/lib/auth/session";
import { getRentalById } from "@/lib/repos/entities";

interface Props { params: Promise<{ id: string }>; }

export default async function RentalPaymentsPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const r = await getRentalById(ctx, id);
  if (!r) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/rentas/${r.id}`}><ArrowLeft className="h-4 w-4" /> {r.property?.title}</Link>
      </Button>
      <PageHeader
        title="Historial de pagos"
        description="12 meses. Filtra por estado y exporta a CSV desde el menú."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(r.payments ?? []).map((p) => (
          <PaymentCard key={p.id} payment={p as any} />
        ))}
      </div>
    </div>
  );
}
