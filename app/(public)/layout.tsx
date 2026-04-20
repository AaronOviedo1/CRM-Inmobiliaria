import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-foreground">
      <header className="border-b border-border bg-surface/60 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gold/30 bg-gold-faint font-serif text-gold">
              C
            </div>
            <span className="font-serif text-base">Casa Dorada</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/a/casa-dorada" className="hover:text-foreground">
              Cartera
            </Link>
            <Link href="/contacto/casa-dorada" className="hover:text-foreground">
              Contacto
            </Link>
            <a href="https://wa.me/526621234567" className="text-gold hover:text-gold-hover">
              WhatsApp →
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-surface/60 py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Casa Dorada Bienes Raíces · Hermosillo, Sonora</p>
        <p className="mt-1">Powered by Inmobiliaria CRM</p>
      </footer>
    </div>
  );
}
