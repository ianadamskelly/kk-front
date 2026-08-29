import type { Metadata } from "next";
import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Merchandise and digital resources from Kuza Kizazi — designed to help your brand grow.",
  alternates: { canonical: "/shop" },
};

function chipClass(active: boolean): string {
  return `rounded-full border px-4 py-1.5 text-sm transition ${
    active
      ? "border-brand-500 bg-brand-500 text-white"
      : "border-ink/15 text-ink/60 hover:border-brand-400 hover:text-ink"
  }`;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  const [products, all] = await Promise.all([
    fetchProducts({ q, category }),
    fetchProducts({}),
  ]);
  const categories = [
    ...new Set(all.map((p) => p.category).filter(Boolean)),
  ].sort();

  const buildQuery = (cat: string): string => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Shop"
          title="Tools to help your brand grow"
          description="Physical merchandise and digital resources, made with the same care as our client work."
        />

        <div className="mt-8 flex flex-col gap-4">
          <form action="/shop" method="get" className="flex gap-2">
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              className="w-full rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/85"
            >
              Search
            </button>
          </form>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link href={buildQuery("")} className={chipClass(!category)}>
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={buildQuery(c)}
                  className={chipClass(category === c)}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={q || category ? "🔍" : "🛍️"}
            title={
              q || category
                ? "No products match your filters"
                : "The shop is being stocked"
            }
            description={
              q || category
                ? "Try clearing the filters or searching for something else."
                : "New products will appear here soon. Check back shortly."
            }
            action={
              q || category ? { href: "/shop", label: "Clear filters" } : undefined
            }
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <FadeIn key={p.id} delay={Math.min(i, 5) * 40}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
