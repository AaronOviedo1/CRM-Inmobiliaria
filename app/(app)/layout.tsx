import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function InternalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { subscriptionStatus: true },
  });

  if (org?.subscriptionStatus === "CANCELED") redirect("/suscripcion");

  return <AppShell>{children}</AppShell>;
}
