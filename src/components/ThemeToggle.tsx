"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
}

export function ThemeToggle() {
  // The no-flash script in layout.tsx has already set data-theme before paint,
  // so we read the applied value directly rather than syncing via an effect.
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary transition-colors hover:border-border-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
