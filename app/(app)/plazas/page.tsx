import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/common/page-header";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const ENTITY_BADGE: Record<string, string> = {
  CRT: "bg-gold-faint text-gold border-gold/20",
  TSR: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  QHS: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
};

export default async function PlazasPage() {
  const ctx = await requireTenantContext();
  const oid = ctx.organizationId;

  const plazas = await prisma.plaza.findMany({
    where: { organizationId: oid },
    orderBy: [{ entity: "asc" }, { name: "asc" }],
    include: {
      locales: {
        include: {
          contracts: {
            where: { isActive: true },
            select: { monthlyRent: true },
          },
        },
      },
    },
  });

  const summary = plazas.map((p) => {
    const total    = p.locales.length;
    const rentados = p.locales.filter((l) => l.status === "RENTADO").length;
    const ingreso  = p.locales.reduce((s, l) => {
      return s + l.contracts.reduce((cs, c) => cs + Number(c.monthlyRent), 0);
    }, 0);
    return { ...p, total, rentados, ingreso, ocupacion: total > 0 ? Math.round((rentados / total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plazas"
        description="Todas las propiedades administradas por CRT, TSR y QHS."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summary.map((plaza) => (
          <Link
            key={plaza.id}
            href={`/plazas/${plaza.id}`}
            className="group flex flex-col rounded-xl border border-border bg-surface p-5 shadow-card hover:border-gold/40 hover:shadow-gold-glow transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", ENTITY_BADGE[plaza.entity])}>
                {plaza.entity}
              </span>
            </div>

            <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-gold transition-colors">
              {plaza.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{plaza.address}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Locales"   value={plaza.total.toString()} />
              <Stat label="Rentados"  value={plaza.rentados.toString()} />
              <Stat label="Ocupación" value={`${plaza.ocupacion}%`} highlight={plaza.ocupacion >= 90} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ingreso mensual</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(plaza.ingreso)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>

            {/* Ocupación bar */}
            <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  plaza.ocupacion >= 90 ? "bg-success" :
                  plaza.ocupacion >= 70 ? "bg-gold" :
                  "bg-danger"
                )}
                style={{ width: `${plaza.ocupacion}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md bg-muted p-2">
      <p className={cn("text-base font-semibold", highlight ? "text-success" : "text-foreground")}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
