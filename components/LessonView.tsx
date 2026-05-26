"use client";

import Link from "next/link";
import { Course, Lesson } from "@/lib/api";
import { useCourseProgress } from "@/lib/progress";
import { useTheme } from "@/lib/theme";
import ContentHTML from "@/components/ContentHTML";
import ThemeToggle from "@/components/ThemeToggle";
import ResourceList from "@/components/ResourceList";

export default function LessonView({
  course,
  lesson,
}: {
  course: Course;
  lesson: Lesson;
}) {
  const lessons = course.lessons || [];
  const { isComplete, setComplete, loaded } = useCourseProgress(course.slug);
  const { theme, toggle: toggleTheme } = useTheme();

  const index = lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;
  const complete = loaded && isComplete(lesson.slug);

  return (
    // Scope dark mode to the lesson surface; the rest of the public
    // site stays light. The min-h is so the kk-dark surface fills
    // the viewport even on short lessons.
    <div
      className={`min-h-[calc(100vh-4rem)] bg-cream text-ink ${theme === "dark" ? "kk-dark" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href={`/courses/${course.slug}`}
        className="text-sm text-ink/50 hover:text-brand-600"
      >
        ← {course.title}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Curriculum sidebar */}
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-widest text-ink/40">
            Lessons
          </p>
          <ol className="mt-2 space-y-0.5">
            {lessons.map((l, i) => {
              const active = l.id === lesson.id;
              const done = loaded && isComplete(l.slug);
              return (
                <li key={l.id}>
                  <Link
                    href={`/courses/${course.slug}/${l.slug}`}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                      active
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-ink/70 hover:bg-ink/5"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        done
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-ink/25 text-ink/40"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="flex-1">{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Lesson content */}
        <article>
          {lesson.module && (
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              {lesson.module}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-2 text-sm text-ink/45">
            Lesson {index + 1} of {lessons.length}
            {lesson.duration && ` · ${lesson.duration}`}
          </p>

          {lesson.videoUrl && (
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-ink/10 bg-ink">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {lesson.content && (
            <ContentHTML html={lesson.content} className="mt-6" />
          )}

          {lesson.resources && lesson.resources.length > 0 && (
            <ResourceList
              className="mt-8"
              title="Lesson resources"
              resources={lesson.resources}
            />
          )}

          <div className="mt-8 border-t border-ink/10 pt-6">
            <button
              type="button"
              onClick={() => setComplete(lesson.slug, !complete)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
                complete
                  ? "border border-brand-500 text-brand-600 hover:bg-brand-50"
                  : "bg-brand-500 text-white hover:bg-brand-600"
              }`}
            >
              {complete ? "✓ Completed — undo" : "Mark lesson complete"}
            </button>
          </div>

          <nav className="mt-8 flex items-center justify-between gap-4">
            {prev ? (
              <Link
                href={`/courses/${course.slug}/${prev.slug}`}
                className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink/70 hover:border-brand-400"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/courses/${course.slug}/${next.slug}`}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85"
              >
                {next.title} →
              </Link>
            ) : (
              <Link
                href={`/courses/${course.slug}`}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink/85"
              >
                Finish course →
              </Link>
            )}
          </nav>
        </article>
      </div>
      {/* Floating theme toggle so a student can flip dark mode while
          reading without bouncing back to the admin. */}
      <div className="fixed bottom-6 right-6 z-40">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
      </div>
    </div>
  );
}
