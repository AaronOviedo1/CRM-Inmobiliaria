import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gold/5" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.2fr_1fr]">
        <div className="hidden flex-col justify-between border-r border-border bg-surface/50 p-12 lg:flex">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/40 bg-gold-faint">
              <span className="font-serif text-xl font-semibold text-gold">C</span>
            </div>
            <div>
              <p className="font-serif text-lg font-medium">Casa Dorada CRM</p>
              <p className="text-xs uppercase tracking-wider text-gold">
                Multi-tenant · Hermosillo
              </p>
            </div>
          </Link>

          <div>
            <p className="font-serif text-4xl leading-tight text-foreground">
              Dejá de perseguir leads.
              <br />
              <span className="gold-gradient-text">Cerrá operaciones.</span>
            </p>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              CRM premium diseñado para inmobiliarias que crecen: propiedades, leads, rentas y
              portales para propietarios e inquilinos en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
            <Stat label="Propiedades activas" value="40+" />
            <Stat label="Leads por mes" value="120" />
            <Stat label="Rentas bajo gestión" value="85" />
          </div>
        </div>

        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-serif text-2xl text-foreground">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
