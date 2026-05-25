import type { Metadata } from "next";
import Link from "next/link";
import { fetchPosts, fetchCategories } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import PostCard from "@/components/PostCard";
import NewsletterForm from "@/components/NewsletterForm";
import EmptyState from "@/components/EmptyState";
import InsightsSearch from "@/components/InsightsSearch";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Deep-dives on design, strategy, and technology from the Kuza Kizazi team.",
};

function chipClass(active: boolean): string {
  return `rounded-full border px-4 py-1.5 text-sm transition ${
    active
      ? "border-brand-500 bg-brand-500 text-white"
      : "border-ink/15 text-ink/60 hover:border-brand-400 hover:text-ink"
  }`;
}

const pageBtn =
  "rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink/70 hover:border-brand-400";
const pageBtnOff =
  "rounded-full border border-ink/10 px-4 py-1.5 text-sm text-ink/25";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const page =
    typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const [list, categories] = await Promise.all([
    fetchPosts({ q, category, page, perPage: 9 }),
    fetchCategories(),
  ]);

  const buildQuery = (
    overrides: Record<string, string | number | undefined>,
  ): string => {
    const merged = { q, category, page, ...overrides };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", String(merged.q));
    if (merged.category) params.set("category", String(merged.category));
    if (merged.page && Number(merged.page) > 1)
      params.set("page", String(merged.page));
    const s = params.toString();
    return s ? `/insights?${s}` : "/insights";
  };

  return (
    <div className="space-y-16 pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Insights"
          title="Ideas, strategy & craft"
          description="Practical thinking on design, technology, and building brands that last."
        />

        <div className="mt-8 flex flex-col gap-4">
          <InsightsSearch />

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildQuery({ category: "", page: 1 })}
              className={chipClass(!category)}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={buildQuery({ category: c.slug, page: 1 })}
                className={chipClass(category === c.slug)}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {q && (
          <p className="mt-6 text-sm text-ink/50">
            {list.total} result{list.total === 1 ? "" : "s"} for{" "}
            <span className="font-medium text-ink/80">&ldquo;{q}&rdquo;</span>
          </p>
        )}

        {list.posts.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={q || category ? "🔍" : "📰"}
            title={
              q || category
                ? "No insights match your filters"
                : "Nothing here yet"
            }
            description={
              q || category
                ? "Try a different keyword or clear the category filter."
                : "Fresh insights are on the way. Check back soon or subscribe to the newsletter below."
            }
            action={
              q || category
                ? { href: "/insights", label: "Clear filters" }
                : undefined
            }
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {list.pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-4">
            {page > 1 ? (
              <Link href={buildQuery({ page: page - 1 })} className={pageBtn}>
                ← Previous
              </Link>
            ) : (
              <span className={pageBtnOff}>← Previous</span>
            )}
            <span className="text-sm text-ink/50">
              Page {list.page} of {list.pages}
            </span>
            {page < list.pages ? (
              <Link href={buildQuery({ page: page + 1 })} className={pageBtn}>
                Next →
              </Link>
            ) : (
              <span className={pageBtnOff}>Next →</span>
            )}
          </nav>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-ink p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
              Get our insights in your inbox
            </h2>
            <p className="mt-3 text-cream/70">
              Join digital leaders receiving our deep-dives on design, strategy,
              and technology.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
