import type { Metadata } from "next";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface CertificateView {
  code: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
}

async function fetchCertificate(code: string): Promise<CertificateView | null> {
  try {
    const res = await fetch(`${API_URL}/api/cert/${encodeURIComponent(code)}`, {
      // Verify pages are share targets; revalidate occasionally rather
      // than on every visitor hit. 10 min is plenty.
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CertificateView;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const cert = await fetchCertificate(code);
  if (!cert) {
    return { title: "Certificate not found" };
  }
  return {
    title: `${cert.studentName} — ${cert.courseTitle}`,
    description: `Verified certificate of completion for ${cert.courseTitle}, issued by Kuza Kizazi.`,
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cert = await fetchCertificate(code);

  if (!cert) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
          Not found
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          We couldn&apos;t verify this certificate
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          The certificate code <code className="font-mono">{code}</code> is not
          recognised. Check that the link is correct.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Back to Kuza Kizazi
        </Link>
      </main>
    );
  }

  const issued = new Date(cert.issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const downloadURL = `${API_URL}/api/cert/${cert.code}/download`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-3xl border border-ink/10 bg-white p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Verified · Certificate of Completion
        </p>
        <p className="mt-6 text-sm text-ink/55">This certifies that</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          {cert.studentName}
        </h1>
        <p className="mt-4 text-sm text-ink/55">has successfully completed</p>
        <p className="mt-2 text-2xl font-semibold text-ink">{cert.courseTitle}</p>
        <p className="mt-4 text-sm text-ink/55">on {issued}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={downloadURL}
            className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            ⬇ Download PDF
          </a>
          <Link
            href="/courses"
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink/70 hover:bg-ink/5"
          >
            Browse our courses
          </Link>
        </div>

        <p className="mt-8 text-xs text-ink/45">
          Certificate ID: <span className="font-mono">{cert.code}</span>
        </p>
      </div>
    </main>
  );
}
