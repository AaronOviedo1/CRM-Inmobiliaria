import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { OrganizacionClient } from "./organizacion-client";

export default async function OrganizacionPage() {
  const ctx = await requireTenantContext();
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: ctx.organizationId },
    select: { id: true, name: true, slug: true, phone: true, email: true, addressLine: true, primaryColor: true },
  });
  return <OrganizacionClient org={org as any} />;
}
