"use client";

import {
  AlertTriangle,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { label: "Responses", href: "/dashboard/responses", icon: MessageSquare },
  { label: "Emails", href: "/dashboard/emails", icon: Mail },
  { label: "Ask AI", href: "/dashboard/ask", icon: Sparkles },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "z-40 flex shrink-0 flex-col border-r border-border bg-surface transition-all duration-200",
          collapsed ? "w-16" : "w-60",
          "fixed inset-y-0 left-0 lg:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary font-display text-sm font-bold text-white">
            X
          </span>
          {!collapsed && (
            <span className="font-display font-semibold text-foreground">Company X</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-bg hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon size={18} strokeWidth={2.1} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden border-t border-border p-3 lg:block">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
