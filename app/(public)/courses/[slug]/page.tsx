import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCourse,
  fetchCourses,
  fetchPosts,
  imageUrl,
  formatPrice,
} from "@/lib/api";
import { CurriculumGate } from "@/components/CourseGate";
import CTASection from "@/components/CTASection";
import ContentHTML from "@/components/ContentHTML";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedRail from "@/components/RelatedRail";
import Reviews from "@/components/Reviews";
import ResourceList from "@/components/ResourceList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  return {
    title: course?.title ?? "Course not found",
    description: course?.summary,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) notFound();

  const lessons = course.lessons || [];
  const firstLesson = lessons[0];

  // Related: courses in the same category, plus insights tagged with
  // that category. Filtered client-side from existing endpoints.
  const [allCourses, allPosts] = await Promise.all([
    fetchCourses(),
    fetchPosts({ perPage: 24 }),
  ]);
  const cat = (course.category || "").toLowerCase();
  const relatedCourses = allCourses
    .filter((c) => c.id !== course.id && (cat ? c.category?.toLowerCase() === cat : c.level === course.level))
    .slice(0, 3);
  const relatedPosts = cat
    ? allPosts.posts.filter((p) => p.categoryName?.toLowerCase() === cat).slice(0, 3)
    : [];

  return (
    <div className="space-y-20 pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <Breadcrumbs
          items={[
            { href: "/courses", label: "Courses" },
            { label: course.title },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-500">
              <span>{course.level}</span>
              {course.duration && (
                <span className="text-ink/40">· {course.duration}</span>
              )}
              <span className="text-ink/40">
                · {course.priceCents > 0 ? formatPrice(course.priceCents) : "Free"}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {course.title}
            </h1>
            {course.summary && (
              <p className="mt-4 text-lg text-ink/70">{course.summary}</p>
            )}
            {course.instructor && (
              <p className="mt-3 text-sm text-ink/55">
                Taught by{" "}
                <span className="font-medium text-ink">
                  {course.instructor}
                </span>
              </p>
            )}
            {firstLesson && (
              <Link
                href={`/courses/${course.slug}/${firstLesson.slug}`}
                className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Start learning
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <div className="aspect-[16/10] w-full bg-ink/5">
              {course.coverImage ? (
                <img
                  src={imageUrl(course.coverImage)}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
                  <span className="text-5xl font-semibold text-brand-300">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {course.description && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              About this course
            </h2>
            <ContentHTML html={course.description} className="mt-3" />
          </div>
        )}

        <div className="mt-12 max-w-3xl">
          <CurriculumGate initialCourse={course} />
        </div>

        {course.resources && course.resources.length > 0 && (
          <div className="mt-12 max-w-3xl">
            <ResourceList
              title="Course resources"
              resources={course.resources}
            />
          </div>
        )}

        <div className="mt-16">
          <Reviews
            entityType="course"
            entitySlug={course.slug}
            entityId={course.id}
          />
        </div>
      </section>

      <RelatedRail
        courses={relatedCourses}
        posts={relatedPosts}
        contextCategory={course.category || course.level}
      />

      <CTASection
        title="Need a custom training for your team?"
        description="We run tailored workshops on branding, design, and digital strategy."
      />
    </div>
  );
}
