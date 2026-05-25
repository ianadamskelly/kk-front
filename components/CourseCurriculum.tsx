"use client";

import Link from "next/link";
import { Lesson } from "@/lib/api";
import { useCourseProgress } from "@/lib/progress";

interface Group {
  module: string;
  items: Lesson[];
}

function group(lessons: Lesson[]): Group[] {
  const groups: Group[] = [];
  for (const lesson of lessons) {
    let g = groups.find((x) => x.module === lesson.module);
    if (!g) {
      g = { module: lesson.module, items: [] };
      groups.push(g);
    }
    g.items.push(lesson);
  }
  return groups;
}

export default function CourseCurriculum({
  courseSlug,
  lessons,
}: {
  courseSlug: string;
  lessons: Lesson[];
}) {
  const { isComplete, loaded } = useCourseProgress(courseSlug);
  const groups = group(lessons);
  const done = loaded
    ? lessons.filter((l) => isComplete(l.slug)).length
    : 0;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">Course content</span>
        <span className="text-ink/50">
          {done} of {lessons.length} complete
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-6 space-y-6">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.module && (
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                {g.module}
              </h3>
            )}
            <ul className="mt-2 divide-y divide-ink/[0.07] rounded-2xl border border-ink/10 bg-white">
              {g.items.map((lesson) => {
                const complete = loaded && isComplete(lesson.slug);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${courseSlug}/${lesson.slug}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-ink/[0.02]"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                          complete
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-ink/20 text-ink/30"
                        }`}
                      >
                        {complete ? "✓" : ""}
                      </span>
                      <span className="flex-1 font-medium text-ink">
                        {lesson.title}
                      </span>
                      {lesson.duration && (
                        <span className="text-xs text-ink/40">
                          {lesson.duration}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
