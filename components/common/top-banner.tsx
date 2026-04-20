"use client";

import { AlertTriangle, Info, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TopBannerProps {
  tone?: "warning" | "info" | "danger";
  children: React.ReactNode;
  dismissible?: boolean;
}

export function TopBanner({ tone = "warning", children, dismissible = true }: TopBannerProps) {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;
  const Icon = tone === "info" ? Info : AlertTriangle;
  const toneClass = {
    warning: "bg-warning/10 text-warning border-b border-warning/30",
    info: "bg-info/10 text-info border-b border-info/30",
    danger: "bg-danger/10 text-danger border-b border-danger/30",
  }[tone];
  return (
    <div className={cn("flex items-center gap-3 px-6 py-2.5 text-xs", toneClass)}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="opacity-70 hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
