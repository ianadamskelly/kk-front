// Shared client-side payment helpers used by the cart checkout, membership
// checkout, and per-course checkout flows. All three create an order first
// then call /api/orders/{id}/pay to hand off to Flutterwave or Sifalo.

import { customerFetch } from "./customer";

export type Gateway = "flutterwave" | "sifalo";
export type Currency = "USD" | "KES";

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

// payForOrder kicks off the gateway flow for an already-created order. On
// success the browser is navigated to the gateway page; control never
// returns. On failure throws an Error with a user-readable message.
// Auth rides the HttpOnly session cookie via customerFetch.
export async function payForOrder(
  orderId: number,
  gateway: Gateway,
  currency: Currency,
): Promise<void> {
  const res = await customerFetch(
    `/api/orders/${orderId}/pay?gateway=${gateway}&currency=${currency}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not start payment");

  if (data.mode === "redirect" && data.paymentUrl) {
    window.location.href = data.paymentUrl;
    return;
  }
  if (data.mode === "inline" && data.gateway === "flutterwave") {
    await loadFlutterwaveScript();
    if (!window.FlutterwaveCheckout) {
      throw new Error("Flutterwave did not load — check your connection.");
    }
    window.FlutterwaveCheckout({
      public_key: data.publicKey,
      tx_ref: data.txRef,
      amount: Number(data.amount),
      currency: data.currency,
      payment_options: "card,mobilemoney,ussd,banktransfer",
      redirect_url: data.redirectUrl,
      customer: {
        email: data.customer.email,
        name: data.customer.name,
        phone_number: data.customer.phone,
      },
      customizations: {
        title: data.title,
        description: data.description,
      },
      meta: data.meta,
    });
    return;
  }
  throw new Error("Unsupported payment response");
}
