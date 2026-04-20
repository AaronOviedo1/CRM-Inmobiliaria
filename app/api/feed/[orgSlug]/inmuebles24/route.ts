import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildXmlFeed, getPublishedPropertiesForFeed } from "@/lib/services/feed";
import { rateLimitOr429, clientIp } from "@/lib/services/ratelimit";
import { unstable_cache } from "next/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params;

  const ip = clientIp(req);
  const rl = await rateLimitOr429("public.feed", ip);
  if (rl) return rl;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const getFeed = unstable_cache(
    async () => {
      const properties = await getPublishedPropertiesForFeed(org.id);
      return buildXmlFeed(org, properties as any);
    },
    [`feed:${org.id}:inmuebles24`],
    { revalidate: 60 * 30 },
  );

  const xml = await getFeed();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
