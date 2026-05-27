"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/api";
import { customerFetch } from "@/lib/customer";

// AppliedCoupon is what the parent gets back after a successful validate.
export interface AppliedCoupon {
  code: string;
  discountCents: number;
  scope: string;
}

interface Props {
  // Scope must be one of 'shop' | 'courses' | 'memberships' so the
  // backend can reject coupons targeting a different stream.
  scope: "shop" | "courses" | "memberships";
  // Pre-discount subtotal in cents. Required for validation server-side.
  subtotalCents: number;
  applied: AppliedCoupon | null;
  onApply: (a: AppliedCoupon) => void;
  onRemove: () => void;
  // Store credit support (optional — pass when the customer is signed in).
  creditBalanceCents?: number;
  applyCreditCents: number;
  onCreditChange: (cents: number) => void;
}

// CheckoutExtras renders the two universal "money off" widgets we want on
// every checkout: a coupon-code input and a store-credit toggle. The parent
// stays in charge of submitting the order, so this component only manages
// its own input + flash state.
export default function CheckoutExtras({
  scope,
  subtotalCents,
  applied,
  onApply,
  onRemove,
  creditBalanceCents,
  applyCreditCents,
  onCreditChange,
}: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // If the subtotal drops below what the coupon needs, force a re-validate
  // on the next apply attempt; we don't auto-revalidate here so a quick
  // edit doesn't yank the discount mid-flow.
  useEffect(() => {
    setErr("");
  }, [subtotalCents]);

  const apply = async () => {
    setBusy(true);
    setErr("");
    try {
      const res = await customerFetch(`/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          scope,
          subtotalCents,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon");
      onApply({
        code: data.code,
        discountCents: data.discountCents,
        scope: data.scope,
      });
      setCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not apply coupon");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {applied ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm">
          <span>
            <span className="font-mono font-semibold text-emerald-800">
              {applied.code}
            </span>
            <span className="ml-2 text-ink/65">
              −{formatPrice(applied.discountCents)}
            </span>
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-ink/45">
            Coupon code
          </label>
          <div className="mt-1 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (code.trim()) apply();
                }
              }}
              placeholder="e.g. WELCOME10"
              className="flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-brand-500"
            />
            <button
              type="button"
              disabled={!code.trim() || busy}
              onClick={apply}
              className="rounded-full border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
            >
              {busy ? "Checking…" : "Apply"}
            </button>
          </div>
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
        </div>
      )}

      {creditBalanceCents !== undefined && creditBalanceCents > 0 && (
        <label className="flex items-center justify-between gap-3 rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applyCreditCents > 0}
              onChange={(e) =>
                onCreditChange(e.target.checked ? creditBalanceCents : 0)
              }
            />
            <span>
              Apply store credit{" "}
              <span className="text-ink/55">
                (you have {formatPrice(creditBalanceCents)})
              </span>
            </span>
          </span>
          {applyCreditCents > 0 && (
            <span className="text-xs font-semibold text-emerald-700">
              −{formatPrice(applyCreditCents)}
            </span>
          )}
        </label>
      )}
    </div>
  );
}
