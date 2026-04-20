"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bell,
  Building,
  CreditCard,
  Globe,
  MessageCircle,
  Tags,
  User,
  Users,
} from "lucide-react";

const SECTIONS = [
  { href: "/ajustes/perfil", label: "Perfil", icon: User },
  { href: "/ajustes/organizacion", label: "Organización", icon: Building },
  { href: "/ajustes/usuarios", label: "Equipo", icon: Users },
  { href: "/ajustes/tags", label: "Tags", icon: Tags },
  { href: "/ajustes/plantillas", label: "Plantillas", icon: MessageCircle },
  { href: "/ajustes/portales", label: "Portales externos", icon: Globe },
  { href: "/ajustes/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/ajustes/suscripcion", label: "Suscripción", icon: CreditCard },
];

export default function AjustesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Ajustes</p>
        <nav className="space-y-1">
          {SECTIONS.map((s) => {
            const active = pathname === s.href || pathname.startsWith(s.href + "/");
            return (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-gold-faint text-gold"
                    : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                )}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
