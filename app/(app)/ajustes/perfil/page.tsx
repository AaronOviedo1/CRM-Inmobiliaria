import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PerfilForm } from "./perfil-form";

export default async function PerfilPage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, commissionDefaultPct: true },
  });
  return <PerfilForm user={user as any} />;
}
