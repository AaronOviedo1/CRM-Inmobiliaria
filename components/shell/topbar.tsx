"use client";

import * as React from "react";
import { Bell, Menu, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";

interface TopbarProps {
  onOpenPalette: () => void;
  onOpenMobileNav: () => void;
  onOpenNew: () => void;
}

const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Nuevo lead de Inmuebles24", body: "Fernanda Corral → casa en Las Quintas", at: new Date(Date.now() - 1000 * 60 * 15) },
  { id: "2", title: "Pago de renta confirmado", body: "Rental CD-2026-0021 · $28,000", at: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "3", title: "Contrato próximo a vencer", body: "Mandato exclusiva termina en 14 días", at: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: "4", title: "Mantenimiento urgente", body: "Fuga en Condominio Pitic #204", at: new Date(Date.now() - 1000 * 60 * 60 * 20) },
];

export function Topbar({ onOpenPalette, onOpenMobileNav, onOpenNew }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-elevated"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onOpenPalette}
        className={cn(
          "group flex h-9 w-full max-w-xl items-center gap-2 rounded-md border border-border bg-elevated px-3 text-sm text-muted-foreground",
          "hover:border-gold/40 hover:text-foreground transition-colors"
        )}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar propiedades, leads, clientes…</span>
        <kbd className="rounded border border-border bg-bg px-1.5 py-0.5 text-[10px] uppercase">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden md:inline-flex"
          onClick={onOpenNew}
        >
          <Plus className="h-4 w-4" /> Nuevo
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-elevated text-muted-foreground hover:text-gold"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-bg" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MOCK_NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex-col items-start gap-1 py-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatRelative(n.at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/ajustes/notificaciones" className="text-xs text-gold">
                Ver todas las notificaciones →
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-xs font-semibold text-gold"
              aria-label="Menú de usuario"
            >
              MB
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mariana Bringas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/ajustes/perfil">Mi perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/ajustes/organizacion">Organización</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/ajustes/suscripcion">Suscripción</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">Cerrar sesión</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
