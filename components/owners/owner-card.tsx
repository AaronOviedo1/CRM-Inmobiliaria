import Link from "next/link";
import type { Owner } from "@/lib/types";
import { Building2, MessageSquare, Shield, Phone } from "lucide-react";
import { getPropertiesForOwner, getRentalsForOwner } from "@/lib/mock/factories";
import { formatPhone } from "@/lib/format";

export function OwnerCard({ owner }: { owner: Owner }) {
  const properties = getPropertiesForOwner(owner.id);
  const rentals = getRentalsForOwner(owner.id);
  return (
    <Link
      href={`/propietarios/${owner.id}`}
      className="group flex gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-gold/30"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold-faint text-sm font-semibold text-gold shrink-0">
        {owner.firstName[0]}
        {owner.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-serif text-lg font-medium">
            {owner.firstName} {owner.lastName}
          </p>
          {owner.portalAccessEnabled && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-faint px-2 py-0.5 text-[10px] text-gold">
              <Shield className="h-3 w-3" /> Portal activo
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" /> {formatPhone(owner.phone)}
          {owner.whatsapp && <MessageSquare className="ml-2 h-3 w-3" />}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3 text-gold" />
            {properties.length} propiedades
          </span>
          {rentals.length > 0 && (
            <span>{rentals.length} rentas activas</span>
          )}
        </div>
      </div>
    </Link>
  );
}
