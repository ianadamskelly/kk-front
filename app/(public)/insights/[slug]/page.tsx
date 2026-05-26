import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchPost,
  fetchPosts,
  fetchCourses,
  fetchProducts,
  imageUrl,
  formatDate,
  SITE_NAME,
  SITE_URL,
} from "@/lib/api";
import { estimateReadTime } from "@/lib/readtime";
import ShareButtons from "@/components/ShareButtons";
import Comments from "@/components/Comments";
import ContentHTML from "@/components/ContentHTML";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import RelatedRail from "@/components/RelatedRail";
import JsonLd from "@/components/JsonLd";
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
} from "@/components/icons/BrandIcons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) {
    return { title: "Insight not found" };
  }
  const canonical = `/insights/${post.slug}`;
  const og = post.coverImage ? imageUrl(post.coverImage) : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonical,
      images: og ? [{ url: og }] : undefined,
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: og ? [og] : undefined,
    },
  };
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  const date = post.publishedAt || post.createdAt;
  const readTime = estimateReadTime(post.content || post.excerpt);

  // Pull related content in parallel. The filter by category is done
  // client-side from a wider fetch so we don't need a new API endpoint.
  const [allPosts, courses, products] = await Promise.all([
    fetchPosts({ perPage: 24 }),
    fetchCourses(),
    fetchProducts(),
  ]);
  const cat = (post.categoryName || "").toLowerCase();
  const relatedPosts = allPosts.posts
    .filter((p) => p.id !== post.id && (cat ? p.categoryName?.toLowerCase() === cat : true))
    .slice(0, 3);
  const relatedCourses = cat
    ? courses
        .filter((c) => c.category && c.category.toLowerCase() === cat)
        .slice(0, 3)
    : [];
  const relatedProducts = cat
    ? products
        .filter((p) => p.category && p.category.toLowerCase() === cat)
        .slice(0, 4)
    : [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/insights/${post.slug}` },
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage ? imageUrl(post.coverImage) : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <ReadingProgressBar />

      <article className="mx-auto max-w-3xl px-4 py-12">
        <Breadcrumbs
          items={[
            { href: "/insights", label: "Insights" },
            ...(post.categoryName
              ? [
                  {
                    href: `/insights?category=${encodeURIComponent(post.categorySlug || post.categoryName)}`,
                    label: post.categoryName,
                  },
                ]
              : []),
            { label: post.title },
          ]}
        />

        <header className="mt-6">
          {post.categoryName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-600">
              <TagIcon className="h-3 w-3" />
              {post.categoryName}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>

          <AuthorBlock
            authorName={post.authorName}
            date={date}
            readTime={readTime}
          />
        </header>

        {post.coverImage && (
          <img
            src={imageUrl(post.coverImage)}
            alt={post.title}
            className="mt-8 w-full rounded-2xl object-cover"
          />
        )}

        {post.excerpt && (
          <p className="mt-8 border-l-2 border-brand-500 pl-4 text-lg font-medium leading-relaxed text-ink/75">
            {post.excerpt}
          </p>
        )}

        <ContentHTML html={post.content} className="mt-8" />

        <div className="mt-10 border-t border-ink/10 pt-6">
          <ShareButtons title={post.title} />
        </div>

        <Comments slug={post.slug} />
      </article>

      {/* Read next — related posts / courses / products by category */}
      <RelatedRail
        posts={relatedPosts}
        courses={relatedCourses}
        products={relatedProducts}
        contextCategory={post.categoryName}
      />
    </>
  );
}

// AuthorBlock renders an avatar (initial-in-circle when no image),
// author name, publish date and read-time pill — clean header strip
// that signals authority and effort up front.
function AuthorBlock({
  authorName,
  date,
  readTime,
}: {
  authorName: string;
  date: string;
  readTime: string;
}) {
  const initial = (authorName?.charAt(0) || "K").toUpperCase();
  return (
    <div className="mt-6 flex items-center gap-3 text-sm">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white"
      >
        {initial}
      </span>
      <div className="leading-tight">
        {authorName && (
          <p className="font-semibold text-ink">{authorName}</p>
        )}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink/50">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon />
            <time dateTime={date}>{formatDate(date)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            {readTime}
          </span>
        </p>
      </div>
    </div>
  );
}
