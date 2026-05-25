"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { imageUrl, formatPrice } from "@/lib/api";
import EmptyState from "@/components/EmptyState";

export default function CartPage() {
  const { items, totalCents, setQuantity, remove } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your cart
      </h1>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon="🛒"
          title="Your cart is empty"
          description="Nothing in here yet. Browse the shop and add a few favourites."
          action={{ href: "/shop", label: "Browse the shop" }}
        />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-ink/[0.08] rounded-2xl border border-ink/10 bg-white">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4">
                <Link
                  href={`/shop/${item.slug}`}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/5"
                >
                  {item.image ? (
                    <img
                      src={imageUrl(item.image)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-brand-300">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="font-medium text-ink hover:text-brand-600"
                  >
                    {item.name}
                  </Link>
                  <span className="text-sm text-ink/55">
                    {formatPrice(item.priceCents)} each
                  </span>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <div className="flex items-center rounded-full border border-ink/15">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                        className="px-3 py-1 text-ink/60 hover:text-ink"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                        className="px-3 py-1 text-ink/60 hover:text-ink"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="text-sm text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-ink">
                  {formatPrice(item.priceCents * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Summary
            </h2>
            <div className="mt-4 flex items-center justify-between text-sm text-ink/70">
              <span>Subtotal</span>
              <span className="text-lg font-semibold text-ink">
                {formatPrice(totalCents)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block rounded-full bg-brand-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/shop"
              className="mt-2 block text-center text-sm text-ink/55 hover:text-brand-600"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
