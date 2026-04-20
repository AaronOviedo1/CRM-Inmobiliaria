"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Building2,
  Calendar,
  CheckSquare,
  FileSignature,
  KeySquare,
  LayoutGrid,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  UserCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_LEADS, MOCK_PROPERTIES } from "@/lib/mock/factories";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Búsqueda global</DialogTitle>
        </DialogHeader>
        <Command
          shouldFilter
          className="flex flex-col bg-elevated"
          label="Búsqueda global"
        >
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Buscar propiedades, leads, clientes, o escribe un comando…"
              className="flex h-12 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="ml-2 rounded border border-border bg-bg px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-12 text-center text-sm text-muted-foreground">
              Sin coincidencias.
            </Command.Empty>

            <Command.Group heading="Crear" className="mb-2">
              <PaletteItem onSelect={() => go("/propiedades/nueva")} icon={<Plus className="h-4 w-4" />}>
                Crear nueva propiedad
              </PaletteItem>
              <PaletteItem onSelect={() => go("/leads/nuevo")} icon={<Plus className="h-4 w-4" />}>
                Crear nuevo lead
              </PaletteItem>
              <PaletteItem onSelect={() => go("/propietarios/nuevo")} icon={<Plus className="h-4 w-4" />}>
                Crear propietario
              </PaletteItem>
              <PaletteItem onSelect={() => go("/contratos/nuevo")} icon={<Plus className="h-4 w-4" />}>
                Crear contrato
              </PaletteItem>
            </Command.Group>

            <Command.Group heading="Ir a" className="mb-2">
              <PaletteItem onSelect={() => go("/dashboard")} icon={<LayoutGrid className="h-4 w-4" />}>
                Dashboard
              </PaletteItem>
              <PaletteItem onSelect={() => go("/propiedades")} icon={<Building2 className="h-4 w-4" />}>
                Propiedades
              </PaletteItem>
              <PaletteItem onSelect={() => go("/propietarios")} icon={<UserCheck className="h-4 w-4" />}>
                Propietarios
              </PaletteItem>
              <PaletteItem onSelect={() => go("/leads")} icon={<Sparkles className="h-4 w-4" />}>
                Leads (Kanban)
              </PaletteItem>
              <PaletteItem onSelect={() => go("/clientes")} icon={<UsersRound className="h-4 w-4" />}>
                Clientes
              </PaletteItem>
              <PaletteItem onSelect={() => go("/contratos")} icon={<FileSignature className="h-4 w-4" />}>
                Contratos
              </PaletteItem>
              <PaletteItem onSelect={() => go("/rentas")} icon={<KeySquare className="h-4 w-4" />}>
                Rentas
              </PaletteItem>
              <PaletteItem onSelect={() => go("/mantenimientos")} icon={<Wrench className="h-4 w-4" />}>
                Mantenimientos
              </PaletteItem>
              <PaletteItem onSelect={() => go("/visitas")} icon={<Calendar className="h-4 w-4" />}>
                Visitas
              </PaletteItem>
              <PaletteItem onSelect={() => go("/matching")} icon={<LayoutGrid className="h-4 w-4" />}>
                Matching
              </PaletteItem>
              <PaletteItem onSelect={() => go("/comunicacion")} icon={<MessageSquare className="h-4 w-4" />}>
                Comunicación
              </PaletteItem>
              <PaletteItem onSelect={() => go("/tareas")} icon={<CheckSquare className="h-4 w-4" />}>
                Tareas
              </PaletteItem>
            </Command.Group>

            <Command.Group heading="Propiedades" className="mb-2">
              {MOCK_PROPERTIES.slice(0, 6).map((p) => (
                <PaletteItem
                  key={p.id}
                  onSelect={() => go(`/propiedades/${p.id}`)}
                  icon={<Building2 className="h-4 w-4" />}
                >
                  <div className="flex flex-col">
                    <span className="truncate">{p.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {p.code} · {p.neighborhood}
                    </span>
                  </div>
                </PaletteItem>
              ))}
            </Command.Group>

            <Command.Group heading="Leads" className="mb-2">
              {MOCK_LEADS.slice(0, 6).map((l) => (
                <PaletteItem
                  key={l.id}
                  onSelect={() => go(`/leads/${l.id}`)}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  <div className="flex flex-col">
                    <span className="truncate">
                      {l.firstName} {l.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {l.intent} · {l.desiredZones.slice(0, 2).join(" · ")}
                    </span>
                  </div>
                </PaletteItem>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function PaletteItem({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-gold/10 aria-selected:text-gold"
    >
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </Command.Item>
  );
}
