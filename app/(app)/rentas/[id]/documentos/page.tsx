import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

const STATIC_DOCS = [
  { id: "d1", label: "Contrato de arrendamiento (firmado)" },
  { id: "d2", label: "Inventario entrega" },
  { id: "d3", label: "INE del inquilino" },
  { id: "d4", label: "Comprobantes de ingresos" },
];

export default async function RentalDocsPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const r = await prisma.rental.findFirst({
    where: { id, organizationId: ctx.organizationId },
    select: {
      id: true,
      property: { select: { title: true } },
    },
  });
  if (!r) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/rentas/${r.id}`}><ArrowLeft className="h-4 w-4" /> {r.property?.title}</Link>
      </Button>
      <PageHeader
        title="Documentos de la renta"
        actions={<Button><UploadCloud className="h-4 w-4" /> Subir documento</Button>}
      />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {STATIC_DOCS.map((d) => (
          <li key={d.id} className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-gold" />
            <p className="flex-1 font-medium">{d.label}</p>
            <Button variant="ghost" size="sm"><Download className="h-4 w-4" /> Descargar</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
