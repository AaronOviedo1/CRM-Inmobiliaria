import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";

const DOCS = [
  { id: "1", label: "Contrato de arrendamiento (firmado)" },
  { id: "2", label: "Inventario de entrega" },
  { id: "3", label: "Reglamento interno del condominio" },
  { id: "4", label: "Datos bancarios para pago" },
];

export default function TenantDocsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Archivos que tu agencia comparte contigo."
      />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {DOCS.map((d) => (
          <li key={d.id} className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-gold" />
            <p className="flex-1 font-medium">{d.label}</p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Descargar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
