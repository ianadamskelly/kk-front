"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminFetch, type Course } from "@/lib/api";
import { getToken } from "@/lib/auth";
import CourseWizard from "@/components/CourseWizard";
import { LoadingBlock } from "@/components/Spinner";

// /admin/courses/[id] hosts the full LMS course-builder wizard. The wizard
// itself handles all the actual editing — this page just fetches the
// course and its lessons, then hands them to the wizard.
export default function CourseEditorPage() {
  const params = useParams();
  const courseId = String(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminFetch(
          `/api/admin/courses/${courseId}`,
          getToken() || "",
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "Course not found" : "Failed to load course",
          );
        }
        const data: Course = await res.json();
        setCourse(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <LoadingBlock label="Loading course…" />
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-700">
          Couldn&apos;t load course
        </p>
        <p className="mt-2 text-ink/65">
          {error || "We couldn't find that course."}
        </p>
        <Link
          href="/admin/courses"
          className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Back to courses
        </Link>
      </div>
    );
  }

  return <CourseWizard initialCourse={course} />;
}
