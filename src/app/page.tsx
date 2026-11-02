import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Questionnaire } from "@/components/Questionnaire";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonStyles } from "@/components/ui/button-styles";

export default function Home() {
  return (
    <main className="min-h-dvh bg-bg">
      {/* Top bar */}
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary font-display text-sm font-bold text-white">
            X
          </span>
          <span className="font-display font-semibold text-foreground">Company X</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero + form */}
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <div className="mb-6 text-center">
          <p className="mb-2 font-mono text-sm text-primary">Company X · Feedback</p>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            How happy are you with our paint?
          </h1>
          <p className="mt-2 text-text-secondary">
            Three quick questions — under a minute, we promise.
          </p>
        </div>

        <div className="rounded-(--r-modal) border border-border bg-surface p-6 shadow-lg sm:p-8">
          <Questionnaire />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          On a feature phone? We can text you the survey instead — reply with three
          digits like <span className="font-mono text-text-secondary">4 5 4</span>.
        </p>
      </div>
    </main>
  );
}
