"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { LoadingBlock } from "@/components/Spinner";

// Creates an empty draft course as soon as the page loads, then redirects
// to /admin/courses/{id} where the wizard takes over. Modelled after how
// Udemy/Thinkific "New course" flow works — the course exists in the DB
// from step 1, so partial progress is never lost.
export default function NewCoursePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  // Prevent React Strict Mode's double-mount from creating two drafts.
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;

    (async () => {
      try {
        const res = await adminFetch("/api/admin/courses", getToken() || "", {
          method: "POST",
          body: JSON.stringify({
            title: "Untitled course",
            status: "draft",
            level: "Beginner",
            language: "English",
            sortOrder: 0,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not create course");
        router.replace(`/admin/courses/${data.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      }
    })();
  }, [router]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      {error ? (
        <>
          <p className="text-sm font-semibold uppercase tracking-widest text-red-700">
            Couldn&apos;t start a new course
          </p>
          <p className="mt-2 text-ink/65">{error}</p>
          <Link
            href="/admin/courses"
            className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Back to courses
          </Link>
        </>
      ) : (
        <LoadingBlock label="Setting up your draft course…" />
      )}
    </div>
  );
}
