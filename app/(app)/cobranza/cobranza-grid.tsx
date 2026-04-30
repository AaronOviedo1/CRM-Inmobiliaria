"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

const MONTH_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

type PaymentStatus = "PAGADO" | "VENCIDO" | "PENDIENTE" | "PARCIAL" | "NO_APLICA";

type PaymentCell = { period: string; status: PaymentStatus; amount: number };

type LocalRow = {
  id: string;
  code: string;
  nickname: string | null;
  status: string;
  contracts: Array<{
    id: string;
    tenant: { name: string };
    monthlyRent: number;
    payments: PaymentCell[];
  }>;
};

type PlazaData = {
  id: string;
  name: string;
  code: string;
  entity: string;
  locales: LocalRow[];
};

function periodKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function statusColor(status: PaymentStatus | undefined, localStatus: string): string {
  if (localStatus === "DISPONIBLE" || localStatus === "MANTENIMIENTO") {
    return "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600";
  }
  switch (status) {
    case "PAGADO":   return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
    case "VENCIDO":  return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400";
    case "PARCIAL":  return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
    case "NO_APLICA":return "bg-slate-100 dark:bg-slate-800 text-slate-400";
    case "PENDIENTE":
    default:         return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
  }
}

function statusIcon(status: PaymentStatus | undefined, localStatus: string): string {
  if (localStatus === "DISPONIBLE") return "—";
  if (localStatus === "MANTENIMIENTO") return "🔧";
  switch (status) {
    case "PAGADO":    return "✓";
    case "VENCIDO":   return "✗";
    case "PARCIAL":   return "½";
    case "NO_APLICA": return "—";
    case "PENDIENTE":
    default:          return "·";
  }
}

const ENTITY_LABEL: Record<string, string> = { CRT: "CRT", TSR: "TSR", QHS: "QHS" };
const ENTITY_COLOR: Record<string, string> = {
  CRT: "bg-gold-faint text-gold border-gold/20",
  TSR: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  QHS: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
};

