import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TagsClient } from "./tags-client";

export default async function TagsPage() {
  const ctx = await requireTenantContext();
  const tags = await prisma.tag.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
  return <TagsClient tags={tags as any} />;
}
