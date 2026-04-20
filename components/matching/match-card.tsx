import Link from "next/link";
import type { MatchSuggestion } from "@/lib/types";
import { formatMoneyCompact } from "@/lib/format";
import { Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MatchCard({ match }: { match: MatchSuggestion }) {
  const p = match.property!;
  const score = Math.round(match.score);
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-elevated p-3">
      <Link href={`/propiedades/${p.id}`} className="block h-20 w-24 shrink-0 overflow-hidden rounded-md bg-bg">
        <img src={p.coverImageUrl ?? ""} alt="" className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/propiedades/${p.id}`} className="truncate text-sm font-medium hover:text-gold">
            {p.title}
          </Link>
          <span className="rounded-full border border-gold/30 bg-gold-faint px-2 py-0.5 text-[10px] font-semibold text-gold">
            {score}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {p.neighborhood} · {formatMoneyCompact(p.priceSale ?? p.priceRent ?? 0)}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {match.matchReasons.slice(0, 3).map((r) => (
            <span
              key={r}
              className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground"
            >
              {r.replace(/_/g, " ")}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost">
            <Send className="h-3 w-3" /> Enviar
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/propiedades/${p.id}`}>
              Ver <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
