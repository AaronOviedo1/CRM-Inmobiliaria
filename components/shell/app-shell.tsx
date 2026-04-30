"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[230px]">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
