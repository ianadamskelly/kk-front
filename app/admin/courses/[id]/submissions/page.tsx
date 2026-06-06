"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import SubmissionsInbox from "@/components/admin/SubmissionsInbox";

export default function CourseSubmissionsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link
        href={`/admin/courses/${courseId}`}
        className="text-xs font-semibold text-ink/45 hover:text-brand-600"
      >
        ← Back to course
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
        Submissions
      </h1>
      <p className="text-sm text-ink/50">
        Student responses to the module tasks on this course. Pass / fail with
        feedback to send the result back.
      </p>

      <div className="mt-5">
        {courseId && (
          <SubmissionsInbox
            endpoint={`/api/admin/courses/${courseId}/submissions`}
          />
        )}
      </div>
    </div>
  );
}
