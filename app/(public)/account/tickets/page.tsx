"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import EmptyState from "@/components/EmptyState";
import Spinner, { LoadingBlock } from "@/components/Spinner";

interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: "open" | "replied" | "closed";
  lastReplyAt: string;
  createdAt: string;
  messageCount: number;
}

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "order", label: "Order issue" },
  { value: "course", label: "Course problem" },
  { value: "payment", label: "Payment / billing" },
  { value: "complaint", label: "Complaint" },
];

const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  replied: "bg-sky-100 text-sky-800",
  closed: "bg-ink/10 text-ink/55",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function AccountTicketsPage() {
  return (
    <AccountShell>
      <Body />
    </AccountShell>
  );
}

function Body() {
  const { user } = useCustomer();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    body: "",
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await customerFetch(`/api/account/tickets`);
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await customerFetch(`/api/account/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit");
      setShowForm(false);
      setForm({ subject: "", category: "general", body: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Complaints</h1>
          <p className="mt-1 text-sm text-ink/55">
            Raise a ticket for any issue — we&apos;ll get back to you here and
            by email.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New ticket
          </button>
        )}
      </header>

      {showForm && (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6"
        >
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div>
              <label className="text-sm font-medium text-ink/70">Subject</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={inputClass}
                placeholder="Short summary of the issue"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Message</label>
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="What's happening? Include any order or course details."
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting && <Spinner size="sm" />}
              {submitting ? "Sending…" : "Submit ticket"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink/70 hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingBlock label="Loading tickets…" />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No tickets yet"
          description="Stuck on something? Open a ticket and our team will reply by email and in your account."
          action={
            !showForm
              ? { onClick: () => setShowForm(true), label: "+ New ticket" }
              : undefined
          }
        />
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/account/tickets/${t.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 transition hover:border-brand-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {t.subject}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/55">
                    {t.category} · {t.messageCount} message
                    {t.messageCount === 1 ? "" : "s"} · last activity{" "}
                    {formatDate(t.lastReplyAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[t.status]}`}
                >
                  {t.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
