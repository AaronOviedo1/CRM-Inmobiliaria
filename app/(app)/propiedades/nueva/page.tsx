import { PageHeader } from "@/components/common/page-header";
import { PropertyWizard } from "@/components/property/property-wizard";

export default function NuevaPropiedadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wizard"
        title="Nueva propiedad"
        description="6 pasos rápidos. Guardamos borrador automático por si necesitas regresar."
      />
      <PropertyWizard />
    </div>
  );
}
