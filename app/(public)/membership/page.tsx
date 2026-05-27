"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import { payForOrder, type Gateway, type Currency } from "@/lib/payments";
import { LoadingBlock } from "@/components/Spinner";
import MembershipIllustration from "@/components/illustrations/MembershipIllustration";

interface MembershipState {
  status: "active" | "expired" | "cancelled" | "none";
  isActive?: boolean;
  currentPeriodEnd?: string | null;
  startedAt?: string | null;
  cancelledAt?: string | null;
  priceUSD: number;
  priceKESCents: number;
}

// PERKS render as icon tiles in the membership page. Each row picks a
// small SVG matching its theme so the list scans like a benefits poster
// rather than a wall of bullet points.
const PERKS: { title: string; description: string; icon: "courses" | "library" | "future" | "support" | "cancel" }[] = [
  {
    title: "Every course unlocked",
    description: "Unlimited access to the entire course catalog while your membership is active.",
    icon: "courses",
  },
  {
    title: "All future releases",
    description: "New courses we publish are automatically included — no extra payment.",
    icon: "future",
  },
  {
    title: "Full Resource Library",
    description: "Every template, guide, and tool in the library unlocks the moment you join.",
    icon: "library",
  },
  {
    title: "Priority Q&A replies",
    description: "Members jump to the front of the queue when posting questions on lessons.",
    icon: "support",
  },
  {
    title: "Cancel any time",
    description: "Each payment buys 30 days. Stop paying and you keep what you've already paid for — no penalties.",
    icon: "cancel",
  },
];

