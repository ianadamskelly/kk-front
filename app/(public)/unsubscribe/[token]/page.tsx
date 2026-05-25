"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { LoadingBlock } from "@/components/Spinner";
import Spinner from "@/components/Spinner";

interface Preview {
  email: string;
  alreadyUnsubbed: boolean;
}

// /unsubscribe/[token] confirms the recipient before flipping the flag.
// Showing a confirmation step avoids accidental unsubscribes from email
// clients that prefetch links.
export default function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/unsubscribe/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "This unsubscribe link is not valid.");
          return;
        }
        setPreview(data);
        if (data.alreadyUnsubbed) setDone(true);
      })
      .catch(() => setError("Could not reach the server."))
      .finally(() => setLoading(false));
  }, [token]);

  const confirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/unsubscribe/${encodeURIComponent(token)}`,
        { method: "POST" },
      );
      if (res.ok) setDone(true);
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not unsubscribe.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <LoadingBlock label="Checking your link…" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Link not valid
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          {error ||
            "This unsubscribe link is not recognised. It may have already been used."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      {done ? (
        <>
          <p className="text-3xl">👋</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            You&apos;ve been unsubscribed
          </h1>
          <p className="mt-3 text-sm text-ink/55">
            <span className="font-medium text-ink">{preview.email}</span> will
            no longer receive newsletters from Kuza Kizazi. We&apos;re sorry to
            see you go.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Back to home
          </Link>
        </>
      ) : (
        <>
          <p className="text-3xl">✉️</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Unsubscribe from newsletters
          </h1>
          <p className="mt-3 text-sm text-ink/65">
            We&apos;ll stop sending newsletters to{" "}
            <span className="font-medium text-ink">{preview.email}</span>.
            Transactional emails (order confirmations, password resets) will
            still come through.
          </p>
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting && <Spinner size="sm" />}
            {submitting ? "Unsubscribing…" : "Yes, unsubscribe"}
          </button>
          <p className="mt-3 text-xs text-ink/45">
            Changed your mind?{" "}
            <Link href="/" className="text-brand-600 hover:underline">
              Just close this page
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
