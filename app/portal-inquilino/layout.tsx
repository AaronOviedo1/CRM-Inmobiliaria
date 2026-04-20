import Link from "next/link";
import { FileText, Home, LogOut, Receipt, Wrench, Bell } from "lucide-react";

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="container max-w-4xl flex h-14 items-center gap-4 px-4">
          <Link href="/portal-inquilino/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gold/30 bg-gold-faint font-serif text-gold">
              C
            </div>
            <span className="ml-1 rounded-full border border-gold/30 bg-gold-faint px-2 py-0.5 text-[10px] text-gold">
              Inquilino
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            <NavItem href="/portal-inquilino/dashboard" icon={Home} label="Inicio" />
            <NavItem href="/portal-inquilino/mi-renta" icon={Receipt} label="Mi renta" />
            <NavItem href="/portal-inquilino/pagos" icon={Receipt} label="Pagos" />
            <NavItem href="/portal-inquilino/mantenimientos" icon={Wrench} label="Mantenimientos" />
            <NavItem href="/portal-inquilino/documentos" icon={FileText} label="Documentos" />
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-md p-2 text-muted-foreground" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
            </button>
            <Link href="/portal-inquilino/login" className="rounded-md border border-border p-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      <main className="container max-w-4xl px-4 py-8">{children}</main>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-border bg-bg/80 backdrop-blur md:hidden">
        <MobileNavItem href="/portal-inquilino/dashboard" icon={Home} label="Inicio" />
        <MobileNavItem href="/portal-inquilino/mi-renta" icon={Receipt} label="Renta" />
        <MobileNavItem href="/portal-inquilino/reportar-mantenimiento" icon={Wrench} label="Reportar" primary />
        <MobileNavItem href="/portal-inquilino/pagos" icon={Receipt} label="Pagos" />
        <MobileNavItem href="/portal-inquilino/documentos" icon={FileText} label="Docs" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-elevated">
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function MobileNavItem({
  href,
  icon: Icon,
  label,
  primary = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center py-2 text-[10px] ${
        primary ? "text-gold" : "text-muted-foreground"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          primary ? "bg-gold text-black" : ""
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}
