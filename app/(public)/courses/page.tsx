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
};

function chipClass(active: boolean): string {
  return `rounded-full border px-4 py-1.5 text-sm transition ${
    active
      ? "border-brand-500 bg-brand-500 text-white"
      : "border-ink/15 text-ink/60 hover:border-brand-400 hover:text-ink"
  }`;
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const level = typeof sp.level === "string" ? sp.level : "";

  const courses = await fetchCourses();
  const levels = [...new Set(courses.map((c) => c.level).filter(Boolean))];
  const filtered = level
    ? courses.filter((c) => c.level === level)
    : courses;

  return (
    <div className="pb-8">
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Learn"
          title="Master new skills with our courses"
          description="Practical, project-based courses on design, branding, and building for the web — learn at your own pace from people who do this every day."
        />

        {levels.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/courses" className={chipClass(!level)}>
              All levels
            </Link>
            {levels.map((l) => (
              <Link
                key={l}
                href={`/courses?level=${encodeURIComponent(l)}`}
                className={chipClass(level === l)}
              >
                {l}
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={level ? "🔍" : "🎓"}
            title={
              level
                ? `No ${level.toLowerCase()} courses yet`
                : "Courses coming soon"
            }
            description={
              level
                ? "Try a different level — or browse all courses below."
                : "New courses are on the way. Subscribe to the newsletter to hear about them first."
            }
            action={level ? { href: "/courses", label: "All courses" } : undefined}
          />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <FadeIn key={c.id} delay={Math.min(i, 5) * 40}>
                <CourseCard course={c} />
              </FadeIn>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/60">
          Looking for quick references and templates instead?{" "}
          <Link
            href="/library"
            className="font-semibold text-brand-600 hover:underline"
          >
            Visit the resource library →
          </Link>
        </div>
      </section>
    </div>
  );
}
