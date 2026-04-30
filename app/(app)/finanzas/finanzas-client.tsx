"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

const MONTH_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const ENTITIES = ["CRT", "TSR", "QHS"] as const;

type Entity = "CRT" | "TSR" | "QHS";

type BudgetLine = {
  entity: string;
  month: number;
  label: string;
  budgeted: number;
  isIncome: boolean;
};

const ENTITY_LABEL: Record<Entity, string> = { CRT: "CRT Inmobiliaria", TSR: "TSR", QHS: "QHS" };
const ENTITY_COLOR: Record<Entity, string> = {
  CRT: "text-gold border-gold bg-gold-faint",
  TSR: "text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20",
  QHS: "text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20",
};

export function FinanzasClient({ lines, year }: { lines: BudgetLine[]; year: number }) {
  const [selectedEntity, setSelectedEntity] = React.useState<Entity>("CRT");
  const [view, setView] = React.useState<"monthly" | "categories">("monthly");

  const entityLines = lines.filter((l) => l.entity === selectedEntity);

  // Monthly summary
  const monthlySummary = MONTH_LABELS.map((_, i) => {
    const month = i + 1;
    const monthLines = entityLines.filter((l) => l.month === month);
    const ingresos = monthLines.filter((l) => l.isIncome).reduce((s, l) => s + l.budgeted, 0);
    const egresos  = monthLines.filter((l) => !l.isIncome).reduce((s, l) => s + l.budgeted, 0);
    return { month, label: MONTH_LABELS[i]!, ingresos, egresos, utilidad: ingresos - egresos };
  });

  // Category summary (for selected entity across all months)
  const categories = Array.from(new Set(entityLines.map((l) => l.label)));
  const catSummary = categories.map((label) => {
    const catLines = entityLines.filter((l) => l.label === label);
    const total = catLines.reduce((s, l) => s + l.budgeted, 0);
    const isIncome = catLines[0]?.isIncome ?? false;
    return { label, total, isIncome, monthly: total / 12 };
  }).sort((a, b) => b.total - a.total);

  const totalIngAnual = monthlySummary.reduce((s, m) => s + m.ingresos, 0);
  const totalEgrAnual = monthlySummary.reduce((s, m) => s + m.egresos, 0);
  const utilidadAnual = totalIngAnual - totalEgrAnual;

  const maxBar = Math.max(...monthlySummary.map((m) => Math.max(m.ingresos, m.egresos)));

  return (
    <div className="space-y-5">
      {/* Entity tabs */}
      <div className="flex flex-wrap gap-2">
        {ENTITIES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setSelectedEntity(e)}
            className={cn(
              "rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors",
              selectedEntity === e
                ? ENTITY_COLOR[e]
                : "border-border bg-surface text-muted-foreground hover:border-gold/40"
            )}
          >
            {ENTITY_LABEL[e]}
          </button>
        ))}
      </div>

      {/* Annual KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiBox label="Ingresos anuales" value={totalIngAnual}  color="emerald" />
        <KpiBox label="Egresos anuales"  value={totalEgrAnual}  color="red" />
        <KpiBox label="Utilidad anual"   value={utilidadAnual}  color={utilidadAnual >= 0 ? "gold" : "red"} />
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {(["monthly", "categories"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === v
                ? "bg-gold-faint text-gold border border-gold/30"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {v === "monthly" ? "Por mes" : "Por categoría"}
          </button>
        ))}
      </div>

      {view === "monthly" && (
        <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
          {/* Bar chart */}
          <div className="p-5 border-b border-border">
            <p className="mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Ingresos vs Egresos — {year}
            </p>
            <div className="flex items-end gap-1 h-32">
              {monthlySummary.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-0.5">
                  <div className="flex w-full gap-0.5 items-end" style={{ height: "100px" }}>
                    <div
                      className="flex-1 rounded-t bg-emerald-400/70 dark:bg-emerald-500/60 min-h-[2px]"
                      style={{ height: `${(m.ingresos / maxBar) * 100}px` }}
                      title={`Ingresos: ${formatCurrency(m.ingresos)}`}
                    />
                    <div
                      className="flex-1 rounded-t bg-red-400/70 dark:bg-red-500/60 min-h-[2px]"
                      style={{ height: `${(m.egresos / maxBar) * 100}px` }}
                      title={`Egresos: ${formatCurrency(m.egresos)}`}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-emerald-400/70" /> Ingresos</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-red-400/70" /> Egresos</span>
            </div>
          </div>

          {/* Monthly table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Mes</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Ingresos</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Egresos</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Utilidad</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlySummary.map((m) => {
                  const pct = m.ingresos > 0 ? Math.round((m.utilidad / m.ingresos) * 100) : 0;
                  return (
                    <tr key={m.month} className="hover:bg-muted/30">
                      <td className="px-4 py-2 text-xs font-medium text-foreground">{m.label}</td>
                      <td className="px-4 py-2 text-right text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(m.ingresos)}
                      </td>
                      <td className="px-4 py-2 text-right text-xs tabular-nums text-red-600 dark:text-red-400">
                        {formatCurrency(m.egresos)}
                      </td>
                      <td className={cn("px-4 py-2 text-right text-xs tabular-nums font-semibold",
                        m.utilidad >= 0 ? "text-foreground" : "text-danger"
                      )}>
                        {formatCurrency(m.utilidad)}
                      </td>
                      <td className={cn("px-4 py-2 text-right text-xs tabular-nums",
                        pct >= 30 ? "text-emerald-600 dark:text-emerald-400" :
                        pct >= 15 ? "text-gold" : "text-danger"
                      )}>
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40">
                  <td className="px-4 py-2.5 text-xs font-bold text-foreground">Total</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalIngAnual)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-red-600 dark:text-red-400">
                    {formatCurrency(totalEgrAnual)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-foreground">
                    {formatCurrency(utilidadAnual)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold tabular-nums text-foreground">
                    {totalIngAnual > 0 ? Math.round((utilidadAnual / totalIngAnual) * 100) : 0}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {view === "categories" && (
        <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Concepto</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Mensual</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Anual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {catSummary.map((c) => (
                  <tr key={c.label} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-xs text-foreground">{c.label}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        c.isIncome
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      )}>
                        {c.isIncome ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-xs tabular-nums text-muted-foreground">
                      {formatCurrency(c.monthly)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs tabular-nums font-medium text-foreground">
                      {formatCurrency(c.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    red:     "text-red-600 dark:text-red-400",
    gold:    "text-gold",
  };
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 text-xl font-bold tabular-nums", colorMap[color] ?? "text-foreground")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
