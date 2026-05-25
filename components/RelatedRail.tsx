import Link from "next/link";
import {
  type Course,
  type Post,
  type Product,
  formatPrice,
} from "@/lib/api";
import PostCard from "./PostCard";
import CourseCard from "./CourseCard";
import ProductCard from "./ProductCard";

// RelatedRail renders the "what next" block beneath blog posts.
// Each sub-rail (posts / courses / products) only appears if it has
// items, so a post in an obscure category degrades gracefully.

interface Props {
  posts?: Post[];
  courses?: Course[];
  products?: Product[];
  contextCategory?: string;
}

export default function RelatedRail({
  posts = [],
  courses = [],
  products = [],
  contextCategory,
}: Props) {
  const hasAnything =
    posts.length > 0 || courses.length > 0 || products.length > 0;
  if (!hasAnything) return null;

  return (
    <section className="bg-ink/[0.02] py-16">
      <div className="mx-auto max-w-6xl space-y-12 px-4">
        {posts.length > 0 && (
          <Block
            title="Keep reading"
            description={
              contextCategory
                ? `More from ${contextCategory}`
                : "More from the journal"
            }
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Block>
        )}

        {courses.length > 0 && (
          <Block
            title="Go deeper"
            description="Courses on this topic"
            link={{ href: "/courses", label: "All courses →" }}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </Block>
        )}

        {products.length > 0 && (
          <Block
            title="Tools you can use"
            description="Products from the shop"
            link={{ href: "/shop", label: "Visit the shop →" }}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Block>
        )}
      </div>
    </section>
  );
}

function Block({
  title,
  description,
  link,
  children,
}: {
  title: string;
  description?: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-ink/55">{description}</p>
          )}
        </div>
        {link && (
          <Link
            href={link.href}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// formatPrice is re-exported in case future variants of the rail want to
// render simpler price tags inline. Keeps the import surface tidy.
export { formatPrice };
