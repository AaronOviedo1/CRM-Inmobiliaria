import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";

const MONTHS = [
  { id: "2026-04", label: "Abril 2026", ready: true },
  { id: "2026-03", label: "Marzo 2026", ready: true },
  { id: "2026-02", label: "Febrero 2026", ready: true },
  { id: "2026-01", label: "Enero 2026", ready: true },
  { id: "2025-12", label: "Diciembre 2025", ready: true },
];

export default function OwnerReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes mensuales"
        description="Tu agencia te comparte un reporte por mes con el estado de cada propiedad y renta."
      />
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {MONTHS.map((m) => (
          <li key={m.id} className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-gold" />
            <div className="flex-1">
              <p className="font-medium">Reporte · {m.label}</p>
              <p className="text-xs text-muted-foreground">
                {m.ready
                  ? "Incluye pagos, mantenimientos e incidencias"
                  : "En preparación"}
              </p>
            </div>
            <Button variant={m.ready ? "outline" : "ghost"} disabled={!m.ready}>
              <Download className="h-4 w-4" /> PDF
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
