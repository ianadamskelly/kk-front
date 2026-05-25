"use client";

import { useState } from "react";
import { Product } from "@/lib/api";
import { useCart } from "@/lib/cart";

export default function AddToCartButton({
  product,
  size = "sm",
}: {
  product: Product;
  size?: "sm" | "lg";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const click = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const cls =
    size === "lg"
      ? "rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
      : "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/85";

  return (
    <button type="button" onClick={click} className={cls}>
      {added ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
