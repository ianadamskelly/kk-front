"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomer } from "@/lib/customer";
import AuthLayout from "@/components/AuthLayout";
import SigninIllustration from "@/components/illustrations/SigninIllustration";
import Spinner from "@/components/Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 pl-10 text-sm outline-none focus:border-brand-500";

// Small leading-icon utility — keeps the input visually anchored to
// what's being asked for. We only use it on auth + contact forms; the
// rest of the site uses plain inputs to avoid feeling busy.
function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45"
    >
      {children}
    </span>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const { user, loading, login } = useCustomer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="See your orders, courses, downloads, and the resource library — all in one place."
      illustration={<SigninIllustration className="h-auto w-full" />}
      tagline="Securely sign in to pick up where you left off."
    >
      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-ink/10 bg-white p-6"
      >
        <div>
          <label className="text-sm font-medium text-ink/70">Email</label>
          <div className="relative mt-1">
            <FieldIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m3 7 9 6 9-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </FieldIcon>
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Password</label>
          <div className="relative mt-1">
            <FieldIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="9"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 11V8a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </FieldIcon>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting && <Spinner size="sm" />}
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink/55">
        New here?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
