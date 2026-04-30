"use client";

import * as React from "react";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  onOpenMobileNav: () => void;
}

const MOCK_ALERTS = [
  { id: "1", title: "Pago vencido", body: "Telcel Olivares — Feb 2026", urgent: true },
  { id: "2", title: "Mantenimiento urgente", body: "A/C no enfría — Telcel L2", urgent: true },
  { id: "3", title: "Contrato próximo a vencer", body: "Hitness Q2 — 45 días", urgent: false },
];

export function Topbar({ onOpenMobileNav }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/80 backdrop-blur px-4 md:px-6">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Alertas"
            >
              <Bell className="h-4 w-4" />
              {MOCK_ALERTS.some((a) => a.urgent) && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Alertas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MOCK_ALERTS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2">
                <div className="flex w-full items-center gap-2">
                  {n.urgent && <span className="h-1.5 w-1.5 rounded-full bg-danger shrink-0" />}
                  <span className="text-sm font-medium">{n.title}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-3.5">{n.body}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-xs font-semibold text-gold hover:border-gold/60 transition-colors"
              aria-label="Menú de usuario"
            >
              JC
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Juan Carlos Terán</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/ajustes/perfil">Mi perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/ajustes/organizacion">Organización</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
