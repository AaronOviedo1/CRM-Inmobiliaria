import { PublicContactForm } from "@/components/public/public-contact-form";
import { WhatsAppFab } from "@/components/public/whatsapp-fab";

interface Props { params: Promise<{ orgSlug: string }>; }

export default async function PublicContactPage({ params }: Props) {
  await params;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Contacto</p>
        <h1 className="mt-1 font-serif text-3xl">Cuéntanos qué buscas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nuestro equipo te contacta en menos de 15 minutos durante horario laboral.
        </p>
        <PublicContactForm />
      </div>
      <WhatsAppFab />
    </div>
  );
}
