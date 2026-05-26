"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useCustomer } from "@/lib/customer";
import { API_URL, formatPrice } from "@/lib/api";
import CheckoutExtras, { type AppliedCoupon } from "@/components/CheckoutExtras";
import EmptyState from "@/components/EmptyState";
import Spinner from "@/components/Spinner";

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500";

type Gateway = "flutterwave" | "sifalo";
type Currency = "USD" | "KES";

const GATEWAYS: { value: Gateway; title: string; subtitle: string }[] = [
  {
    value: "flutterwave",
    title: "Card / M-Pesa",
    subtitle: "Pay with card, mobile money, or bank — via Flutterwave.",
  },
  {
    value: "sifalo",
    title: "eDahab / EVC / Zaad",
    subtitle: "Pay with Somali mobile wallets — via Sifalo Pay (USD).",
  },
];

// FlutterwaveCheckout is loaded on demand from checkout.flutterwave.com.
declare global {
  interface Window {
    FlutterwaveCheckout?: (opts: Record<string, unknown>) => void;
  }
}

async function loadFlutterwaveScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.FlutterwaveCheckout) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Flutterwave"));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const { user, token, register } = useCustomer();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    note: "",
    // Used only when there's no session — we create the account
    // inline as part of the checkout submit so the flow stays
    // single-page and the resulting order is linked to a real user.
    password: "",
  });
  // True when the inline submit hit "email already exists". We swap
  // the error for a friendlier CTA pointing the buyer at /signin.
  const [emailTaken, setEmailTaken] = useState(false);
  const [gateway, setGateway] = useState<Gateway>("flutterwave");
  const [currency, setCurrency] = useState<Currency>("USD");

  // Sifalo only supports USD. Force USD whenever it's selected.
  useEffect(() => {
    if (gateway === "sifalo" && currency !== "USD") setCurrency("USD");
  }, [gateway, currency]);

  // Pre-fill the customer's details once their session resolves.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || user.name,
        customerEmail: f.customerEmail || user.email,
      }));
    }
  }, [user]);

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [applyCredit, setApplyCredit] = useState(0);
  const [creditBalance, setCreditBalance] = useState<number | undefined>(undefined);

  // Look up the user's store credit balance once their session resolves.
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/account/credit`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCreditBalance(d.balanceCents))
      .catch(() => undefined);
  }, [token]);

  // If the cart subtotal changes after a coupon was applied, re-validate
  // by clearing it — easiest way to keep amounts honest.
  useEffect(() => {
    setCoupon(null);
  }, [totalCents]);

  // Recompute price breakdown for the summary panel.
  const afterCoupon = Math.max(0, totalCents - (coupon?.discountCents || 0));
  const effectiveCredit = Math.min(applyCredit, afterCoupon, creditBalance ?? 0);
  const dueCents = Math.max(0, afterCoupon - effectiveCredit);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setEmailTaken(false);
    try {
      // 0. If no session, create the account inline first so the
      //    resulting order is owned by a real user (and digital
      //    downloads, order emails, etc. are linkable).
      let effectiveToken = token;
      if (!effectiveToken) {
        if (form.password.length < 8) {
          throw new Error("Please choose a password of at least 8 characters.");
        }
        try {
          const result = await register(
            form.customerName,
            form.customerEmail,
            form.password,
            undefined,
            "checkout",
          );
          effectiveToken = result.token;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Could not create your account";
          // The backend returns "an account with that email already exists"
          // on duplicate emails — swap our error for a sign-in CTA.
          if (msg.toLowerCase().includes("already exists")) {
            setEmailTaken(true);
            throw new Error(
              "An account with that email already exists. Please sign in to continue.",
            );
          }
          throw new Error(msg);
        }
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (effectiveToken) headers["Authorization"] = `Bearer ${effectiveToken}`;

      // 1. Create the order.
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          couponCode: coupon?.code || "",
          applyCreditCents: effectiveCredit,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place your order");
      setOrderId(data.id);

      // 2. Ask the backend to prepare a payment session.
      const payRes = await fetch(
        `${API_URL}/api/orders/${data.id}/pay?gateway=${gateway}&currency=${currency}`,
        { method: "POST", headers },
      );
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || "Could not start payment");
      }

      // 3. Hand off to the chosen gateway.
      if (payData.mode === "redirect" && payData.paymentUrl) {
        clear();
        window.location.href = payData.paymentUrl;
        return;
      }
      if (payData.mode === "inline" && payData.gateway === "flutterwave") {
        await loadFlutterwaveScript();
        if (!window.FlutterwaveCheckout) {
          throw new Error("Flutterwave did not load — check your connection.");
        }
        clear();
        window.FlutterwaveCheckout({
          public_key: payData.publicKey,
          tx_ref: payData.txRef,
          amount: Number(payData.amount),
          currency: payData.currency,
          payment_options: "card,mobilemoney,ussd,banktransfer",
          redirect_url: payData.redirectUrl,
          customer: {
            email: payData.customer.email,
            name: payData.customer.name,
            phone_number: payData.customer.phone,
          },
          customizations: {
            title: payData.title,
            description: payData.description,
          },
          meta: payData.meta,
        });
        // After FlutterwaveCheckout(), the user is taken to a Flutterwave page
        // (with redirect_url, which brings them back to /payment/complete).
        return;
      }

      // Fallback if nothing matched: surface a confirmation page.
      setStatus("done");
      clear();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-10">
          <p className="text-2xl font-semibold text-brand-700">
            Order received
          </p>
          <p className="mt-2 text-sm text-brand-700/80">
            Thank you! Your order{orderId ? ` #${orderId}` : ""} has been placed.
            Our team will be in touch to confirm payment and delivery.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add a few products to the cart before checking out."
          action={{ href: "/shop", label: "Browse the shop" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        After placing your order you&apos;ll be sent to the payment provider to
        complete the transaction securely.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-ink/10 bg-white p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Your details
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink/70">
                Full name
              </label>
              <input
                required
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Email</label>
              <input
                type="email"
                required
                value={form.customerEmail}
                onChange={(e) => set("customerEmail", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Phone</label>
              <input
                value={form.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value)}
                className={inputClass}
              />
            </div>
            {!user && (
              <div>
                <label className="text-sm font-medium text-ink/70">
                  Choose a password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-ink/55">
                  We&apos;ll create an account so you can track your order,
                  download digital purchases, and check out faster next time.
                  Already have one?{" "}
                  <Link
                    href={`/signin?next=/checkout`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    Sign in instead
                  </Link>
                  .
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-ink/70">
                Order note (optional)
              </label>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-brand-500">
            Payment method
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {GATEWAYS.map((g) => {
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

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand-500">
            Currency
          </h2>
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
                  title={
                    disabled ? "Sifalo Pay only supports USD" : undefined
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
          {gateway === "sifalo" && (
            <p className="mt-2 text-xs text-ink/45">
              Sifalo Pay only accepts USD; KES totals are converted at the
              configured rate.
            </p>
          )}

          {status === "error" && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p>{error}</p>
              {emailTaken && (
                <p className="mt-1">
                  <Link
                    href={`/signin?next=/checkout`}
                    className="font-semibold underline"
                  >
                    Sign in →
                  </Link>
                </p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {status === "loading" && <Spinner size="sm" />}
            {status === "loading"
              ? "Placing order…"
              : `Continue to ${
                  gateway === "sifalo" ? "Sifalo Pay" : "Flutterwave"
                }`}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Order summary
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="text-ink/70">
                  {i.name} × {i.quantity}
                </span>
                <span className="text-ink">
                  {formatPrice(i.priceCents * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <CheckoutExtras
            scope="shop"
            subtotalCents={totalCents}
            token={token}
            applied={coupon}
            onApply={setCoupon}
            onRemove={() => setCoupon(null)}
            creditBalanceCents={creditBalance}
            applyCreditCents={effectiveCredit}
            onCreditChange={setApplyCredit}
          />

          <dl className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink/65">
              <dt>Subtotal</dt>
              <dd>{formatPrice(totalCents)}</dd>
            </div>
            {coupon && (
              <div className="flex justify-between text-emerald-700">
                <dt>Coupon ({coupon.code})</dt>
                <dd>−{formatPrice(coupon.discountCents)}</dd>
              </div>
            )}
            {effectiveCredit > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Store credit</dt>
                <dd>−{formatPrice(effectiveCredit)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-semibold text-ink">
              <dt>Total due</dt>
              <dd>{formatPrice(dueCents)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink/45">
            You&apos;ll be charged in {currency}
            {currency === "USD" && " (converted from KES at checkout)"}.
          </p>
        </aside>
      </div>
    </div>
  );
}
