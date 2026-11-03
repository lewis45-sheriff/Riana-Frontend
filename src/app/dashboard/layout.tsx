"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/shell/Navbar";
import { Sidebar } from "@/components/shell/Sidebar";
import { RequireAuth } from "@/lib/auth";

const TITLES: Record<string, string> = {
  "/dashboard": "Feedback overview",
  "/dashboard/alerts": "Detractor alerts",
  "/dashboard/responses": "Responses",
  "/dashboard/emails": "Sent emails",
  "/dashboard/sms": "SMS surveys",
  "/dashboard/ask": "Ask the dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <RequireAuth>
      <div className="flex h-dvh overflow-hidden bg-bg">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
