"use client";

import { Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Enter your email/username and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh bg-surface">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary font-display text-base font-bold text-white">
              X
            </span>
            <span className="font-display text-lg font-semibold text-foreground">
              Company X
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-text-secondary">
              Sign in to the feedback dashboard.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-danger-bg p-3" role="alert">
                <p className="text-sm text-danger-text">{error}</p>
              </div>
            )}

            <Input
              label="Email or username"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="care@companyx.example"
              autoComplete="username"
              icon={<User size={18} />}
              disabled={submitting}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              icon={<Lock size={18} />}
              disabled={submitting}
            />

            <Button
              type="submit"
              loading={submitting}
              fullWidth
              size="lg"
              className="h-12 min-h-12 w-full text-base font-semibold shadow-md"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Customer? The feedback form is{" "}
            <Link href="/" className="font-medium text-primary hover:text-primary-hover">
              here
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right — hero */}
      <aside className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-gradient-primary p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.4) 0, transparent 35%)",
          }}
        />
        <div className="relative max-w-lg">
          <h2 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
            Feedback customers actually enjoy giving.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">
            Track product, customer care and happiness in real time — with
            instant alerts when someone needs a follow-up.
          </p>
        </div>
        <p className="relative mt-8 text-xs text-white/75">
          &copy; {new Date().getFullYear()} Company X · Feedback
        </p>
      </aside>
    </main>
  );
}
