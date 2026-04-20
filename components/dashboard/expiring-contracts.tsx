import Link from "next/link";
import type { PropertyContract } from "@/lib/types";
import { CONTRACT_KIND_LABEL } from "@/lib/labels";
import { daysUntil, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

export function ExpiringContracts({
  contracts,
}: {
  contracts: PropertyContract[];
}) {
  const filtered = contracts
    .filter((c) => {
      const d = daysUntil(c.endDate);
      return d !== null && d >= 0 && d <= 30;
    })
    .sort((a, b) => (a.endDate?.getTime() ?? 0) - (b.endDate?.getTime() ?? 0));

  if (filtered.length === 0)
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Sin contratos por vencer"
        description="En los próximos 30 días no tienes vencimientos."
      />
    );

  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {filtered.map((c) => {
        const days = daysUntil(c.endDate) ?? 0;
        const urgent = days <= 15;
        return (
          <li key={c.id} className="flex items-center gap-3 p-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border",
                urgent
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-warning/30 bg-warning/10 text-warning"
              )}
            >
              {days}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {c.property?.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {CONTRACT_KIND_LABEL[c.contractKind]} · vence{" "}
                {formatDate(c.endDate)}
              </p>
            </div>
            <Link
              href={`/contratos/${c.id}`}
              className="text-xs text-gold hover:text-gold-hover"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
