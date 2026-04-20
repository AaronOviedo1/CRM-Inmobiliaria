import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoneyCompact } from "@/lib/format";
import { PROPERTY_CATEGORY_LABEL, TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { PublicContactForm } from "@/components/public/public-contact-form";
import { WhatsAppFab } from "@/components/public/whatsapp-fab";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ orgSlug: string }>; }

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function PublicAgencyPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findFirst({
    where: { slug: orgSlug },
    select: { id: true, name: true, slug: true, phone: true, email: true, addressLine: true, city: true, state: true, primaryColor: true },
  });
  if (!org) notFound();

  const featured = await prisma.property.findMany({
    where: { organizationId: org.id, status: "DISPONIBLE" as any, deletedAt: null },
    select: {
      id: true, title: true, slug: true, coverImageUrl: true,
      transactionType: true, category: true, neighborhood: true,
      priceSale: true, priceRent: true, bedrooms: true,
    },
    orderBy: { viewsCount: "desc" },
    take: 9,
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-surface border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top right, rgba(201,169,97,0.15), transparent 60%)" }}
        />
        <div className="container relative max-w-6xl px-4 py-20 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-md border border-gold/40 bg-gold-faint font-serif text-2xl"
                  style={{ color: org.primaryColor ?? "#C9A961" }}
                >
                  {org.name[0]}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Inmobiliaria</p>
              </div>
              <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">{org.name}</h1>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Acompañamos a familias e inversionistas en la compra, venta y renta de inmuebles. Trato cercano, acabados impecables.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={`/contacto/${org.slug}`}>
                    Contactarnos <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {org.phone && (
                  <Button variant="outline" size="lg">
                    <Phone className="h-4 w-4" /> {org.phone}
                  </Button>
                )}
              </div>
            </div>
            <div className="grid gap-3 text-right">
              <Stat label="Propiedades activas" value={String(featured.length) + "+"} />
              <Stat label="Calificación" value="4.9 ★" />
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Cartera destacada</p>
            <h2 className="mt-1 font-serif text-3xl">Propiedades en exclusiva</h2>
          </div>
          <Button variant="ghost">Ver todas →</Button>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.slug}`}
              className="group overflow-hidden rounded-lg border border-border bg-surface hover-lift"
            >
              <div className="relative aspect-[4/3] bg-bg">
                {p.coverImageUrl && (
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                  <p className="text-[10px] uppercase tracking-wider text-gold">
                    {TRANSACTION_TYPE_LABEL[p.transactionType as keyof typeof TRANSACTION_TYPE_LABEL]}
                  </p>
                  <p className="mt-0.5 font-serif text-lg leading-tight">{p.title}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-serif text-xl text-gold">
                    {formatMoneyCompact(toN(p.priceSale ?? p.priceRent))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {PROPERTY_CATEGORY_LABEL[p.category as keyof typeof PROPERTY_CATEGORY_LABEL]} · {p.neighborhood}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {p.bedrooms ?? "—"} rec
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container max-w-6xl px-4 py-16 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Testimonios</p>
            <h2 className="mt-1 font-serif text-3xl">Nuestros clientes nos recomiendan</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                { name: "Fernanda C.", quote: "Nos vendieron la casa en menos de 45 días. Trato súper profesional." },
                { name: "Rodrigo E.", quote: "Administran 3 rentas nuestras. Cada mes llega el depósito y un reporte claro." },
              ].map((t) => (
                <div key={t.name} className="rounded-lg border border-border bg-bg p-5">
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 font-serif text-lg leading-snug">"{t.quote}"</p>
                  <p className="mt-3 text-xs text-muted-foreground">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-bg p-6">
            <h3 className="font-serif text-xl">Ponte en contacto</h3>
            <p className="mt-1 text-xs text-muted-foreground">Sea para comprar, rentar, vender o solo platicar.</p>
            <PublicContactForm />
          </div>
        </div>
      </section>

      {org.addressLine && (
        <section className="container max-w-6xl px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 text-gold" />
            {org.addressLine}{org.city ? `, ${org.city}` : ""}{org.state ? `, ${org.state}` : ""}
          </div>
        </section>
      )}

      <WhatsAppFab />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-3">
      <p className="font-serif text-3xl text-gold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
