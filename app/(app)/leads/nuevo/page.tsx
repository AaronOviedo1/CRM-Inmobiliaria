import { PageHeader } from "@/components/common/page-header";
import { LeadForm } from "@/components/leads/lead-form";

export default function NuevoLeadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Wizard rápido"
        title="Nuevo lead"
        description="En 4 pasos queda capturado y listo para seguimiento."
      />
      <LeadForm />
    </div>
  );
}
