import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { PROPERTY_DOCUMENT_TYPE_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function PropertyDocumentsPage({ params }: Props) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const property = await prisma.property.findFirst({
    where: { id, organizationId: ctx.organizationId, deletedAt: null },
    select: { id: true, title: true, documents: { orderBy: { uploadedAt: "desc" } } },
  });
  if (!property) notFound();
  const docs = property.documents ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href={`/propiedades/${property.id}`}>
          <ArrowLeft className="h-4 w-4" /> {property.title}
        </Link>
      </Button>
      <PageHeader
        title="Documentos"
        actions={<Button variant="outline">Subir documento</Button>}
      />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-gold" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{d.label}</p>
              <p className="text-xs text-muted-foreground">
                {PROPERTY_DOCUMENT_TYPE_LABEL[d.type as keyof typeof PROPERTY_DOCUMENT_TYPE_LABEL]} · {formatDate(d.uploadedAt)}
              </p>
            </div>
            {d.url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Descargar
                </a>
              </Button>
            )}
          </li>
        ))}
        {docs.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">Sin documentos.</li>
        )}
      </ul>
    </div>
  );
}
