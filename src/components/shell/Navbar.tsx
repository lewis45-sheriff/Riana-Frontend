"use client";

import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Navbar({ title, onMenuClick }: Readonly<NavbarProps>) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName =
    user && (user.first_name || user.last_name)
      ? `${user.first_name} ${user.last_name}`.trim()
      : user?.username || "Care Rep";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-bg lg:hidden"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-border bg-surface py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-border-hover"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:block">
              {displayName}
            </span>
            <ChevronDown
              size={15}
              className={cn("text-muted transition-transform", open && "rotate-180")}
            />
          </button>

          {open && (
            <div className="animate-fade-in absolute right-0 top-full mt-1.5 w-56 overflow-hidden rounded-md border border-border bg-surface shadow-lg">
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-bg"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
