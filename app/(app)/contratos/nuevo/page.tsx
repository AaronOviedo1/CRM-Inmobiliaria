import { requireTenantContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NuevoContratoForm } from "./nuevo-contrato-form";

export default async function NuevoContratoPage() {
  const ctx = await requireTenantContext();
  const [properties, owners, users] = await Promise.all([
    prisma.property.findMany({
      where: { organizationId: ctx.organizationId, deletedAt: null },
      select: { id: true, code: true, title: true },
      orderBy: { code: "asc" },
      take: 100,
    }),
    prisma.owner.findMany({
      where: { organizationId: ctx.organizationId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
    prisma.user.findMany({
      where: { organizationId: ctx.organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return <NuevoContratoForm properties={properties} owners={owners} users={users} />;
}
