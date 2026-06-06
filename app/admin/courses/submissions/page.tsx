"use client";

import SubmissionsInbox from "@/components/admin/SubmissionsInbox";

// Global grading inbox — every course's task submissions in one place,
// reachable from the admin sidebar (Learn → Submissions) so grading no
// longer means re-entering a course's editor. Filter by course + status.
export default function AllSubmissionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Submissions
      </h1>
      <p className="text-sm text-ink/50">
        Student responses to module tasks across every course. Pass / fail with
        feedback to send the result back.
      </p>

      <div className="mt-5">
        <SubmissionsInbox endpoint="/api/admin/course-submissions" showCourseFilter />
      </div>
    </div>
  );
}
