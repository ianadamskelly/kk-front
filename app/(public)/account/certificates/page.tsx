"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL, imageUrl, type Certificate } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import { SkeletonCards } from "@/components/Skeleton";

// "My Certificates" lists every course-completion certificate the user
// has earned, with download (PDF) and public verify/share links.
export default function AccountCertificatesPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  const [certs, setCerts] = useState<Certificate[] | null>(null);

  useEffect(() => {
    if (!user) return;
    customerFetch(`/api/account/certificates`)
      .then(async (r) => (r.ok ? ((await r.json()) as Certificate[]) : []))
      .then(setCerts);
  }, [user]);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          My certificates
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Download your completion certificates as PDFs, or share a verified
          link anyone can authenticate.
        </p>
      </header>

      {certs === null ? (
        <SkeletonCards count={2} columns={2} />
      ) : certs.length === 0 ? (
        <EmptyState
          icon="🎖️"
          title="No certificates yet"
          description="Finish a course — including any required assignments — and your certificate appears here automatically."
          action={{ href: "/account/courses", label: "Go to my courses" }}
          secondaryAction={{ href: "/courses", label: "Browse courses" }}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {certs.map((cert) => {
            const downloadURL = `${API_URL}/api/cert/${cert.code}/download`;
            return (
              <li
                key={cert.id}
                className="overflow-hidden rounded-2xl border border-ink/10 bg-white"
              >
                <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-100 to-brand-50">
                  {cert.courseCover ? (
                    <img
                      src={imageUrl(cert.courseCover)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">
                      🎓
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-700 shadow-sm">
                    🎖️ Certified
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                    Certificate of Completion
                  </p>
                  <p className="mt-1 text-base font-semibold text-ink">
                    {cert.courseTitle || `Course #${cert.courseId}`}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    Issued {fmtDate(cert.issuedAt)}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-ink/40">
                    ID: {cert.code}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={downloadURL}
                      className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                    >
                      ⬇ Download PDF
                    </a>
                    <Link
                      href={`/cert/${cert.code}`}
                      className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:border-brand-300 hover:text-ink"
                    >
                      View / share
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
