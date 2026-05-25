"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, formatDate } from "@/lib/api";
import { useCustomer } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import Spinner, { LoadingBlock } from "@/components/Spinner";

interface Testimonial {
  id: number;
  author: string;
  role: string;
  company: string;
  quote: string;
  status: "pending" | "published" | "archived";
  submittedAt: string | null;
}

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-ink/10 text-ink/55",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function AccountTestimonialsPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { token } = useCustomer();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ role: "", company: "", quote: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/account/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/account/testimonials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      setForm({ role: "", company: "", quote: "" });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Testimonials</h1>
        <p className="mt-1 text-sm text-ink/55">
          Share your experience with Kuza Kizazi. Our team reviews each
          submission before publishing it on the website.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-500">
          Share your story
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink/70">
              Your role (optional)
            </label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Founder, Designer"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">
              Company (optional)
            </label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">
            Your testimonial
          </label>
          <textarea
            required
            rows={5}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            placeholder="What did Kuza Kizazi help you with? How did it go?"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/45">
            Minimum 20 characters. Plain text — no formatting needed.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || form.quote.trim().length < 20}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting && <Spinner size="sm" />}
            {submitting ? "Sending…" : "Submit for review"}
          </button>
          {savedFlash && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Submitted — pending review
            </span>
          )}
        </div>
      </form>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink/65">
          Your submissions
        </h2>
        {loading ? (
          <div className="mt-3">
            <LoadingBlock label="Loading testimonials…" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon="⭐"
            title="No testimonials yet"
            description="Share one above. Once approved by our team it'll appear on the website's homepage."
          />
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((t) => (
              <li
                key={t.id}
                className="rounded-2xl border border-ink/10 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-ink/55">
                    Submitted {t.submittedAt && formatDate(t.submittedAt)}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[t.status]}`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="mt-3 italic text-ink/80">&ldquo;{t.quote}&rdquo;</p>
                {(t.role || t.company) && (
                  <p className="mt-2 text-xs text-ink/55">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
