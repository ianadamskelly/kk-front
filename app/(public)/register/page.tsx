"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomer } from "@/lib/customer";
import AuthLayout from "@/components/AuthLayout";
import RegisterIllustration from "@/components/illustrations/RegisterIllustration";
import Spinner from "@/components/Spinner";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 pl-10 text-sm outline-none focus:border-brand-500";

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

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const { user, loading, register } = useCustomer();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Capture ?ref=CODE from the URL. We don't display it as an editable
  // field — the user just sees a confirmation banner.
  const referralCode = (search.get("ref") || "").trim().toUpperCase();
  // ?source=shop|courses|membership tags the signup so the admin can
  // target future newsletters at "people who joined while shopping" etc.
  const source = (search.get("source") || "").trim().toLowerCase();

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(
        name,
        email,
        password,
        referralCode || undefined,
        source || undefined,
      );
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join us"
      title="Create your account"
      subtitle="One account unlocks the shop, courses, membership, and your personal dashboard."
      illustration={<RegisterIllustration className="h-auto w-full" />}
      tagline="Grow with us — Kuza Kizazi means 'Grow the Generation'."
    >
      {referralCode && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-900">
          🎉 You were invited! Once you sign up and make your first purchase,
          your friend earns store credit.
          <p className="mt-1 text-xs text-brand-700/80">
            Referral code: <span className="font-mono">{referralCode}</span>
          </p>
        </div>
      )}

      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-ink/10 bg-white p-6"
      >
        <div>
          <label className="text-sm font-medium text-ink/70">Full name</label>
          <div className="relative mt-1">
            <FieldIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M4 21a8 8 0 0 1 16 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </FieldIcon>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className={inputClass}
            />
          </div>
        </div>
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
              autoComplete="email"
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
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-ink/55">
        Already have an account?{" "}
        <Link
          href={`/signin?next=${encodeURIComponent(next)}`}
          className="font-semibold text-brand-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
