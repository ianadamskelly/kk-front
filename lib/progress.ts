"use client";

import { useCallback, useEffect, useState } from "react";

// useCourseProgress tracks completed lessons for a course in localStorage.
// Server-side enrolment and progress arrive with customer accounts (Phase 4).
export function useCourseProgress(courseSlug: string) {
  const key = `kk_progress_${courseSlug}`;
  const [completed, setCompleted] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      // Ignore malformed storage.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(completed));
  }, [key, completed, loaded]);

  const isComplete = useCallback(
    (lessonSlug: string) => completed.includes(lessonSlug),
    [completed],
  );

  const toggle = useCallback((lessonSlug: string) => {
    setCompleted((current) =>
      current.includes(lessonSlug)
        ? current.filter((s) => s !== lessonSlug)
        : [...current, lessonSlug],
    );
  }, []);

  const setComplete = useCallback((lessonSlug: string, value: boolean) => {
    setLoaded(true);
    setCompleted((current) => {
      if (value) {
        return current.includes(lessonSlug)
          ? current
          : [...current, lessonSlug];
      }
      return current.filter((s) => s !== lessonSlug);
    });
  }, []);

  return { completed, loaded, isComplete, toggle, setComplete };
}
