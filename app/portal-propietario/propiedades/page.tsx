import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { StatusPill } from "@/components/common/status-pill";
import { PROPERTY_STATUS_LABEL, PROPERTY_STATUS_TONE, TRANSACTION_TYPE_LABEL } from "@/lib/labels";
import { formatMoneyCompact } from "@/lib/format";
import { validatePortalSession, PORTAL_COOKIE_NAME } from "@/lib/services/portal-sessions";
import { prisma } from "@/lib/prisma";

const toN = (v: any) => v === null || v === undefined ? 0 : typeof v === "object" && "toNumber" in v ? v.toNumber() : Number(v);

export default async function OwnerPropertiesPage() {
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal-propietario/login");
  const session = await validatePortalSession(token);
  if (!session || session.kind !== "OWNER") redirect("/portal-propietario/login");

  const properties = await prisma.property.findMany({
    where: { ownerId: session.subjectId, organizationId: session.organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Mis propiedades" description="Estado en vivo de cada inmueble." />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/portal-propietario/propiedades/${p.id}`}
            className="group overflow-hidden rounded-lg border border-border bg-surface hover-lift"
          >
            <div className="relative aspect-[4/3] bg-bg">
              {p.coverImageUrl && (
                <img src={p.coverImageUrl} className="absolute inset-0 h-full w-full object-cover" alt="" />
              )}
              <StatusPill tone={PROPERTY_STATUS_TONE[p.status as keyof typeof PROPERTY_STATUS_TONE]} className="absolute left-3 top-3">
                {PROPERTY_STATUS_LABEL[p.status as keyof typeof PROPERTY_STATUS_LABEL]}
              </StatusPill>
            </div>
            <div className="p-4">
              <p className="font-serif text-lg leading-tight truncate">{p.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {TRANSACTION_TYPE_LABEL[p.transactionType as keyof typeof TRANSACTION_TYPE_LABEL]} · {formatMoneyCompact(toN(p.priceSale ?? p.priceRent))}
              </p>
            </div>
          </Link>
        ))}
        {properties.length === 0 && (
          <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">Sin propiedades registradas.</p>
        )}
      </div>
    </div>
  );
}
