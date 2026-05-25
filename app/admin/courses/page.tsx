"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch, imageUrl, formatPrice, type Course } from "@/lib/api";
import { getToken } from "@/lib/auth";
import EmptyState from "@/components/EmptyState";
import { SkeletonCards } from "@/components/Skeleton";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/courses", getToken() || "");
      if (!res.ok) throw new Error("Failed to load courses");
      setCourses((await res.json()) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (c: Course) => {
    if (!confirm(`Delete "${c.title}" and all its lessons?`)) return;
    const res = await adminFetch(
      `/api/admin/courses/${c.id}`,
      getToken() || "",
      { method: "DELETE" },
    );
    if (res.ok) setCourses((list) => list.filter((x) => x.id !== c.id));
    else alert("Could not delete.");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Courses
          </h1>
          <p className="text-sm text-ink/50">
            Click a course to open the LMS builder — basics, marketing,
            curriculum, pricing, and publishing in one place.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + New course
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && (
        <div className="mt-6">
          <SkeletonCards count={4} columns={2} />
        </div>
      )}

      {!loading && courses.length === 0 && (
        <EmptyState
          className="mt-8"
          icon="🎓"
          title="No courses yet"
          description="Create your first course — it'll start as a draft you can polish before publishing."
          action={{ href: "/admin/courses/new", label: "+ New course" }}
        />
      )}

      {!loading && courses.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <li
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link href={`/admin/courses/${c.id}`} className="block">
                <div className="aspect-[16/9] bg-ink/5">
                  {c.coverImage ? (
                    <img
                      src={imageUrl(c.coverImage)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-3xl font-semibold text-brand-300">
                      {c.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        c.status === "published"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800"
                      }
                    >
                      {c.status}
                    </span>
                    <span className="text-xs text-ink/50">{c.level}</span>
                    {c.category && (
                      <span className="text-xs text-ink/50">
                        · {c.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-semibold text-ink group-hover:text-brand-600">
                    {c.title}
                  </p>
                  {c.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink/55">
                      {c.summary}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-ink/65">
                    {c.priceCents > 0 ? formatPrice(c.priceCents) : "Free"}
                    {c.duration && (
                      <span className="text-ink/40"> · {c.duration}</span>
                    )}
                  </p>
                </div>
              </Link>
              <div className="flex justify-end gap-3 border-t border-ink/[0.06] px-4 py-2 text-sm">
                <Link
                  href={`/admin/courses/${c.id}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(c)}
                  className="text-red-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
