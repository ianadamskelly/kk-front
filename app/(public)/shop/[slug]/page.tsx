import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchProduct,
  fetchProducts,
  fetchPosts,
  formatPrice,
} from "@/lib/api";
import AddToCartButton from "@/components/AddToCartButton";
import ContentHTML from "@/components/ContentHTML";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedRail from "@/components/RelatedRail";
import ProductGallery from "@/components/ProductGallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  return {
    title: product?.name ?? "Product not found",
    description: product?.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const [all, posts] = await Promise.all([
    fetchProducts({}),
    fetchPosts({ perPage: 24 }),
  ]);
  const cat = (product.category || "").toLowerCase();
  const related = all
    .filter((p) => p.slug !== product.slug && cat && p.category?.toLowerCase() === cat)
    .slice(0, 4);
  // Surface a couple of related posts so the visitor has somewhere to
  // go after browsing.
  const relatedPosts = cat
    ? posts.posts.filter((p) => p.categoryName?.toLowerCase() === cat).slice(0, 3)
    : [];

  return (
    <div className="space-y-20 pb-8">
      <section className="mx-auto max-w-5xl px-4 pt-16 sm:pt-20">
        <Breadcrumbs
          items={[
            { href: "/shop", label: "Shop" },
            ...(product.category
              ? [
                  {
                    href: `/shop?category=${encodeURIComponent(product.category)}`,
                    label: product.category,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <ProductGallery product={product} />


          <div>
            {product.category && (
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                {product.category}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-ink">
              {formatPrice(product.priceCents)}
            </p>
            {product.description && (
              <p className="mt-4 text-ink/70">{product.description}</p>
            )}
            {product.body && <ContentHTML html={product.body} className="mt-4" />}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AddToCartButton product={product} size="lg" />
              <Link
                href="/cart"
                className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
              >
                View cart
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink/45">
              Checkout places an order request — our team confirms payment and
              delivery with you directly.
            </p>
          </div>
        </div>
      </section>

      <RelatedRail
        products={related}
        posts={relatedPosts}
        contextCategory={product.category}
      />
    </div>
  );
}
