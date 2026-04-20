"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  ChartPie,
  CheckSquare,
  ChevronLeft,
  FileSignature,
  Home,
  KeySquare,
  LayoutGrid,
  MessageSquare,
  Settings,
  Sparkles,
  UserCheck,
  Users,
  UsersRound,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_MAIN: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/propietarios", label: "Propietarios", icon: UserCheck },
  { href: "/leads", label: "Leads", icon: Sparkles, badge: "12" },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/contratos", label: "Contratos", icon: FileSignature },
  { href: "/rentas", label: "Rentas", icon: KeySquare },
  { href: "/mantenimientos", label: "Mantenimientos", icon: Wrench, badge: "3" },
  { href: "/visitas", label: "Visitas", icon: Calendar },
  { href: "/matching", label: "Matching", icon: LayoutGrid },
  { href: "/comunicacion", label: "Comunicación", icon: MessageSquare, badge: "•" },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
];

const NAV_BOTTOM: NavItem[] = [
  { href: "/reportes", label: "Reportes", icon: ChartPie },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-border bg-surface transition-all md:flex md:flex-col",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground hover:text-gold"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft
            className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")}
          />
        </button>

        <div
          className={cn(
            "flex h-16 items-center border-b border-border",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gold-faint border border-gold/30">
              <span className="font-serif text-lg font-semibold text-gold">C</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-serif text-sm font-medium leading-none text-foreground truncate">
                  Casa Dorada
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Hermosillo · Pro
                </p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Operación
              </p>
            )}
            {NAV_MAIN.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
          </div>
          <div className={cn("mt-6 space-y-0.5", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Organización
              </p>
            )}
            {NAV_BOTTOM.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>

        <div className={cn("border-t border-border p-3", collapsed && "p-2")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-md bg-elevated p-2",
              collapsed && "justify-center p-1.5"
            )}
          >
            <Avatar />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">Mariana Bringas</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  Administradora
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors",
        active
          ? "bg-gold-faint text-gold"
          : "text-muted-foreground hover:bg-elevated hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
        />
      )}
      <item.icon className={cn("h-4 w-4 shrink-0", active && "text-gold")} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-medium text-gold">
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

function Avatar() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-xs font-semibold text-gold">
      MB
    </div>
  );
}