export function CobranzaGrid({ plazas, year, months }: { plazas: PlazaData[]; year: number; months: number[] }) {
  const [selectedPlaza, setSelectedPlaza] = React.useState<string>("all");

  const filtered = selectedPlaza === "all" ? plazas : plazas.filter((p) => p.id === selectedPlaza);

  // Summary stats
  const allPayments = plazas.flatMap((p) =>
    p.locales.flatMap((l) => l.contracts.flatMap((c) => c.payments))
  );
  const currentPeriod = periodKey(year, 4); // April as current
  const currPayments = allPayments.filter((p) => p.period === currentPeriod);
  const collected    = currPayments.filter((p) => p.status === "PAGADO").reduce((s, p) => s + p.amount, 0);
  const overdue      = currPayments.filter((p) => p.status === "VENCIDO").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <SummaryChip label="Cobrado Abr" value={formatCurrency(collected)} color="emerald" />
        <SummaryChip label="Vencido Abr"  value={formatCurrency(overdue)}    color="red" />
        <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          <Legend color="bg-emerald-100 dark:bg-emerald-900/40" label="Pagado" />
          <Legend color="bg-red-100 dark:bg-red-900/40"     label="Vencido" />
          <Legend color="bg-amber-100 dark:bg-amber-900/40" label="Pendiente" />
          <Legend color="bg-blue-100 dark:bg-blue-900/40"   label="Parcial" />
          <Legend color="bg-slate-100 dark:bg-slate-800"    label="N/A" />
        </div>
      </div>

      {/* Plaza filter tabs */}
      <div className="flex flex-wrap gap-2">
        <PlazaTab value="all" label="Todas" active={selectedPlaza === "all"} onClick={() => setSelectedPlaza("all")} />
        {plazas.map((p) => (
          <PlazaTab
            key={p.id}
            value={p.id}
            label={p.name}
            active={selectedPlaza === p.id}
            onClick={() => setSelectedPlaza(p.id)}
            entity={p.entity}
          />
        ))}
      </div>

      {/* Grid per plaza */}
      {filtered.map((plaza) => (
        <div key={plaza.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          {/* Plaza header */}
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", ENTITY_COLOR[plaza.entity])}>
              {ENTITY_LABEL[plaza.entity]}
            </span>
            <h3 className="font-medium text-foreground">{plaza.name}</h3>
            <span className="text-xs text-muted-foreground">
              {plaza.locales.filter((l) => l.status === "RENTADO").length}/{plaza.locales.length} locales rentados
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 bg-surface px-3 py-2 text-left text-xs font-medium text-muted-foreground w-[140px]">
                    Local
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-[160px]">
                    Inquilino
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground w-[100px]">
                    Renta
                  </th>
                  {months.map((m) => (
                    <th key={m} className="px-1 py-2 text-center text-xs font-medium text-muted-foreground w-[44px]">
                      {MONTH_LABELS[m - 1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plaza.locales.map((local) => {
                  const contract = local.contracts[0];
                  const paymentMap = Object.fromEntries(
                    (contract?.payments ?? []).map((p) => [p.period, p])
                  );
                  return (
                    <tr key={local.id} className="hover:bg-muted/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-surface px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-muted-foreground">{local.code}</span>
                          {local.nickname && (
                            <span className="truncate text-xs font-medium text-foreground max-w-[80px]">
                              {local.nickname}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {contract ? (
                          <span className="text-xs text-foreground truncate block max-w-[150px]">
                            {contract.tenant.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            {local.status === "DISPONIBLE" ? "Disponible" : local.status === "MANTENIMIENTO" ? "En mantenimiento" : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {contract ? (
                          <span className="text-xs tabular-nums text-foreground">
                            {formatCurrency(contract.monthlyRent)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      {months.map((m) => {
                        const key = periodKey(year, m);
                        const pay = paymentMap[key];
                        const color = statusColor(pay?.status as PaymentStatus, local.status);
                        const icon  = statusIcon(pay?.status as PaymentStatus, local.status);
                        return (
                          <td key={m} className="px-1 py-1.5 text-center">
                            <span
                              className={cn(
                                "inline-flex h-7 w-9 items-center justify-center rounded text-xs font-medium",
                                color
                              )}
                              title={pay ? `${formatCurrency(pay.amount)} — ${pay.status}` : undefined}
                            >
                              {icon}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Plaza subtotal */}
          <PlazaSubtotal plaza={plaza} months={months} year={year} />
        </div>
      ))}
    </div>
  );
}

function PlazaSubtotal({ plaza, months, year }: { plaza: PlazaData; months: number[]; year: number }) {
  const totals = months.map((m) => {
    const period = periodKey(year, m);
    let sum = 0;
    for (const local of plaza.locales) {
      for (const contract of local.contracts) {
        const pay = contract.payments.find((p) => p.period === period);
        if (pay?.status === "PAGADO" || pay?.status === "PARCIAL") {
          sum += pay.amount;
        }
      }
    }
    return sum;
  });

  return (
    <div className="flex border-t border-border bg-muted/20">
      <div className="sticky left-0 z-10 bg-muted/20 px-3 py-2 w-[140px]">
        <span className="text-xs font-semibold text-foreground">Total</span>
      </div>
      <div className="px-3 py-2 w-[160px]" />
      <div className="px-3 py-2 w-[100px]">
        <span className="text-xs text-muted-foreground">cobrado</span>
      </div>
      {months.map((m, i) => (
        <div key={m} className="flex w-[44px] items-center justify-center px-1 py-2">
          <span className="text-[10px] tabular-nums text-foreground font-medium">
            {totals[i]! > 0 ? `$${Math.round(totals[i]! / 1000)}k` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function SummaryChip({ label, value, color }: { label: string; value: string; color: string }) {
  const cls: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400",
    red:     "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400",
  };
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-1.5", cls[color])}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("h-3 w-3 rounded-sm", color)} />
      {label}
    </span>
  );
}

function PlazaTab({
  value, label, active, onClick, entity,
}: {
  value: string;
  label: string;
  active: boolean;
  onClick: () => void;
  entity?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-gold bg-gold-faint text-gold"
          : "border-border bg-surface text-muted-foreground hover:border-gold/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
