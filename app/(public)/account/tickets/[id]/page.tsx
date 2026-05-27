"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/api";
import { useCustomer, customerFetch } from "@/lib/customer";
import AccountShell from "@/components/account/AccountShell";
import Spinner, { LoadingBlock } from "@/components/Spinner";

interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: "open" | "replied" | "closed";
  lastReplyAt: string;
  createdAt: string;
}
interface Message {
  id: number;
  authorRole: "customer" | "admin";
  authorName: string;
  body: string;
  createdAt: string;
}
interface Thread {
  ticket: Ticket;
  messages: Message[];
}

const STATUS_TONE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  replied: "bg-sky-100 text-sky-800",
  closed: "bg-ink/10 text-ink/55",
};

export default function TicketThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AccountShell>
      <Body id={id} />
    </AccountShell>
  );
}

function Body({ id }: { id: string }) {
  const { user } = useCustomer();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await customerFetch(`/api/account/tickets/${id}`);
      if (res.ok) setThread(await res.json());
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const res = await customerFetch(`/api/account/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      if (res.ok) {
        setReply("");
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const close = async () => {
    if (!confirm("Mark this ticket as resolved?")) return;
    setClosing(true);
    try {
      const res = await customerFetch(`/api/account/tickets/${id}/close`, {
        method: "POST",
      });
      if (res.ok) await load();
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading conversation…" />;
  if (!thread)
    return (
      <div>
        <p className="text-sm text-red-600">Ticket not found.</p>
        <Link
          href="/account/tickets"
          className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
        >
          ← Back to tickets
        </Link>
      </div>
    );

  const { ticket, messages } = thread;
  const closed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/tickets"
          className="text-sm text-ink/50 hover:text-brand-600"
        >
          ← All tickets
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {ticket.subject}
            </h1>
            <p className="text-xs text-ink/55">
              {ticket.category} · opened {formatDate(ticket.createdAt)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_TONE[ticket.status]}`}
          >
            {ticket.status}
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border p-4 ${
              m.authorRole === "admin"
                ? "border-brand-100 bg-brand-50/40"
                : "border-ink/10 bg-white"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {m.authorName || (m.authorRole === "admin" ? "Support" : "You")}
                {m.authorRole === "admin" && (
                  <span className="ml-2 rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Staff
                  </span>
                )}
              </p>
              <span className="text-xs text-ink/45">
                {formatDate(m.createdAt)}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">
              {m.body}
            </p>
          </li>
        ))}
      </ul>

      {!closed ? (
        <form
          onSubmit={submit}
          className="space-y-3 rounded-2xl border border-ink/10 bg-white p-5"
        >
          <textarea
            required
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={close}
              disabled={closing}
              className="text-sm text-ink/55 hover:underline disabled:opacity-50"
            >
              {closing ? "Closing…" : "Mark as resolved"}
            </button>
            <button
              type="submit"
              disabled={submitting || !reply.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting && <Spinner size="sm" />}
              {submitting ? "Sending…" : "Send reply"}
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 text-center text-sm text-ink/55">
          This ticket is closed. Open a new ticket if you need more help.
        </p>
      )}
    </div>
  );
}
