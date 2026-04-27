import Link from "next/link";
import { Bell, Home, KeySquare, LogOut, Wrench, FileText, ChartPie } from "lucide-react";
import { cookies } from "next/headers";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

export default async function OwnerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  let ownerName = "";

  if (token) {
    const session = await validatePortalSession(token, "OWNER");
    if (session) {
      const owner = await prisma.owner.findFirst({
        where: { id: session.subjectId },
        select: { firstName: true, lastName: true },
      });
      if (owner) ownerName = `${owner.firstName} ${owner.lastName}`;
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="container max-w-6xl flex h-14 items-center gap-4 px-4">
          <Link href="/portal-propietario/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gold/30 bg-gold-faint font-serif text-gold">
              C
            </div>
            <span className="font-serif text-base hidden sm:block">Casa Dorada</span>
            <span className="ml-2 rounded-full border border-gold/30 bg-gold-faint px-2 py-0.5 text-[10px] text-gold">
              Portal propietario
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            <NavItem href="/portal-propietario/dashboard" icon={Home} label="Overview" />
            <NavItem href="/portal-propietario/propiedades" icon={KeySquare} label="Propiedades" />
            <NavItem href="/portal-propietario/mantenimientos" icon={Wrench} label="Mantenimientos" />
            <NavItem href="/portal-propietario/reportes" icon={ChartPie} label="Reportes" />
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-md p-2 text-muted-foreground hover:text-gold" aria-label="Notificaciones">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            {ownerName && (
              <div className="text-xs text-right hidden md:block">
                <p className="font-medium">{ownerName}</p>
                <p className="text-muted-foreground">Propietario</p>
              </div>
            )}
            <Link
              href="/portal-propietario/login"
              className="rounded-md border border-border p-2 text-muted-foreground hover:text-gold"
              aria-label="Salir"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
      <main className="container max-w-6xl px-4 py-8">{children}</main>
      <footer className="py-8 text-center text-[11px] text-muted-foreground">
        <FileText className="mx-auto mb-1 h-3 w-3" />
        Tu link privado vence en 30 días. Cualquier duda, escribe a{" "}
        <span className="text-gold">soporte@casadorada.mx</span>.
      </footer>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-elevated hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
