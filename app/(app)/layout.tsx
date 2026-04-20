import { AppShell } from "@/components/shell/app-shell";

export default async function InternalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO(backend): replace with real session + org check:
  // const user = await getSession();
  // if (!user) redirect("/login");
  // const org = await prisma.organization.findUnique({ where: { id: user.organizationId }, select: { subscriptionStatus: true } });
  // if (org?.subscriptionStatus === "CANCELED") redirect("/suscripcion");

  return <AppShell>{children}</AppShell>;
}
