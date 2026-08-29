import type { Metadata } from "next";
import Link from "next/link";
import { fetchCourses } from "@/lib/api";
import SectionHeading from "@/components/SectionHeading";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Learn design, branding, and web skills at your own pace with courses from the Kuza Kizazi team.",
  alternates: { canonical: "/courses" },
};

function filterLinkClass(active: boolean): string {
  return `block rounded-lg px-3 py-1.5 text-sm transition ${
    active
      ? "bg-brand-50 font-semibold text-brand-700"
      : "text-ink/65 hover:bg-ink/[0.04] hover:text-ink"
  }`;
}

type PriceTier = "" | "free" | "paid";

function priceTierOf(priceCents: number): PriceTier {
  return priceCents > 0 ? "paid" : "free";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const level = typeof sp.level === "string" ? sp.level : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const price = (typeof sp.price === "string" ? sp.price : "") as PriceTier;

  const courses = await fetchCourses();
  const levels = [...new Set(courses.map((c) => c.level).filter(Boolean))];
  const categories = [
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];
  const filtered = courses.filter((c) => {
    if (level && c.level !== level) return false;
    if (category && c.category !== category) return false;
    if (price && priceTierOf(c.priceCents) !== price) return false;
    return true;
  });

  // Build query strings that preserve the other filters as you change one.
  const buildHref = (
    overrides: Partial<{ level: string; category: string; price: string }>,
  ): string => {
    const merged = { level, category, price, ...overrides };
    const params = new URLSearchParams();
    if (merged.level) params.set("level", merged.level);
    if (merged.category) params.set("category", merged.category);
    if (merged.price) params.set("price", merged.price);
    const s = params.toString();
    return s ? `/courses?${s}` : "/courses";
  };

  const hasAnyFilter = !!(level || category || price);

  return (
    <div className="pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Learn"
          title="Master new skills with our courses"
          description="Practical, project-based courses on design, branding, and building for the web — learn at your own pace from people who do this every day."
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Left filter rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink/10 bg-white p-4">
              {hasAnyFilter && (
                <Link
                  href="/courses"
                  className="mb-3 inline-flex items-center text-xs font-semibold text-brand-600 hover:underline"
                >
                  ← Clear all filters
                </Link>
              )}

              {levels.length > 0 && (
                <div className="mb-4">
                  <p className="px-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
                    Level
                  </p>
                  <div className="mt-1 flex flex-col">
                    <Link
                      href={buildHref({ level: "" })}
                      className={filterLinkClass(!level)}
                    >
                      Any level
                    </Link>
                    {levels.map((l) => (
                      <Link
                        key={l}
                        href={buildHref({ level: l })}
                        className={filterLinkClass(level === l)}
                      >
                        {l}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div className="mb-4">
                  <p className="px-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
                    Category
                  </p>
                  <div className="mt-1 flex flex-col">
                    <Link
                      href={buildHref({ category: "" })}
                      className={filterLinkClass(!category)}
                    >
                      All categories
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c}
                        href={buildHref({ category: c })}
                        className={filterLinkClass(category === c)}
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-widest text-ink/40">
                  Price
                </p>
                <div className="mt-1 flex flex-col">
                  <Link
                    href={buildHref({ price: "" })}
                    className={filterLinkClass(!price)}
                  >
                    Any
                  </Link>
                  <Link
                    href={buildHref({ price: "free" })}
                    className={filterLinkClass(price === "free")}
                  >
                    Free
                  </Link>
                  <Link
                    href={buildHref({ price: "paid" })}
                    className={filterLinkClass(price === "paid")}
                  >
                    Paid
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 text-xs text-ink/60">
              Looking for quick references and templates?{" "}
              <Link
                href="/library"
                className="font-semibold text-brand-600 hover:underline"
              >
                Resource library →
              </Link>
            </div>
          </aside>

          {/* Course grid */}
          <div>
            {filtered.length === 0 ? (
              <EmptyState
                icon={hasAnyFilter ? "🔍" : "🎓"}
                title={
                  hasAnyFilter
                    ? "No courses match these filters"
                    : "Courses coming soon"
                }
                description={
                  hasAnyFilter
                    ? "Try widening one of the filters on the left."
                    : "New courses are on the way. Subscribe to the newsletter to hear about them first."
                }
                action={
                  hasAnyFilter
                    ? { href: "/courses", label: "Clear filters" }
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c, i) => (
                  <FadeIn key={c.id} delay={Math.min(i, 5) * 40}>
                    <CourseCard course={c} />
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
