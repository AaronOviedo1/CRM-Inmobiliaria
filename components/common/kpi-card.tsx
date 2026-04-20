import * as React from "react";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  trend?: number; // percent change
  trendLabel?: string;
  icon?: React.ReactNode;
  spark?: number[];
  className?: string;
  accent?: "gold" | "success" | "warning" | "danger" | "info";
}

export function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  spark,
  className,
  accent = "gold",
}: KpiCardProps) {
  const positive = (trend ?? 0) >= 0;
  const accentClass = {
    gold: "text-gold bg-gold-faint",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
    info: "text-info bg-info/10",
  }[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-surface p-5 transition-colors hover:border-gold/30",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-serif text-3xl font-medium text-foreground">
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border border-border/50",
              accentClass
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between">
        {trend !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              positive ? "text-success" : "text-danger"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend).toFixed(1)}%
            {trendLabel && (
              <span className="text-muted-foreground">· {trendLabel}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> últimos 14 días
          </span>
        )}
        {spark && <Sparkline data={spark} className="h-8 w-24" />}
      </div>
    </div>
  );
}
