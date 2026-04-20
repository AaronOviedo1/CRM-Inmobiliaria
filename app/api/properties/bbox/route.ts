import { NextRequest, NextResponse } from "next/server";
import { requireTenantContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/repos/tenant";
import { BBoxSchema } from "@/lib/validators/property";

export async function GET(req: NextRequest) {
  const ctx = await requireTenantContext();
  const sp = req.nextUrl.searchParams;

  const parsed = BBoxSchema.safeParse({
    neLat: sp.get("neLat"),
    neLng: sp.get("neLng"),
    swLat: sp.get("swLat"),
    swLng: sp.get("swLng"),
    status: sp.get("status"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PARAMS" }, { status: 422 });
  }

  const { neLat, neLng, swLat, swLng, status } = parsed.data;

  const properties = await withTenant(ctx, (db) =>
    db.property.findMany({
      where: {
        deletedAt: null,
        status: (status ?? "DISPONIBLE") as any,
        latitude: { gte: swLat, lte: neLat },
        longitude: { gte: swLng, lte: neLng },
      },
      select: {
        id: true,
        code: true,
        title: true,
        latitude: true,
        longitude: true,
        priceSale: true,
        priceRent: true,
        category: true,
        transactionType: true,
        coverImageUrl: true,
        status: true,
      },
      take: 200,
    }),
  );

  return NextResponse.json(properties);
}
