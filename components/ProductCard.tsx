import Link from "next/link";
import { Product, imageUrl, formatPrice } from "@/lib/api";
import AddToCartButton from "./AddToCartButton";

// Products created in the last `NEW_DAYS` show a NEW chip in the top
// corner. Pure presentational — no DB flag needed.
const NEW_DAYS = 14;

function isNew(createdAt: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const cutoff = Date.now() - NEW_DAYS * 24 * 60 * 60 * 1000;
  return created >= cutoff;
}

export default function ProductCard({ product }: { product: Product }) {
  const href = `/shop/${product.slug}`;
  const fresh = isNew(product.createdAt);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={href} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-ink/5">
          {product.image ? (
            <img
              src={imageUrl(product.image)}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
              <span className="text-4xl font-semibold text-brand-300">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {fresh && (
            <span className="absolute right-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
              New
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-5">
        {product.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {product.category}
          </span>
        )}
        <h3 className="text-base font-semibold leading-snug text-ink">
          <Link href={href} className="hover:text-brand-600">
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-ink/60">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-semibold text-ink">
            {formatPrice(product.priceCents)}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
