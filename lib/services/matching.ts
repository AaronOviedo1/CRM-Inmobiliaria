/// Matching engine propiedad↔lead.
///
/// Pondera:
///   - price fit:     40%
///   - zone fit:      25%
///   - type fit:      15%
///   - bedrooms/bathrooms fit:  10%
///   - must-haves fit: 10%
///
/// Retorna las top-N propiedades ordenadas por score descendente.

import { withTenant } from "../repos/tenant";
import type { TenantContext } from "../prisma";
import type { Lead, Property } from "@prisma/client";

export type MatchReason =
  | "PRICE_FIT"
  | "PRICE_PARTIAL"
  | "ZONE_FIT"
  | "TYPE_FIT"
  | "BEDROOMS_FIT"
  | "BATHROOMS_FIT"
  | "MUST_HAVES_FIT";

export type ScoredMatch = {
  propertyId: string;
  score: number;
  reasons: MatchReason[];
};

export function scoreLeadProperty(
  lead: Pick<
    Lead,
    | "intent"
    | "budgetMin"
    | "budgetMax"
    | "desiredZones"
    | "propertyTypeInterests"
    | "minBedrooms"
    | "minBathrooms"
    | "mustHaves"
  >,
  property: Pick<
    Property,
    | "transactionType"
    | "category"
    | "priceSale"
    | "priceRent"
    | "neighborhood"
    | "city"
    | "bedrooms"
    | "bathrooms"
    | "amenities"
    | "isFurnished"
    | "acceptsPets"
    | "hasPool"
  >,
): { score: number; reasons: MatchReason[] } {
  let score = 0;
  const reasons: MatchReason[] = [];

  // -- PRICE FIT (40%) ------------------------------------------------------
  const relevantPrice =
    lead.intent === "RENTA"
      ? Number(property.priceRent ?? 0)
      : Number(property.priceSale ?? 0);

  const min = lead.budgetMin ? Number(lead.budgetMin) : undefined;
  const max = lead.budgetMax ? Number(lead.budgetMax) : undefined;

  if (relevantPrice > 0 && (min !== undefined || max !== undefined)) {
    if (
      (min === undefined || relevantPrice >= min) &&
      (max === undefined || relevantPrice <= max)
    ) {
      score += 40;
      reasons.push("PRICE_FIT");
    } else {
      // Partial: dentro del ±15% del rango
      const tgtMax = max ?? Infinity;
      const overBy = tgtMax === Infinity ? 0 : (relevantPrice - tgtMax) / tgtMax;
      if (overBy > 0 && overBy <= 0.15) {
        score += 20;
        reasons.push("PRICE_PARTIAL");
      }
    }
  }

  // -- ZONE FIT (25%) -------------------------------------------------------
  const zones = (lead.desiredZones ?? []).map((z) => z.toLowerCase());
  const propZone = (property.neighborhood ?? "").toLowerCase();
  if (zones.length && zones.includes(propZone)) {
    score += 25;
    reasons.push("ZONE_FIT");
  }

  // -- TYPE FIT (15%) -------------------------------------------------------
  if ((lead.propertyTypeInterests ?? []).includes(property.category as any)) {
    score += 15;
    reasons.push("TYPE_FIT");
  }

  // -- BEDROOMS / BATHROOMS FIT (10%) ---------------------------------------
  let beds = 0;
  if (lead.minBedrooms != null && property.bedrooms != null) {
    if (property.bedrooms >= lead.minBedrooms) {
      beds += 5;
      reasons.push("BEDROOMS_FIT");
    }
  } else if (lead.minBedrooms == null) {
    beds += 5;
  }
  let baths = 0;
  if (lead.minBathrooms != null && property.bathrooms != null) {
    if (property.bathrooms >= lead.minBathrooms) {
      baths += 5;
      reasons.push("BATHROOMS_FIT");
    }
  } else if (lead.minBathrooms == null) {
    baths += 5;
  }
  score += beds + baths;

  // -- MUST-HAVES FIT (10%) -------------------------------------------------
  const mh = (lead.mustHaves ?? []).map((x) => x.toLowerCase());
  if (mh.length) {
    const matched = mh.filter((want) => matchesMustHave(want, property));
    const ratio = matched.length / mh.length;
    const pts = Math.round(ratio * 10);
    score += pts;
    if (matched.length === mh.length) reasons.push("MUST_HAVES_FIT");
  } else {
    score += 10;
  }

  return { score: Math.min(100, Math.max(0, score)), reasons };
}

function matchesMustHave(
  want: string,
  p: Pick<Property, "amenities" | "isFurnished" | "acceptsPets" | "hasPool">,
): boolean {
  const amen = (p.amenities ?? []).map((a) => a.toLowerCase());
  if (want === "amueblado") return Boolean(p.isFurnished);
  if (want === "pet-friendly" || want === "mascotas") return Boolean(p.acceptsPets);
  if (want === "alberca" || want === "piscina") return Boolean(p.hasPool);
  return amen.includes(want);
}

/**
 * Genera (o refresca) MatchSuggestions para el lead.
 * Idempotente: usa `(leadId, propertyId)` unique y actualiza score si ya existía.
 */
export async function matchLeadToProperties(
  ctx: TenantContext,
  leadId: string,
  opts: { topN?: number; minScore?: number } = {},
): Promise<ScoredMatch[]> {
  const topN = opts.topN ?? 10;
  const minScore = opts.minScore ?? 40;

  return withTenant(ctx, async (db) => {
    const lead = await db.lead.findFirst({
      where: { id: leadId, deletedAt: null },
    });
    if (!lead) return [];

    const isRenta =
      lead.intent === "RENTA" || lead.intent === "AMBOS";
    const isCompra =
      lead.intent === "COMPRA" ||
      lead.intent === "INVERSION" ||
      lead.intent === "AMBOS";

    const tx: any[] = [];
    if (isRenta) tx.push("RENTA", "VENTA_Y_RENTA");
    if (isCompra) tx.push("VENTA", "VENTA_Y_RENTA", "PREVENTA");

    const properties = await db.property.findMany({
      where: {
        deletedAt: null,
        status: "DISPONIBLE",
        transactionType: { in: tx.length ? tx : undefined },
      },
      take: 500,
    });

    const scored: ScoredMatch[] = properties
      .map((p) => {
        const r = scoreLeadProperty(lead, p);
        return { propertyId: p.id, score: r.score, reasons: r.reasons };
      })
      .filter((x) => x.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    for (const m of scored) {
      await db.matchSuggestion.upsert({
        where: { leadId_propertyId: { leadId: lead.id, propertyId: m.propertyId } },
        create: {
          organizationId: ctx.organizationId,
          leadId: lead.id,
          propertyId: m.propertyId,
          score: m.score,
          matchReasons: m.reasons,
          status: "PROPUESTO",
        },
        update: {
          score: m.score,
          matchReasons: m.reasons,
        },
      });
    }

    return scored;
  });
}
