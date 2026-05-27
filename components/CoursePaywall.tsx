"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, type Course } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import { payForOrder, type Gateway, type Currency } from "@/lib/payments";

// CoursePaywall is shown on a paid course's detail/lesson page when the
// viewer hasn't unlocked it (not signed in, not a member, didn't buy the
// course). It offers two paths: buy this course, or become a member.
export default function CoursePaywall({ course }: { course: Course }) {
  const router = useRouter();
  const { user } = useCustomer();
  const [gateway, setGateway] = useState<Gateway>("flutterwave");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const buy = async () => {
    if (!user) {
      router.push(`/signin?next=/courses/${course.slug}`);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await customerFetch(
        `/api/courses/${course.id}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");
      await payForOrder(data.id, gateway, currency);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto my-8 max-w-3xl rounded-3xl border border-brand-200 bg-brand-50/40 p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
        Locked
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Unlock {course.title}
      </h2>
      <p className="mt-2 text-sm text-ink/65">
        This course is for members and course buyers. Pick whichever works for
        you — single course access stays yours for life, or unlock everything
        with a membership.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-sm font-semibold text-ink">Buy this course</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {formatPrice(course.priceCents)}
          </p>
          <p className="mt-1 text-xs text-ink/50">One-time payment</p>
          <CheckoutControls
            gateway={gateway}
            currency={currency}
            setGateway={setGateway}
            setCurrency={setCurrency}
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={submitting}
            onClick={buy}
            className="mt-4 w-full rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting
              ? "Starting payment…"
              : user
                ? "Buy this course"
                : "Sign in to buy"}
          </button>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-sm font-semibold text-ink">Or join as a member</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            $10
            <span className="text-base font-medium text-ink/55"> / month</span>
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Includes every course in the catalog.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-ink/65">
            <li>· Unlimited access to all current and future courses</li>
            <li>· Members-only library downloads</li>
            <li>· Cancel any time</li>
          </ul>
          <Link
            href={`/membership?next=/courses/${course.slug}`}
            className="mt-4 inline-block w-full rounded-full border border-brand-500 px-5 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            Explore membership
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckoutControls({
  gateway,
  currency,
  setGateway,
  setCurrency,
}: {
  gateway: Gateway;
  currency: Currency;
  setGateway: (g: Gateway) => void;
  setCurrency: (c: Currency) => void;
}) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2">
        {(
          [
            { v: "flutterwave" as Gateway, label: "Card / M-Pesa" },
            { v: "sifalo" as Gateway, label: "eDahab / EVC" },
          ]
        ).map(({ v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setGateway(v);
              if (v === "sifalo") setCurrency("USD");
            }}
            className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              gateway === v
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-ink/15 text-ink/60 hover:border-brand-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="inline-flex rounded-full border border-ink/15 p-0.5">
        {(["USD", "KES"] as Currency[]).map((c) => {
          const disabled = gateway === "sifalo" && c === "KES";
          return (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                currency === c
                  ? "bg-brand-500 text-white"
                  : disabled
                    ? "text-ink/25"
                    : "text-ink/60 hover:text-ink"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
