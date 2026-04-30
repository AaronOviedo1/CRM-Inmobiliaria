"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  CreditCard,
  Settings,
  Store,
  Users,
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
  { href: "/dashboard",      label: "Dashboard",    icon: BarChart3 },
  { href: "/plazas",         label: "Plazas",        icon: Store },
  { href: "/cobranza",       label: "Cobranza",      icon: CreditCard },
  { href: "/contratos",      label: "Contratos",     icon: Building2 },
  { href: "/inquilinos",     label: "Inquilinos",    icon: Users },
  { href: "/finanzas",       label: "Finanzas",      icon: BarChart3 },
  { href: "/mantenimientos", label: "Mantenimientos", icon: Wrench },
];

const NAV_BOTTOM: NavItem[] = [
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 md:flex",
          collapsed ? "w-[60px]" : "w-[230px]"
        )}
      >
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-gold shadow-card"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </button>

        {/* Logo */}
        <div className={cn("flex h-14 items-center border-b border-border", collapsed ? "justify-center px-2" : "px-4")}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold-faint border border-gold/30">
              <span className="font-serif text-base font-semibold text-gold">C</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-serif text-sm font-semibold leading-none text-foreground truncate">CRT Admin</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Strata Systems</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
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

          <div className={cn("mt-4 space-y-0.5", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Sistema
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

        {/* Footer branding */}
        {!collapsed && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-[10px] text-muted-foreground">
              Powered by{" "}
              <span className="font-medium text-gold">Strata Systems MX</span>
            </p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
        active
          ? "bg-gold-faint text-gold font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
        />
      )}
      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-gold" : "text-muted-foreground group-hover:text-foreground")} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-gold">
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
