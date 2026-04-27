import { AppShell } from "@/components/shell/app-shell";
import { requireSession } from "@/lib/auth/session";

export default async function InternalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return <AppShell>{children}</AppShell>;
}
