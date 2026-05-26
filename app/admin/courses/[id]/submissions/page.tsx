"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { adminFetch, resolveFileURL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";

interface AdminSubmission {
  id: number;
  taskId: number;
  userId: number;
  body: string;
  fileUrl: string;
  grade: "" | "passed" | "failed";
  feedback: string;
  submittedAt: string;
  gradedAt: string | null;
  graderId: number | null;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseId: number;
  taskPrompt: string;
  taskModule: string;
}

type FilterValue = "" | "pending" | "passed" | "failed";

const TABS: { value: FilterValue; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "", label: "All" },
];

export default function CourseSubmissionsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id;
  const [items, setItems] = useState<AdminSubmission[]>([]);
  const [filter, setFilter] = useState<FilterValue>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Local feedback drafts per submission so admins can write before
  // clicking Pass/Fail.
  const [feedback, setFeedback] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch(
        `/api/admin/courses/${courseId}/submissions`,
        getToken() || "",
      );
      if (!res.ok) throw new Error("Failed to load submissions");
      setItems((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const grade = async (id: number, value: "passed" | "failed") => {
    const res = await adminFetch(
      `/api/admin/submissions/${id}/grade`,
      getToken() || "",
      {
        method: "PUT",
        body: JSON.stringify({ grade: value, feedback: feedback[id] || "" }),
      },
    );
    if (!res.ok) {
      alert("Could not save grade");
      return;
    }
    load();
  };

  const filtered =
    filter === ""
      ? items
      : filter === "pending"
        ? items.filter((s) => s.grade === "")
        : items.filter((s) => s.grade === filter);

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
        Student responses to the module tasks on this course. Pass / fail
        with feedback to send the result back.
      </p>

      <div className="mt-5 inline-flex rounded-full border border-ink/15 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setFilter(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === t.value
                ? "bg-brand-500 text-white"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6">
          <SkeletonTableRows rows={4} columns={2} />
        </div>
      )}
      {error && !loading && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="📝"
          title="No submissions"
          description={
            filter === "pending"
              ? "Nothing to grade right now."
              : "No submissions match this filter yet."
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <ul className="mt-6 space-y-3">
          {filtered.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-ink/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                    Module: {s.taskModule}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {s.studentName}{" "}
                    <span className="text-xs font-normal text-ink/45">
                      ({s.studentEmail})
                    </span>
                  </p>
                </div>
                <span
                  className={
                    s.grade === "passed"
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                      : s.grade === "failed"
                        ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                        : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                  }
                >
                  {s.grade || "pending"}
                </span>
              </div>
              <p className="mt-3 text-xs text-ink/55">Prompt: {s.taskPrompt}</p>
              {s.body && (
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-ink/[0.03] p-3 text-sm text-ink/80">
                  {s.body}
                </p>
              )}
              {s.fileUrl && (
                <a
                  href={resolveFileURL(s.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:underline"
                >
                  📎 View attached file
                </a>
              )}

              <div className="mt-3 space-y-2">
                <textarea
                  rows={2}
                  defaultValue={s.feedback || ""}
                  onChange={(e) =>
                    setFeedback((m) => ({ ...m, [s.id]: e.target.value }))
                  }
                  placeholder="Feedback for the student (optional)"
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => grade(s.id, "passed")}
                    className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => grade(s.id, "failed")}
                    className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
                  >
                    Fail
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