function PerkIcon({ kind, className = "h-5 w-5" }: { kind: PerkKind; className?: string }) {
  switch (kind) {
    case "courses":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "library":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3V5zM21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "future":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M21 12a9 9 0 1 0-3.5 7.1L21 20l-.9-3.5A9 9 0 0 0 21 12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="13" cy="12" r="1" fill="currentColor" />
          <circle cx="17" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case "cancel":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

type PerkKind = "courses" | "library" | "future" | "support" | "cancel";

export default function MembershipPage() {
  const router = useRouter();
  const { user, loading } = useCustomer();
  const [state, setState] = useState<MembershipState | null>(null);
  const [stateLoading, setStateLoading] = useState(true);
  const [gateway, setGateway] = useState<Gateway>("flutterwave");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (gateway === "sifalo" && currency !== "USD") setCurrency("USD");
  }, [gateway, currency]);

  const load = useCallback(async () => {
    if (!user) {
      setStateLoading(false);
      return;
    }
    setStateLoading(true);
    try {
      const res = await customerFetch(`/api/memberships/me`);
      if (res.ok) setState(await res.json());
    } finally {
      setStateLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const subscribe = async () => {
    if (!user) {
      router.push("/signin?next=/membership");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await customerFetch(`/api/memberships/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");
      await payForOrder(data.id, gateway, currency);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const priceUSD = state?.priceUSD ?? 10;
  const priceKES = state?.priceKESCents ?? priceUSD * 130 * 100;
  const isActive = state?.isActive === true;
  const periodEnd = state?.currentPeriodEnd
    ? formatDate(state.currentPeriodEnd)
    : "";

  return (
    <div className="space-y-16 pb-16">
      {/* Hero — text on the left, illustration on the right */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              Membership
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              One subscription, every course
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink/65">
              Become a Kuza Kizazi member for{" "}
              <span className="font-semibold text-ink">
                ${priceUSD.toFixed(2)} USD
              </span>{" "}
              per month and unlock the entire course catalog plus the
              members-only Resource Library. Prefer to buy individual
              courses?{" "}
              <Link href="/courses" className="text-brand-600 hover:underline">
                That still works too.
              </Link>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-ink/55">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                Cancel any time
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                No auto-charge
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                Manual 30-day renewal
              </span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-full">
            <MembershipIllustration className="h-auto w-full" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4">
        <div className="rounded-3xl border border-brand-200 bg-white p-8 shadow-sm">
          {loading || stateLoading ? (
            <LoadingBlock label="Loading your membership…" />
          ) : !user ? (
            <SignedOutView priceUSD={priceUSD} priceKES={priceKES} />
          ) : isActive ? (
            <ActiveView
              periodEnd={periodEnd}
              priceUSD={priceUSD}
              priceKES={priceKES}
              gateway={gateway}
              currency={currency}
              setGateway={setGateway}
              setCurrency={setCurrency}
              submit={subscribe}
              submitting={submitting}
              error={error}
            />
          ) : (
            <JoinView
              priceUSD={priceUSD}
              priceKES={priceKES}
              gateway={gateway}
              currency={currency}
              setGateway={setGateway}
              setCurrency={setCurrency}
              submit={subscribe}
              submitting={submitting}
              error={error}
              wasMember={state?.status === "expired" || state?.status === "cancelled"}
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-brand-500">
          What you get
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Everything included in one flat monthly fee
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((perk) => (
            <li
              key={perk.title}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <PerkIcon kind={perk.icon} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {perk.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                {perk.description}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-ink/45">
          Renewal is manual — each payment extends your membership by 30 days.
          Nothing auto-charges your card.
        </p>
      </section>
    </div>
  );
}

function PriceTag({ priceUSD, priceKES }: { priceUSD: number; priceKES: number }) {
  return (
    <p className="text-3xl font-semibold text-ink">
      ${priceUSD.toFixed(2)}
      <span className="text-base font-medium text-ink/55"> / month</span>
      <span className="block text-sm font-normal text-ink/45">
        {`≈ ${formatPrice(priceKES)} at today's rate`}
      </span>
    </p>
  );
}

function SignedOutView({ priceUSD, priceKES }: { priceUSD: number; priceKES: number }) {
  return (
    <div className="text-center">
      <PriceTag priceUSD={priceUSD} priceKES={priceKES} />
      <p className="mt-4 text-sm text-ink/60">
        Sign in or create an account to subscribe.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/signin?next=/membership"
          className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Sign in
        </Link>
        <Link
          href="/register?next=/membership"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink/70 hover:bg-ink/5"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

interface CheckoutProps {
  priceUSD: number;
  priceKES: number;
  gateway: Gateway;
  currency: Currency;
  setGateway: (g: Gateway) => void;
  setCurrency: (c: Currency) => void;
  submit: () => void;
  submitting: boolean;
  error: string;
}

function JoinView(props: CheckoutProps & { wasMember: boolean }) {
  return (
    <div>
      <div className="text-center">
        <PriceTag priceUSD={props.priceUSD} priceKES={props.priceKES} />
        {props.wasMember && (
          <p className="mt-2 text-sm text-ink/55">
            Welcome back — your previous membership has ended.
          </p>
        )}
      </div>
      <CheckoutControls {...props} actionLabel="Become a member" />
    </div>
  );
}

function ActiveView(props: CheckoutProps & { periodEnd: string }) {
  return (
    <div>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
          Active member
        </p>
        <p className="mt-2 text-2xl font-semibold text-ink">
          Access renews through {props.periodEnd || "—"}
        </p>
        <p className="mt-2 text-sm text-ink/55">
          Renew any time to add another 30 days. Renewing now extends from your
          current end date — you won&apos;t lose unused time.
        </p>
      </div>
      <CheckoutControls {...props} actionLabel="Renew for another month" />
      <div className="mt-6 text-center">
        <Link
          href="/courses"
          className="text-sm font-semibold text-brand-600 hover:underline"
        >
          Browse the full course library →
        </Link>
      </div>
    </div>
  );
}

function CheckoutControls({
  gateway,
  currency,
  setGateway,
  setCurrency,
  submit,
  submitting,
  error,
  actionLabel,
}: CheckoutProps & { actionLabel: string }) {
  return (
    <>
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-brand-500">
        Payment method
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(
          [
            {
              value: "flutterwave" as Gateway,
              title: "Card / M-Pesa",
              subtitle: "Pay with card, mobile money, or bank — via Flutterwave.",
            },
            {
              value: "sifalo" as Gateway,
              title: "eDahab / EVC / Zaad",
              subtitle: "Pay with Somali mobile wallets — via Sifalo Pay (USD).",
            },
          ]
        ).map((g) => {
          const active = gateway === g.value;
          return (
            <button
              key={g.value}
              type="button"
              onClick={() => setGateway(g.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-brand-500 bg-brand-50"
                  : "border-ink/15 hover:border-brand-300"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  active ? "text-brand-700" : "text-ink"
                }`}
              >
                {g.title}
              </p>
              <p className="mt-1 text-xs text-ink/55">{g.subtitle}</p>
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand-500">
        Currency
      </h3>
      <div className="mt-3 inline-flex rounded-full border border-ink/15 p-1">
        {(["USD", "KES"] as Currency[]).map((c) => {
          const active = currency === c;
          const disabled = gateway === "sifalo" && c === "KES";
          return (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
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

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="mt-6 w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? "Starting payment…" : actionLabel}
      </button>
    </>
  );
}
