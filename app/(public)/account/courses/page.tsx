"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, imageUrl, type Course } from "@/lib/api";
import { useCustomer } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import { SkeletonCards } from "@/components/Skeleton";

// "My Courses" shows everything the user has access to: courses they
// bought outright, free courses, and (for members) the whole catalogue.
export default function AccountCoursesPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { token } = useCustomer();
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/account/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? ((await r.json()) as Course[]) : []))
      .then(setCourses);
  }, [token]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">My courses</h1>
        <p className="mt-1 text-sm text-ink/55">
          Courses you&apos;ve enrolled in. Members get access to the full
          catalogue automatically.
        </p>
      </header>

      {courses === null ? (
        <SkeletonCards count={4} columns={2} />
      ) : courses.length === 0 ? (
        <EmptyState
          icon="🎓"
          title="No courses yet"
          description="Enrol in a course to start learning. Members unlock everything in one go."
          action={{ href: "/courses", label: "Browse courses" }}
          secondaryAction={{ href: "/membership", label: "Become a member" }}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <li
              key={c.id}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-md"
            >
              <Link href={`/courses/${c.slug}`} className="block">
                <div className="aspect-[16/9] bg-ink/5">
                  {c.coverImage ? (
                    <img
                      src={imageUrl(c.coverImage)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-3xl font-semibold text-brand-300">
                      {c.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                    {c.level}
                    {c.duration && (
                      <span className="text-ink/40"> · {c.duration}</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {c.title}
                  </p>
                  {c.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-ink/55">
                      {c.summary}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
