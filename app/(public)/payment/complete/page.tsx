"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_URL, formatPrice } from "@/lib/api";
import { LoadingBlock } from "@/components/Spinner";

interface PaymentState {
  id: number;
  orderId: number;
  status: string;
  amountCents: number;
  currency: string;
}

function PaymentResult() {
  const params = useSearchParams();
  // Flutterwave returns "?tx_ref=…&status=…"; Sifalo returns
  // "?gateway=sifalo&order_id=…&sid=…". Use whichever is present.
  const txRef = params.get("tx_ref") || params.get("order_id") || "";
  const sid = params.get("sid") || "";
  const flwStatus = params.get("status") || "";

  const [state, setState] = useState<
    "loading" | "success" | "failed" | "cancelled" | "pending"
  >(flwStatus === "cancelled" ? "cancelled" : "loading");
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!txRef) {
      setState("failed");
      setMessage("Missing transaction reference.");
      return;
    }
    if (flwStatus === "cancelled") {
      setMessage(
        "You cancelled the payment. Your order is still pending and you can retry from your account.",
      );
      return;
    }
    const qs = new URLSearchParams({ tx_ref: txRef });
    if (sid) qs.set("sid", sid);
    fetch(`${API_URL}/api/payments/verify?${qs.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not verify payment");
        setPayment({
          id: data.id,
          orderId: data.orderId,
          status: data.status,
          amountCents: data.amountCents,
          currency: data.currency,
        });
        if (data.status === "successful") setState("success");
        else if (data.status === "failed" || data.status === "cancelled")
          setState(data.status);
        else setState("pending");
      })
      .catch((err) => {
        setState("failed");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [txRef, sid, flwStatus]);

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-10">
        <p className="text-lg font-semibold text-ink">Verifying your payment…</p>
        <p className="mt-2 text-sm text-ink/55">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-10">
        <p className="text-2xl font-semibold text-brand-700">Payment received</p>
        <p className="mt-2 text-sm text-brand-700/80">
          Thank you! Your payment of{" "}
          {payment ? formatPrice(payment.amountCents) : "your order"} has been
          received and your order is now confirmed.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/account/orders"
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            View your orders
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-10">
      <p className="text-2xl font-semibold text-ink">
        {state === "cancelled"
          ? "Payment cancelled"
          : state === "failed"
            ? "Payment didn't go through"
            : "Payment still processing"}
      </p>
      <p className="mt-2 text-sm text-ink/65">
        {message ||
          (state === "pending"
            ? "Your payment is still being processed. Check your orders in a moment."
            : "Your order is still saved as pending — you can retry payment any time.")}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/account/orders"
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/85"
        >
          View your orders
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink/70 hover:bg-ink/5"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Suspense
        fallback={
          <div className="rounded-2xl border border-ink/10 bg-white p-10">
            <LoadingBlock label="Verifying your payment…" />
          </div>
        }
      >
        <PaymentResult />
      </Suspense>
    </div>
  );
}
