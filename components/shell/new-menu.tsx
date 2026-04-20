"use client";

import { Building2, Calendar, FileSignature, Plus, Sparkles, UserCheck, Wrench } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QUICK_ITEMS = [
  {
    href: "/propiedades/nueva",
    label: "Nueva propiedad",
    description: "Alta paso a paso con wizard + fotos",
    icon: Building2,
  },
  {
    href: "/leads/nuevo",
    label: "Nuevo lead",
    description: "Captura interés y preferencias",
    icon: Sparkles,
  },
  {
    href: "/propietarios/nuevo",
    label: "Nuevo propietario",
    description: "Alta con datos de contacto y banco",
    icon: UserCheck,
  },
  {
    href: "/contratos/nuevo",
    label: "Nuevo contrato",
    description: "Mandato / arrendamiento / compraventa",
    icon: FileSignature,
  },
  {
    href: "/visitas",
    label: "Agendar visita",
    description: "Escoge propiedad y lead",
    icon: Calendar,
  },
  {
    href: "/mantenimientos",
    label: "Nueva solicitud",
    description: "Reporta mantenimiento de una renta",
    icon: Wrench,
  },
];

interface NewMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewMenu({ open, onOpenChange }: NewMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            <Plus className="mr-2 inline-block h-5 w-5 text-gold" />
            Crear
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="group flex items-start gap-3 rounded-md border border-border bg-surface p-4 hover:border-gold/40 hover:bg-gold/5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gold/30 bg-gold-faint text-gold">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
