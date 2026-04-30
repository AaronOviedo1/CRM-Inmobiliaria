import { PageHeader } from "@/components/common/page-header";
export default function TagsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tags" description="Etiquetas del sistema." />
      <p className="text-sm text-muted-foreground">Sin configuración de tags disponible.</p>
    </div>
  );
}
