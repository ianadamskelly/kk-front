"use client";

import { useState } from "react";
import { imageUrl, type Product, type ProductImage } from "@/lib/api";

interface Props {
  product: Product;
}

// ProductGallery renders the product's image set as a main image with
// a thumbnail strip. Falls back to the single `product.image` for
// products that pre-date the gallery, and to a coloured initial when
// there are no images at all.
export default function ProductGallery({ product }: Props) {
  // Build the gallery list: prefer the full images array; fall back to
  // a synthetic single-entry list from product.image; empty otherwise.
  const gallery: ProductImage[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [
            {
              id: 0,
              productId: product.id,
              url: product.image,
              position: 0,
              isCover: true,
              createdAt: "",
            },
          ]
        : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const active = gallery[activeIdx];

  if (gallery.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
          <span className="text-6xl font-semibold text-brand-300">
            {product.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="aspect-square w-full bg-ink/5">
          <img
            src={imageUrl(active.url)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      {gallery.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {gallery.map((img, idx) => (
            <li key={img.id || img.url}>
              <button
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Show image ${idx + 1} of ${gallery.length}`}
                className={`overflow-hidden rounded-lg border transition ${
                  idx === activeIdx
                    ? "border-brand-500 ring-2 ring-brand-200"
                    : "border-ink/10 hover:border-ink/30"
                }`}
              >
                <img
                  src={imageUrl(img.url)}
                  alt=""
                  className="h-16 w-16 object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
