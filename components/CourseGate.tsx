"use client";

import { useEffect, useState } from "react";
import { type Course } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import CourseCurriculum from "@/components/CourseCurriculum";
import CoursePaywall from "@/components/CoursePaywall";
import LessonView from "@/components/LessonView";
import ResourceList from "@/components/ResourceList";

// useUnlockedCourse re-fetches /api/courses/{slug} with the user's
// session cookie so we can tell whether the requester is a member or
// owns the course. For free courses the SSR copy is already unlocked;
// otherwise we wait for the auth check to settle before re-rendering.
function useUnlockedCourse(initial: Course): Course {
  const { user, loading } = useCustomer();
  const [course, setCourse] = useState<Course>(initial);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!initial.locked) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await customerFetch(
          `/api/courses/${encodeURIComponent(initial.slug)}`,
        );
        if (!res.ok) return;
        const fresh = (await res.json()) as Course;
        if (!cancelled) setCourse(fresh);
      } catch {
        // Fall back to the SSR-rendered (locked) view.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, initial.locked, initial.slug]);

  return course;
}

// CurriculumGate is rendered on the course detail page. It shows either the
// paywall (locked + not entitled) or the full curriculum.
export function CurriculumGate({ initialCourse }: { initialCourse: Course }) {
  const course = useUnlockedCourse(initialCourse);
  const locked = course.locked === true && course.entitled === false;
  if (locked) return <CoursePaywall course={course} />;
  if (course.lessons.length === 0) {
    return <p className="text-sm text-ink/55">Lessons coming soon.</p>;
  }
  return (
    <CourseCurriculum
      courseSlug={course.slug}
      lessons={course.lessons}
      tasks={course.tasks}
    />
  );
}

export function CourseResourceGate({ initialCourse }: { initialCourse: Course }) {
  const course = useUnlockedCourse(initialCourse);
  if (!course.resources || course.resources.length === 0) return null;
  return (
    <div className="mt-12 max-w-3xl">
      <ResourceList title="Course resources" resources={course.resources} />
    </div>
  );
}

// LessonGate is rendered on a lesson page. It picks the same-slug lesson
// from the re-fetched course so members/buyers see real content/video.
export function LessonGate({
  initialCourse,
  lessonSlug,
}: {
  initialCourse: Course;
  lessonSlug: string;
}) {
  const course = useUnlockedCourse(initialCourse);
  const locked = course.locked === true && course.entitled === false;
  if (locked) return <CoursePaywall course={course} />;

  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-ink/55">
        Lesson not found.
      </p>
    );
  }
  return <LessonView course={course} lesson={lesson} />;
}
