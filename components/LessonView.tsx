"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  API_URL,
  type Certificate,
  type Course,
  type CourseTaskSubmission,
  type Lesson,
} from "@/lib/api";
import { useCourseProgress } from "@/lib/progress";
import { useCustomer, customerFetch } from "@/lib/customer";
import { useTheme } from "@/lib/theme";
import { lessonVideo } from "@/lib/video";
import ContentHTML from "@/components/ContentHTML";
import ThemeToggle from "@/components/ThemeToggle";
import ResourceList from "@/components/ResourceList";
import ModuleTask from "@/components/ModuleTask";

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
  const { user } = useCustomer();

  const index = lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;
  const complete = loaded && isComplete(lesson.slug);
  const video = lessonVideo(lesson.videoUrl);

  // Is this the last lesson of its module? Used to decide whether
  // the end-of-module task widget should appear at the bottom.
  const isLastInModule =
    !next || next.module !== lesson.module;

  // Tasks come from the course payload so the assignment is visible even
  // before (or without) the account fetch — including for signed-out
  // visitors, who then get a "sign in to submit" prompt. The account
  // fetch only layers in the student's own submissions.
  const courseTasks = course.tasks || [];
  const [subs, setSubs] = useState<Record<number, CourseTaskSubmission>>({});
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    customerFetch(`/api/account/courses/${course.slug}/tasks`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const byTask: Record<number, CourseTaskSubmission> = {};
        for (const s of (data.submissions || []) as CourseTaskSubmission[]) {
          byTask[s.taskId] = s;
        }
        setSubs(byTask);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [course.slug, user]);

  // --- Completion → certificate auto-claim ---
  // Lesson progress lives in the browser, so the client decides when the
  // course is finished and asks the server to issue the certificate. The
  // server still validates access + required tasks.
  const allComplete =
    loaded && lessons.length > 0 && lessons.every((l) => isComplete(l.slug));
  const claimedKey = `kk_cert_claimed_${course.slug}`;
  const claimingRef = useRef(false);
  const [certCode, setCertCode] = useState<string | null>(null);
  const [claimNote, setClaimNote] = useState("");

  // Surface an already-earned certificate so the banner persists on
  // revisits without re-hitting the API.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(claimedKey);
      if (saved) setCertCode(saved);
    } catch {
      // ignore storage access errors
    }
  }, [claimedKey]);

  useEffect(() => {
    if (!allComplete || !user || certCode || claimingRef.current) return;
    try {
      if (localStorage.getItem(claimedKey)) return;
    } catch {
      // ignore
    }
    claimingRef.current = true;
    customerFetch(`/api/account/courses/${course.slug}/complete`, {
      method: "POST",
    })
      .then(async (r) => {
        if (r.ok) {
          const c = (await r.json()) as Certificate;
          try {
            localStorage.setItem(claimedKey, c.code);
          } catch {
            // ignore
          }
          setCertCode(c.code);
          setClaimNote("");
        } else if (r.status === 409) {
          setClaimNote(
            "Finish and pass the required assignments to unlock your certificate.",
          );
        }
      })
      .catch(() => undefined)
      .finally(() => {
        claimingRef.current = false;
      });
  }, [allComplete, user, course.slug, certCode, claimedKey]);

  // Modules that carry a task, so the sidebar can show a navigable
  // "Assignment" entry under each one.
  const modulesWithTask = new Set(
    courseTasks.map((t) => t.module).filter(Boolean),
  );

  const moduleTasks = isLastInModule
    ? courseTasks.filter((t) => t.module === lesson.module)
    : [];

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
              // The assignment lives on the last lesson of its module, so
              // show a navigable entry right after it.
              const lastInModule =
                i === lessons.length - 1 || lessons[i + 1].module !== l.module;
              const showAssignment =
                lastInModule && !!l.module && modulesWithTask.has(l.module);
              const moduleSubs = courseTasks
                .filter((t) => t.module === l.module)
                .map((t) => subs[t.id])
                .filter(Boolean) as CourseTaskSubmission[];
              const passed = moduleSubs.some((s) => s.grade === "passed");
              const submitted = moduleSubs.length > 0;
              return (
                <Fragment key={l.id}>
                  <li>
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
                  {showAssignment && (
                    <li>
                      <Link
                        href={`/courses/${course.slug}/${l.slug}#assignment`}
                        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                          active
                            ? "bg-brand-50/70 font-medium text-brand-700"
                            : "text-ink/60 hover:bg-ink/5"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                            passed
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-brand-300 text-brand-500"
                          }`}
                        >
                          {passed ? "✓" : "📝"}
                        </span>
                        <span className="flex-1">Assignment</span>
                        {submitted && !passed && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                            sent
                          </span>
                        )}
                      </Link>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </aside>

        {/* Lesson content */}
        <article>
          {certCode && (
            <div className="mb-6 rounded-2xl border border-brand-300 bg-brand-50 p-4">
              <p className="text-sm font-semibold text-brand-800">
                🎓 Certificate unlocked!
              </p>
              <p className="mt-1 text-xs text-ink/65">
                You&apos;ve completed this course. Download your certificate or
                share the verified copy.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`${API_URL}/api/cert/${certCode}/download`}
                  className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  ⬇ Download PDF
                </a>
                <Link
                  href={`/cert/${certCode}`}
                  className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 hover:border-brand-300 hover:text-ink"
                >
                  View / share
                </Link>
                <Link
                  href="/account/certificates"
                  className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 hover:border-brand-300 hover:text-ink"
                >
                  All certificates
                </Link>
              </div>
            </div>
          )}
          {!certCode && claimNote && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              {claimNote}
            </div>
          )}
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

          {video && (
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-ink/10 bg-ink">
              {video.kind === "file" ? (
                <video
                  src={video.src}
                  title={lesson.title}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full"
                />
              ) : (
                <iframe
                  src={video.src}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full"
                />
              )}
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

          {moduleTasks.length > 0 && (
            <div id="assignment" className="mt-10 scroll-mt-24 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
                {moduleTasks.length === 1 ? "Module assignment" : "Module assignments"}
              </h2>
              {moduleTasks.map((t) => (
                <ModuleTask
                  key={t.id}
                  task={t}
                  existing={subs[t.id]}
                  onSaved={(s) => setSubs((m) => ({ ...m, [s.taskId]: s }))}
                />
              ))}
            </div>
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
